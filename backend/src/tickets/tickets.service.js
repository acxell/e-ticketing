const {
  findTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  addTicketAttachment
} = require('./tickets.repository');

const getAllTickets = async (filters) => {
  return await findTickets(filters);
};

const getTicketById = async (id) => {
  const ticket = await findTicketById(id);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  return ticket;
};

const createNewTicket = async (ticketData, userId) => {
  if (!ticketData.customerId || !ticketData.title) {
    throw new Error('Customer ID and title are required');
  }
  return await createTicket(ticketData, userId);
};

const updateStatus = async (id, status, userId, note) => {
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
    throw new Error('Invalid status');
  }
  return await updateTicketStatus(id, status, userId, note);
};

const assignTicketToUser = async (id, assignedToId, userId) => {
  if (!assignedToId) {
    throw new Error('Assigned user ID is required');
  }
  return await assignTicket(id, assignedToId, userId);
};

const addAttachment = async (id, attachmentData, userId) => {
  if (!attachmentData.images) {
    throw new Error('Attachment images are required');
  }
  return await addTicketAttachment(id, attachmentData, userId);
};

module.exports = {
  getAllTickets,
  getTicketById,
  createNewTicket,
  updateStatus,
  assignTicketToUser,
  addAttachment
};