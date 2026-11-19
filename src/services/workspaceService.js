const { Workspace, Subscription, User } = require('../models');
const { hashPassword } = require('../utils/crypto');
const { getPlan, canAddStaff } = require('../config/plans');

async function getWorkspace(workspaceId) {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) {
    throw new Error('Workspace not found.');
  }

  const sub = await Subscription.findOne({ workspace: workspaceId });
  const planId = sub ? sub.planId : 'free';
  const plan = getPlan(planId);

  const staffCount = await User.countDocuments({ workspace: workspaceId, isActive: true });

  return {
    id: ws._id.toString(),
    name: ws.name,
    slug: ws.slug,
    phone: ws.phone,
    address: ws.address,
    planId,
    subscriptionStatus: sub ? sub.status : 'ACTIVE',
    isDevOverride: sub ? sub.isDevOverride : false,
    currentStaffCount: staffCount,
    plan: {
      id: plan.id,
      name: plan.name,
      priceMonthlyInr: plan.priceMonthlyInr,
      maxStaff: plan.maxStaff,
      maxBranches: plan.maxBranches,
      features: plan.features
    }
  };
}

async function getStaff(workspaceId) {
  const staffList = await User.find({ workspace: workspaceId }).sort({ createdAt: 1 });
  return staffList.map(u => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt
  }));
}

async function addStaff(workspaceId, operatorUser, { name, email, password, role }) {
  if (!operatorUser || !['OWNER', 'MANAGER'].includes(operatorUser.role)) {
    throw new Error('Unauthorized: Only shop owners and managers can add staff members.');
  }

  const targetRole = (role || 'TECHNICIAN').toUpperCase();
  if (!['MANAGER', 'TECHNICIAN'].includes(targetRole)) {
    throw new Error('Invalid role. Staff role must be MANAGER or TECHNICIAN.');
  }

  if (operatorUser.role === 'MANAGER' && targetRole === 'OWNER') {
    throw new Error('Managers cannot create Owner accounts.');
  }

  if (!name || !email || !password) {
    throw new Error('Staff name, email, and initial password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('A user with this email address already exists.');
  }

  // Check plan limits
  const sub = await Subscription.findOne({ workspace: workspaceId });
  const planId = sub ? sub.planId : 'free';
  const plan = getPlan(planId);

  const currentCount = await User.countDocuments({ workspace: workspaceId, isActive: true });

  if (!canAddStaff(planId, currentCount)) {
    throw new Error(
      `Plan Limit Exceeded: Your current ${plan.name} plan permits up to ${plan.maxStaff} staff account(s). Please upgrade your plan to add more team members.`
    );
  }

  const passwordHash = await hashPassword(password);
  const staffUser = await User.create({
    workspace: workspaceId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: targetRole,
    isActive: true
  });

  return {
    id: staffUser._id.toString(),
    workspaceId: workspaceId.toString(),
    name: staffUser.name,
    email: staffUser.email,
    role: staffUser.role,
    isActive: true
  };
}

async function updateStaff(workspaceId, operatorUser, staffId, updates) {
  const targetUser = await User.findOne({ _id: staffId, workspace: workspaceId });
  if (!targetUser) {
    throw new Error('Staff member not found in this workspace.');
  }

  if (targetUser.role === 'OWNER') {
    throw new Error('The primary owner account cannot be modified via staff settings.');
  }

  if (updates.role) {
    if (operatorUser.role !== 'OWNER') {
      throw new Error('Only the shop owner can change staff roles.');
    }
    const newRole = updates.role.toUpperCase();
    if (!['MANAGER', 'TECHNICIAN'].includes(newRole)) {
      throw new Error('Invalid role specified.');
    }
    targetUser.role = newRole;
  }

  if (typeof updates.isActive === 'boolean') {
    if (!['OWNER', 'MANAGER'].includes(operatorUser.role)) {
      throw new Error('Unauthorized to modify staff status.');
    }
    targetUser.isActive = updates.isActive;
  }

  await targetUser.save();

  return {
    id: targetUser._id.toString(),
    name: targetUser.name,
    email: targetUser.email,
    role: targetUser.role,
    isActive: targetUser.isActive
  };
}

module.exports = {
  getWorkspace,
  getStaff,
  addStaff,
  updateStaff
};
