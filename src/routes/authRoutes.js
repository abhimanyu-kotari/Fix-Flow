const express = require('express');
const { registerOwner, login, getUserById } = require('../services/authService');
const { authenticateRepairer } = require('../middleware/auth');

const router = express.Router();

/**
 * Register a new shop owner & create their workspace
 * POST /api/auth/register-owner
 */
router.post('/register-owner', async (req, res) => {
  try {
    const { name, email, password, shopName, shopPhone, shopAddress } = req.body;
    const result = await registerOwner(
      { name, email, password, shopName, shopPhone, shopAddress },
      req.db
    );
    res.status(201).json({
      success: true,
      message: 'Workspace and owner account created successfully.',
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Repairer login (Owner, Manager, Technician)
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password }, req.db);
    res.json({
      success: true,
      message: 'Login successful.',
      ...result
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get current repairer profile
 * GET /api/auth/me
 */
router.get('/me', authenticateRepairer, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
