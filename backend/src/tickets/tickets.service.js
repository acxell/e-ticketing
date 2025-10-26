const {
  findTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  updateTicket,
  getActiveTicketsCount,
} = require('./tickets.repository');

const MAX_ACTIVE_TICKETS = 3;

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
  const activeTickets = await getActiveTicketsCount(ticketData.customerId);

  if (activeTickets >= MAX_ACTIVE_TICKETS) {
    throw new Error(`Customer has reached the maximum limit of ${MAX_ACTIVE_TICKETS} active tickets`);
  }

  if (!ticketData.customerId || !ticketData.title) {
    throw new Error('Customer ID and title are required');
  }
  return await createTicket(ticketData, userId);
};

const updateTicketDetails = async (id, updateData, userId) => {
  const allowedFields = ['title', 'description', 'priority'];
  const filteredData = Object.keys(updateData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  if (Object.keys(filteredData).length === 0) {
    throw new Error('No valid fields to update');
  }

  return await updateTicket(id, filteredData, userId);
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

module.exports = {
  getAllTickets,
  getTicketById,
  createNewTicket,
  updateTicketDetails,
  updateStatus,
  assignTicketToUser,
};