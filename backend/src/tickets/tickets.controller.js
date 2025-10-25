const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createNewTicket,
  updateStatus,
  assignTicketToUser,
  addAttachment
} = require('./tickets.service');
const { authenticate, authorize } = require('../middleware/auth');

// Get all tickets with optional filters
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const tickets = await getAllTickets(filters);
   res.json({
      success: true,
      data: tickets,
      message: 'Tickets retrieved successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get ticket by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    res.json({
      success: true,
      data: ticket,
      message: 'Tickets retrieved successfully'
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create new ticket
router.post('/', authenticate, authorize(['tickets.create']), async (req, res) => {
  try {
    const ticket = await createNewTicket(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update ticket status
router.patch('/:id/status', authenticate, authorize(['tickets.update']), async (req, res) => {
  try {
    const { status, note } = req.body;
    const ticket = await updateStatus(req.params.id, status, req.user.id, note);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign ticket to user
router.patch('/:id/assign', authenticate, authorize(['tickets.update']), async (req, res) => {
  try {
    const { assignedToId } = req.body;
    const ticket = await assignTicketToUser(req.params.id, assignedToId, req.user.id);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add attachment to ticket
router.post('/:id/attachments', authenticate, async (req, res) => {
  try {
    const ticket = await addAttachment(req.params.id, req.body, req.user.id);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;