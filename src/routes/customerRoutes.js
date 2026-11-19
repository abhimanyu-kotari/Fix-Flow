const express = require('express');
const { listWorkspaceCustomers } = require('../services/ticketService');
const { authenticateRepairer } = require('../middleware/auth');
const { ShopCustomer } = require('../models');

const router = express.Router();

router.use(authenticateRepairer);

/**
 * List all customers who have repair records at this shop
 * GET /api/customers
 */
router.get('/', async (req, res) => {
  try {
    const customers = await listWorkspaceCustomers(req.workspaceId);
    res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Update shop-specific notes or display name for a customer
 * PATCH /api/customers/:id/notes
 */
router.patch('/:id/notes', async (req, res) => {
  try {
    const { internalNotes, shopDisplayName } = req.body;
    const customerId = req.params.id;

    const rel = await ShopCustomer.findOne({
      workspace: req.workspaceId,
      customer: customerId
    });

    if (!rel) {
      return res.status(404).json({ error: 'Customer relation not found in this workspace.' });
    }

    if (internalNotes !== undefined) rel.internalNotes = internalNotes;
    if (shopDisplayName !== undefined) rel.shopDisplayName = shopDisplayName;
    await rel.save();

    res.json({
      success: true,
      message: 'Shop customer relationship updated.',
      customer: rel
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
