const { Customer, ShopCustomer, RepairTicket, User, Subscription } = require('../models');
const { getPlan } = require('../config/plans');
const { normalizePhone } = require('../utils/phone');

const VALID_STATUSES = [
  'RECEIVED',
  'DIAGNOSING',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED'
];

async function generateTicketNumber(workspaceId) {
  const count = await RepairTicket.countDocuments({ workspace: workspaceId });
  let num = 1001 + count;
  let candidate = `FF-${num}`;

  while (await RepairTicket.findOne({ ticketNumber: candidate })) {
    num++;
    candidate = `FF-${num}`;
  }

  return candidate;
}

async function findOrCreateCustomer(workspaceId, customerName, rawPhone) {
  const phoneToNormalize = (rawPhone && rawPhone.trim()) ? rawPhone.trim() : '0000000000';
  const phoneRes = normalizePhone(phoneToNormalize);
  if (!phoneRes.isValid) {
    throw new Error(`Invalid customer phone number: ${phoneRes.error}`);
  }

  const phoneE164 = phoneRes.e164;
  const name = (customerName && customerName.trim()) ? customerName.trim() : 'Walk-in Customer';

  let customer = await Customer.findOne({ phoneE164 });
  let isNewCustomer = false;

  if (!customer) {
    customer = await Customer.create({
      phoneE164,
      defaultName: name,
      isVerified: false
    });
    isNewCustomer = true;
  }

  // Ensure shop_customer relationship exists
  await ShopCustomer.findOneAndUpdate(
    { workspace: workspaceId, customer: customer._id },
    {
      $set: { lastSeenAt: new Date(), shopDisplayName: name },
      $setOnInsert: { firstSeenAt: new Date() }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return { customer, isNewCustomer };
}

async function createTicket(workspaceId, operatorUser, ticketData) {
  const {
    customerName,
    customerPhone,
    deviceCategory,
    brand,
    model,
    issueDescription,
    estimatedCost,
    estimatedCompletionDate,
    assignedToUserId,
    assignedStaffName,
    assignedStaffPhone
  } = ticketData;

  // Defaults for non-compulsory fields
  const safeCategory = (deviceCategory && deviceCategory.trim()) || 'Smartphone';
  const safeBrand = (brand && brand.trim()) || 'Generic';
  const safeModel = (model && model.trim()) || 'Device';
  const safeIssue = (issueDescription && issueDescription.trim()) || 'General Inspection & Diagnostics';

  const subscription = await Subscription.findOne({ workspace: workspaceId });
  const currentPlan = getPlan(subscription ? subscription.planId : 'free');
  if (!currentPlan.unlimitedTickets) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const ticketsCreatedThisMonth = await RepairTicket.countDocuments({
      workspace: workspaceId,
      createdAt: { $gte: monthStart }
    });

    if (ticketsCreatedThisMonth >= currentPlan.maxTicketsPerMonth) {
      throw new Error(
        `${currentPlan.name} plan allows up to ${currentPlan.maxTicketsPerMonth} repair tickets per month. Please upgrade your plan to create another ticket.`
      );
    }
  }

  // 1. Resolve or create global customer (friendly fallback if not provided)
  const { customer, isNewCustomer } = await findOrCreateCustomer(
    workspaceId,
    customerName,
    customerPhone
  );

  // 2. Validate technician if assigned via ID or direct fields
  let assignedStaff = null;
  let finalStaffName = (assignedStaffName && assignedStaffName.trim()) || '';
  let finalStaffPhone = (assignedStaffPhone && assignedStaffPhone.trim()) || '';

  if (assignedToUserId) {
    assignedStaff = await User.findOne({ _id: assignedToUserId, workspace: workspaceId, isActive: true });
    if (assignedStaff) {
      if (!finalStaffName) finalStaffName = assignedStaff.name;
    }
  }

  // If staff phone is provided, normalize if possible
  if (finalStaffPhone) {
    const sPhoneNorm = normalizePhone(finalStaffPhone);
    if (sPhoneNorm.isValid) {
      finalStaffPhone = sPhoneNorm.e164;
    }
  }

  const ticketNumber = await generateTicketNumber(workspaceId);
  const cost = estimatedCost !== undefined && estimatedCost !== null && !isNaN(Number(estimatedCost)) 
    ? Number(estimatedCost) 
    : 0;

  const ticket = await RepairTicket.create({
    ticketNumber,
    workspace: workspaceId,
    customer: customer._id,
    deviceCategory: safeCategory,
    brand: safeBrand,
    model: safeModel,
    issueDescription: safeIssue,
    estimatedCost: cost,
    estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
    status: 'RECEIVED',
    assignedTo: assignedStaff ? assignedStaff._id : null,
    assignedStaffName: finalStaffName,
    assignedStaffPhone: finalStaffPhone,
    timeline: [{
      fromStatus: null,
      toStatus: 'RECEIVED',
      notes: 'Repair ticket intake created at shop.',
      changedBy: operatorUser._id || operatorUser.id,
      createdAt: new Date()
    }]
  });

  return {
    id: ticket._id.toString(),
    ticketNumber: ticket.ticketNumber,
    workspaceId: workspaceId.toString(),
    customerId: customer._id.toString(),
    customerName: customer.defaultName,
    customerPhone: customer.phoneE164,
    deviceCategory: ticket.deviceCategory,
    brand: ticket.brand,
    model: ticket.model,
    issueDescription: ticket.issueDescription,
    estimatedCost: ticket.estimatedCost,
    estimatedCompletionDate: ticket.estimatedCompletionDate,
    status: ticket.status,
    assignedToUserId: assignedStaff ? assignedStaff._id.toString() : null,
    assignedStaffName: ticket.assignedStaffName,
    assignedStaffPhone: ticket.assignedStaffPhone,
    isNewCustomer
  };
}

async function listWorkspaceTickets(workspaceId, filters = {}) {
  const query = { workspace: workspaceId };

  if (filters.status && VALID_STATUSES.includes(filters.status.toUpperCase())) {
    query.status = filters.status.toUpperCase();
  }

  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }

  let tickets = await RepairTicket.find(query)
    .populate('customer', 'defaultName phoneE164')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });

  if (filters.search) {
    const s = filters.search.toLowerCase();
    tickets = tickets.filter(t => {
      const matchNum = t.ticketNumber && t.ticketNumber.toLowerCase().includes(s);
      const matchBrand = t.brand && t.brand.toLowerCase().includes(s);
      const matchModel = t.model && t.model.toLowerCase().includes(s);
      const matchCust = t.customer && (t.customer.defaultName.toLowerCase().includes(s) || t.customer.phoneE164.includes(s));
      return matchNum || matchBrand || matchModel || matchCust;
    });
  }

  return tickets.map(t => ({
    id: t._id.toString(),
    ticket_number: t.ticketNumber,
    workspace_id: t.workspace.toString(),
    customer_id: t.customer ? t.customer._id.toString() : null,
    customer_name: t.customer ? t.customer.defaultName : 'Unknown',
    customer_phone: t.customer ? t.customer.phoneE164 : '',
    device_category: t.deviceCategory,
    brand: t.brand,
    model: t.model,
    issue_description: t.issueDescription,
    estimated_cost: t.estimatedCost,
    estimated_completion_date: t.estimatedCompletionDate,
    status: t.status,
    assigned_to_name: t.assignedStaffName || (t.assignedTo ? t.assignedTo.name : 'Unassigned'),
    assigned_staff_name: t.assignedStaffName || (t.assignedTo ? t.assignedTo.name : ''),
    assigned_staff_phone: t.assignedStaffPhone || '',
    created_at: t.createdAt,
    updated_at: t.updatedAt
  }));
}

async function getTicketById(workspaceId, ticketId) {
  const ticket = await RepairTicket.findOne({ _id: ticketId, workspace: workspaceId })
    .populate('customer', 'defaultName phoneE164')
    .populate('assignedTo', 'name email')
    .populate('timeline.changedBy', 'name');

  if (!ticket) {
    throw new Error('Repair ticket not found in this workspace.');
  }

  const shopCust = await ShopCustomer.findOne({ workspace: workspaceId, customer: ticket.customer._id });

  return {
    id: ticket._id.toString(),
    ticket_number: ticket.ticketNumber,
    workspace_id: ticket.workspace.toString(),
    customer_id: ticket.customer._id.toString(),
    customer_name: ticket.customer.defaultName,
    customer_phone: ticket.customer.phoneE164,
    shop_display_name: shopCust ? shopCust.shopDisplayName : ticket.customer.defaultName,
    shop_customer_notes: shopCust ? shopCust.internalNotes : '',
    device_category: ticket.deviceCategory,
    brand: ticket.brand,
    model: ticket.model,
    issue_description: ticket.issueDescription,
    estimated_cost: ticket.estimatedCost,
    estimated_completion_date: ticket.estimatedCompletionDate,
    status: ticket.status,
    assigned_to_name: ticket.assignedStaffName || (ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'),
    assigned_staff_name: ticket.assignedStaffName || (ticket.assignedTo ? ticket.assignedTo.name : ''),
    assigned_staff_phone: ticket.assignedStaffPhone || '',
    assigned_to_email: ticket.assignedTo ? ticket.assignedTo.email : '',
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    timeline: (ticket.timeline || []).map(ev => ({
      from_status: ev.fromStatus,
      to_status: ev.toStatus,
      notes: ev.notes,
      created_at: ev.createdAt,
      changed_by_name: ev.changedBy ? ev.changedBy.name : 'Staff'
    }))
  };
}

async function updateTicket(workspaceId, operatorUser, ticketId, updates) {
  const ticket = await RepairTicket.findOne({ _id: ticketId, workspace: workspaceId });
  if (!ticket) {
    throw new Error('Repair ticket not found in this workspace.');
  }

  const oldStatus = ticket.status;
  let statusChanged = false;

  if (updates.status) {
    const targetStatus = updates.status.toUpperCase();
    if (!VALID_STATUSES.includes(targetStatus)) {
      throw new Error(`Invalid status: ${updates.status}. Allowed: ${VALID_STATUSES.join(', ')}`);
    }
    if (targetStatus !== oldStatus) {
      ticket.status = targetStatus;
      statusChanged = true;
    }
  }

  if (updates.estimatedCost !== undefined) {
    ticket.estimatedCost = Number(updates.estimatedCost);
  }

  if (updates.estimatedCompletionDate !== undefined) {
    ticket.estimatedCompletionDate = updates.estimatedCompletionDate ? new Date(updates.estimatedCompletionDate) : null;
  }

  if (updates.issueDescription) {
    ticket.issueDescription = updates.issueDescription.trim();
  }

  if (statusChanged || updates.notes) {
    ticket.timeline.push({
      fromStatus: oldStatus,
      toStatus: ticket.status,
      notes: updates.notes ? updates.notes.trim() : `Status updated to ${ticket.status}`,
      changedBy: operatorUser._id || operatorUser.id,
      createdAt: new Date()
    });
  }

  await ticket.save();
  return getTicketById(workspaceId, ticketId);
}

async function listWorkspaceCustomers(workspaceId) {
  const shopCustomers = await ShopCustomer.find({ workspace: workspaceId })
    .populate('customer')
    .sort({ lastSeenAt: -1 });

  const results = [];
  for (const sc of shopCustomers) {
    if (!sc.customer) continue;
    const ticketCount = await RepairTicket.countDocuments({ workspace: workspaceId, customer: sc.customer._id });
    results.push({
      id: sc.customer._id.toString(),
      phone_e164: sc.customer.phoneE164,
      default_name: sc.customer.defaultName,
      is_verified: sc.customer.isVerified,
      shop_display_name: sc.shopDisplayName,
      internal_notes: sc.internalNotes,
      first_seen_at: sc.firstSeenAt,
      last_seen_at: sc.lastSeenAt,
      ticket_count: ticketCount
    });
  }

  return results;
}

async function deleteTicket(workspaceId, ticketId) {
  const ticket = await RepairTicket.findOne({ _id: ticketId, workspace: workspaceId });
  if (!ticket) {
    throw new Error('Repair ticket not found in this workspace.');
  }

  await RepairTicket.deleteOne({ _id: ticketId, workspace: workspaceId });
  return {
    success: true,
    message: `Repair ticket ${ticket.ticketNumber} deleted successfully.`,
    ticketNumber: ticket.ticketNumber,
    deletedId: ticketId
  };
}

async function deleteCustomerTicket(customerId, ticketId) {
  const ticket = await RepairTicket.findOne({ _id: ticketId, customer: customerId });
  if (!ticket) {
    throw new Error('Repair ticket not found for this customer.');
  }

  await RepairTicket.deleteOne({ _id: ticketId, customer: customerId });
  return {
    success: true,
    message: `Repair ticket ${ticket.ticketNumber} deleted successfully.`,
    ticketNumber: ticket.ticketNumber,
    deletedId: ticketId
  };
}

module.exports = {
  VALID_STATUSES,
  generateTicketNumber,
  findOrCreateCustomer,
  createTicket,
  listWorkspaceTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  deleteCustomerTicket,
  listWorkspaceCustomers
};
