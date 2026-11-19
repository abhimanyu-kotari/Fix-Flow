const express = require('express');
const {
  createTicket,
  listWorkspaceTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../services/ticketService');
const { authenticateRepairer } = require('../middleware/auth');

const router = express.Router();

// All ticket routes require repairer authentication
router.use(authenticateRepairer);

/**
 * Create a new repair ticket (Owner, Manager, Technician)
 * POST /api/tickets
 */
router.post('/', async (req, res) => {
  try {
    const ticket = await createTicket(req.workspaceId, req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Repair ticket created successfully.',
      ticket
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * List workspace tickets with optional filtering
 * GET /api/tickets?status=...&search=...&assignedTo=...
 */
router.get('/', async (req, res) => {
  try {
    const { status, search, assignedTo } = req.query;
    const tickets = await listWorkspaceTickets(
      req.workspaceId,
      { status, search, assignedTo }
    );
    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get ticket details by ID
 * GET /api/tickets/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await getTicketById(req.workspaceId, req.params.id);
    res.json({
      success: true,
      ticket
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Update ticket details, status, or progress notes
 * PATCH /api/tickets/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const updated = await updateTicket(
      req.workspaceId,
      req.user,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: 'Repair ticket updated successfully.',
      ticket: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Delete a repair ticket
 * DELETE /api/tickets/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteTicket(req.workspaceId, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
