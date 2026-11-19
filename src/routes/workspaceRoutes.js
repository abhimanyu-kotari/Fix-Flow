const express = require('express');
const {
  getWorkspace,
  getStaff,
  addStaff,
  updateStaff
} = require('../services/workspaceService');
const { authenticateRepairer, requireRole } = require('../middleware/auth');

const router = express.Router();

// All workspace routes require repairer authentication
router.use(authenticateRepairer);

/**
 * Get workspace details, current plan, and member counts
 * GET /api/workspace
 */
router.get('/', async (req, res) => {
  try {
    const workspace = await getWorkspace(req.workspaceId);
    res.json({
      success: true,
      workspace
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * List staff in this workspace
 * GET /api/workspace/staff
 */
router.get('/staff', async (req, res) => {
  try {
    const staff = await getStaff(req.workspaceId);
    res.json({
      success: true,
      staff
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add a new staff member (Enforces RBAC and Plan limit)
 * POST /api/workspace/staff
 */
router.post('/staff', requireRole('OWNER', 'MANAGER'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const staff = await addStaff(
      req.workspaceId,
      req.user,
      { name, email, password, role }
    );
    res.status(201).json({
      success: true,
      message: 'Staff member added successfully.',
      staff
    });
  } catch (err) {
    const isPlanLimit = err.message.includes('Plan Limit Exceeded');
    res.status(isPlanLimit ? 403 : 400).json({
      success: false,
      error: err.message,
      code: isPlanLimit ? 'PLAN_LIMIT_EXCEEDED' : 'INVALID_REQUEST'
    });
  }
});

/**
 * Update staff member role or active status
 * PATCH /api/workspace/staff/:id
 */
router.patch('/staff/:id', requireRole('OWNER', 'MANAGER'), async (req, res) => {
  try {
    const staffId = req.params.id;
    const { role, isActive } = req.body;
    const updated = await updateStaff(
      req.workspaceId,
      req.user,
      staffId,
      { role, isActive }
    );
    res.json({
      success: true,
      message: 'Staff member updated successfully.',
      staff: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
