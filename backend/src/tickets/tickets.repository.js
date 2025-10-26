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
        orderBy: {
          createdAt: 'desc'
        },
      },
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
    },
  });
};

const createTicket = async (ticketData, userId) => {
  const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
  
  return await prisma.ticket.create({
    data: {
      ...ticketData,
      ticketCode,
      createdById: userId,
      ticketLogs: {
        create: [
          {
            actorId: userId,
            note: `Ticket ${ticketCode} created`,
            toStatus: "OPEN",
          },
          ...(ticketData.assignedToId ? [{
            actorId: userId,
            note: `Initial assignment set`,
          }] : []),
          ...(ticketData.priority ? [{
            actorId: userId,
            note: `Initial priority set to ${ticketData.priority}`,
          }] : []),
        ],
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
    },
  });
};

const assignTicket = async (id, assignedToId, userId) => {
  const ticket = await findTicketById(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const assignedUser = await prisma.user.findUnique({
    where: { id: parseInt(assignedToId) },
    select: { fullName: true, username: true }
  });

  const previousAssignee = ticket.assignedTo;
  const logMessage = previousAssignee 
    ? `Ticket reassigned from ${previousAssignee.fullName || previousAssignee.username} to ${assignedUser.fullName || assignedUser.username}`
    : `Ticket assigned to ${assignedUser.fullName || assignedUser.username}`;

  return await prisma.ticket.update({
    where: { id: parseInt(id) },
    data: {
      assignedToId: parseInt(assignedToId),
      
      ticketLogs: {
        create: {
          actorId: userId,
          
          note: logMessage,
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

const updateTicket = async (id, updateData, userId) => {
  const ticket = await findTicketById(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const changes = [];

  if (updateData.title !== ticket.title) {
    changes.push(`Title updated from "${ticket.title}" to "${updateData.title}"`);
  }
  if (updateData.description !== ticket.description) {
    changes.push("Description updated");
  }
  if (updateData.priority !== ticket.priority) {
    changes.push(`Priority changed from ${ticket.priority} to ${updateData.priority}`);
  }

  const ticketLogs = changes.map(change => ({
    actorId: userId,
    note: change,
  }));

  return await prisma.ticket.update({
    where: { id: parseInt(id) },
    data: {
      ...updateData,
      ticketLogs: {
        create: ticketLogs.length > 0 ? ticketLogs.map(log => ({
          ...log,
          updatedById: userId
        })) : [{
          actorId: userId,
          note: "Ticket updated",
        }],
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

const getActiveTicketsCount = async (customerId) => {
  return await prisma.ticket.count({
    where: {
      customerId,
      status: {
        in: ['OPEN', 'IN_PROGRESS']
      }
    }
  });
};

module.exports = {
  findTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  updateTicket,
  getActiveTicketsCount,
};
