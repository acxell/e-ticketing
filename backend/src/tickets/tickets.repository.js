const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");

const findTickets = async (filters = {}) => {
  const { 
    search,
    status, 
    priority, 
    customerId, 
    assignedToId,
    createdAt,
    startDate,
    endDate
  } = filters;

  return await prisma.ticket.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { ticketCode: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            {
              customer: {
                OR: [
                  { customerCode: { contains: search, mode: 'insensitive' } },
                  { fullName: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          ]
        } : {},
        status ? { status } : {},
        priority ? { priority } : {},
        customerId ? { customerId: parseInt(customerId) } : {},
        assignedToId ? { assignedToId: parseInt(assignedToId) } : {},
        createdAt ? {
          createdAt: {
            gte: new Date(createdAt),
            lt: new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + 1))
          }
        } : {},
        startDate && endDate ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {}
      ]
    },
    include: {
      customer: true,
      assignedTo: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      ticketLogs: {
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      },
      attachments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findTicketById = async (id) => {
  return await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      assignedTo: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      ticketLogs: {
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      attachments: true,
    },
  });
};

const createTicket = async (ticketData, userId) => {
  return await prisma.ticket.create({
    data: {
      ...ticketData,
      ticketCode: `TKT-${uuidv4().substring(0, 8).toUpperCase()}`,
      createdById: userId,
      ticketLogs: {
        create: {
          actorId: userId,
          note: "Ticket created",
          toStatus: "OPEN",
        },
      },
    },
    include: {
      customer: true,
      assignedTo: true,
      createdBy: true,
      ticketLogs: {
        include: {
          actor: true,
        },
      },
    },
  });
};

const updateTicketStatus = async (id, status, userId, note) => {
  const ticket = await findTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Validate status transition
  if (status === "CLOSED" && ticket.status !== "RESOLVED") {
    throw new Error("Ticket must be RESOLVED before it can be CLOSED");
  }

  return await prisma.ticket.update({
    where: { id: parseInt(id) },
    data: {
      status,
      updatedAt: new Date(),
      ticketLogs: {
        create: {
          actorId: userId,
          note,
          fromStatus: ticket.status,
          toStatus: status,
        },
      },
    },
    include: {
      customer: true,
      assignedTo: true,
      createdBy: true,
      ticketLogs: {
        include: {
          actor: true,
        },
      },
      attachments: true,
    },
  });
};

const assignTicket = async (id, assignedToId, userId) => {
  return await prisma.ticket.update({
    where: { id: parseInt(id) },
    data: {
      assignedToId: parseInt(assignedToId),
      updatedAt: new Date(),
      ticketLogs: {
        create: {
          actorId: userId,
        },
      },
    },
    include: {
      customer: true,
      assignedTo: true,
      createdBy: true,
      ticketLogs: {
        include: {
          actor: true,
        },
      },
    },
  });
};

const addTicketAttachment = async (id, attachmentData, userId) => {
  return await prisma.ticket.update({
    where: { id: parseInt(id) },
    data: {
      attachments: {
        create: {
          ...attachmentData,
        },
      },
      ticketLogs: {
        create: {
          actorId: userId,
          note: "Added attachment to ticket",
        },
      },
    },
    include: {
      attachments: true,
      ticketLogs: {
        include: {
          actor: true,
        },
      },
    },
  });
};

module.exports = {
  findTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  addTicketAttachment,
};
