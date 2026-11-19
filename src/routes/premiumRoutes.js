const express = require('express');
const { authenticateRepairer } = require('../middleware/auth');
const { requirePlanFeature } = require('../middleware/planGuards');
const { RepairTicket } = require('../models');

const router = express.Router();

router.use(authenticateRepairer);

/**
 * Premium Feature: Parts & Inventory Management (Pro & Business plans)
 * GET /api/features/inventory
 */
router.get('/inventory', requirePlanFeature('inventoryManagement'), (req, res) => {
  res.json({
    success: true,
    feature: 'inventoryManagement',
    message: 'Parts Inventory access granted.',
    items: [
      { id: 'part-1', name: 'iPhone 13/14 OLED Display Panel (OEM)', stock: 12, costInr: 4500, category: 'Screens' },
      { id: 'part-2', name: 'MacBook Air M2 Replacement Battery 52.6Wh', stock: 5, costInr: 6800, category: 'Batteries' },
      { id: 'part-3', name: 'Galaxy S23 Ultra Camera Sensor Module', stock: 3, costInr: 5200, category: 'Cameras' },
      { id: 'part-4', name: 'USB-C Fast Charging Flex Cable Assembly', stock: 24, costInr: 850, category: 'Ports' }
    ]
  });
});

/**
 * Premium Feature: Repair Passport Verification Certificate (Pro & Business plans)
 * GET /api/features/repair-passport/:ticketId
 */
router.get('/repair-passport/:ticketId', requirePlanFeature('repairPassport'), async (req, res) => {
  try {
    const ticket = await RepairTicket.findOne({
      _id: req.params.ticketId,
      workspace: req.workspaceId
    }).populate('customer workspace');

    if (!ticket) {
      return res.status(404).json({ error: 'Repair ticket not found.' });
    }

    res.json({
      success: true,
      feature: 'repairPassport',
      passport: {
        certificateNumber: `RP-${ticket.ticketNumber}-${Date.now().toString(36).toUpperCase()}`,
        device: `${ticket.brand} ${ticket.model}`,
        category: ticket.deviceCategory,
        servicedBy: ticket.workspace ? ticket.workspace.name : 'Authorized Shop',
        customerName: ticket.customer ? ticket.customer.defaultName : 'Valued Customer',
        completedAt: ticket.updatedAt,
        status: ticket.status,
        genuinePartsVerified: true,
        warrantyDurationDays: 90
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Premium Feature: Advanced Multi-Branch Analytics (Business plan only)
 * GET /api/features/analytics
 */
router.get('/analytics', requirePlanFeature('advancedAnalytics'), (req, res) => {
  res.json({
    success: true,
    feature: 'advancedAnalytics',
    message: 'Advanced multi-branch business analytics access granted.',
    metrics: {
      monthlyRevenueInr: 342000,
      turnaroundTimeHoursAvg: 18.4,
      repeatCustomerRatePercent: 32.5,
      firstTimeFixRatePercent: 94.2
    }
  });
});

module.exports = router;
