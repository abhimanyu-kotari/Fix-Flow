const express = require('express');
const { getWorkspaceSubscription, updateWorkspacePlan } = require('../services/subscriptionService');
const { authenticateRepairer, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateRepairer);

/**
 * Get workspace subscription details, usage quotas, and available upgrades
 * GET /api/subscription
 */
router.get('/', async (req, res) => {
  try {
    const data = await getWorkspaceSubscription(req.workspaceId);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Switch workspace subscription plan (Dev/Manual override for MVP testing)
 * POST /api/subscription/change-plan
 */
router.post('/change-plan', requireRole('OWNER'), async (req, res) => {
  try {
    const { planId } = req.body;
    const result = await updateWorkspacePlan(req.workspaceId, req.user, planId);
    res.json({
      success: true,
      message: `Workspace subscription successfully updated to ${result.currentPlan.name}.`,
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
