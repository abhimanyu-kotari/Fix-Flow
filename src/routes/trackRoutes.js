const express = require('express');
const { requestOtp, verifyOtp } = require('../services/otpService');
const { deleteCustomerTicket } = require('../services/ticketService');
const { authenticateCustomer } = require('../middleware/customerAuth');
const { RepairTicket, Customer } = require('../models');
const { normalizePhone } = require('../utils/phone');
const { hashPassword, comparePassword, signToken } = require('../utils/crypto');

const router = express.Router();

/**
 * Customer Password Login
 * POST /api/track/login
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'Mobile phone number and password are required.' });
    }
    const phoneRes = normalizePhone(phone);
    if (!phoneRes.isValid) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }
    const customer = await Customer.findOne({ phoneE164: phoneRes.e164 });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'No account found for this phone number. Please click "Create / Set Password" to register.' });
    }
    if (!customer.passwordHash) {
      return res.status(400).json({ success: false, error: 'No password set for this account yet. Please switch to "Create / Set Password" to set your password.' });
    }
    const isMatch = await comparePassword(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
    }

    const token = signToken({
      customerId: customer._id.toString(),
      phone: customer.phoneE164,
      type: 'customer'
    }, '30d');

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      customer: {
        id: customer._id.toString(),
        phone: customer.phoneE164,
        name: customer.defaultName,
        isVerified: customer.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Customer Create / Set Password
 * POST /api/track/register
 */
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'Mobile phone number and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    const phoneRes = normalizePhone(phone);
    if (!phoneRes.isValid) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }
    const phoneE164 = phoneRes.e164;
    const passwordHash = await hashPassword(password);

    let customer = await Customer.findOne({ phoneE164 });
    if (customer) {
      customer.passwordHash = passwordHash;
      if (name && name.trim()) customer.defaultName = name.trim();
      customer.isVerified = true;
      await customer.save();
    } else {
      customer = await Customer.create({
        phoneE164,
        defaultName: name && name.trim() ? name.trim() : 'Valued Customer',
        passwordHash,
        isVerified: true
      });
    }

    const token = signToken({
      customerId: customer._id.toString(),
      phone: customer.phoneE164,
      type: 'customer'
    }, '30d');

    res.json({
      success: true,
      message: 'Password saved and logged in successfully.',
      token,
      customer: {
        id: customer._id.toString(),
        phone: customer.phoneE164,
        name: customer.defaultName,
        isVerified: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Request OTP for customer phone authentication
 * POST /api/track/otp/request
 */
router.post('/otp/request', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await requestOtp(phone);
    res.json(result);
  } catch (err) {
    const status = err.code === 'COOLDOWN_ACTIVE' ? 429 : 400;
    res.status(status).json({
      success: false,
      error: err.message,
      code: err.code,
      retryAfterSeconds: err.retryAfterSeconds
    });
  }
});

/**
 * Verify OTP and receive authenticated customer session
 * POST /api/track/otp/verify
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = await verifyOtp(phone, otp);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
      remainingAttempts: err.remainingAttempts
    });
  }
});

/**
 * Get current authenticated customer profile
 * GET /api/track/me
 */
router.get('/me', authenticateCustomer, (req, res) => {
  res.json({
    success: true,
    customer: req.customer
  });
});

/**
 * Get all repair tickets across all shops for the verified customer
 * GET /api/track/tickets
 */
router.get('/tickets', authenticateCustomer, async (req, res) => {
  try {
    const tickets = await RepairTicket.find({ customer: req.customer._id })
      .populate('workspace', 'name phone address')
      .sort({ createdAt: -1 });

    const formatted = tickets.map(t => ({
      id: t._id.toString(),
      ticket_number: t.ticketNumber,
      workspace_id: t.workspace ? t.workspace._id.toString() : null,
      shop_name: t.workspace ? t.workspace.name : 'Repair Shop',
      shop_phone: t.workspace ? t.workspace.phone : '',
      shop_address: t.workspace ? t.workspace.address : '',
      device_category: t.deviceCategory,
      brand: t.brand,
      model: t.model,
      issue_description: t.issueDescription,
      estimated_cost: t.estimatedCost,
      estimated_completion_date: t.estimatedCompletionDate,
      status: t.status,
      assigned_staff_name: t.assignedStaffName || '',
      assigned_staff_phone: t.assignedStaffPhone || '',
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      timeline: (t.timeline || []).map(ev => ({
        from_status: ev.fromStatus,
        to_status: ev.toStatus,
        notes: ev.notes,
        created_at: ev.createdAt
      }))
    }));

    res.json({
      success: true,
      count: formatted.length,
      tickets: formatted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get single ticket details for the verified customer
 * GET /api/track/tickets/:id
 */
router.get('/tickets/:id', authenticateCustomer, async (req, res) => {
  try {
    const ticket = await RepairTicket.findOne({
      _id: req.params.id,
      customer: req.customer._id
    }).populate('workspace', 'name phone address');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Repair record not found for this account.'
      });
    }

    res.json({
      success: true,
      ticket: {
        id: ticket._id.toString(),
        ticket_number: ticket.ticketNumber,
        workspace_id: ticket.workspace ? ticket.workspace._id.toString() : null,
        shop_name: ticket.workspace ? ticket.workspace.name : 'Repair Shop',
        shop_phone: ticket.workspace ? ticket.workspace.phone : '',
        shop_address: ticket.workspace ? ticket.workspace.address : '',
        device_category: ticket.deviceCategory,
        brand: ticket.brand,
        model: ticket.model,
        issue_description: ticket.issueDescription,
        estimated_cost: ticket.estimatedCost,
        estimated_completion_date: ticket.estimatedCompletionDate,
        status: ticket.status,
        assigned_staff_name: ticket.assignedStaffName || '',
        assigned_staff_phone: ticket.assignedStaffPhone || '',
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
        timeline: (ticket.timeline || []).map(ev => ({
          from_status: ev.fromStatus,
          to_status: ev.toStatus,
          notes: ev.notes,
          created_at: ev.createdAt
        }))
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Delete / cancel a repair ticket for the customer
 * DELETE /api/track/tickets/:id
 */
router.delete('/tickets/:id', authenticateCustomer, async (req, res) => {
  try {
    const result = await deleteCustomerTicket(req.customer._id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
