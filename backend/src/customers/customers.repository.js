const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');

const findCustomers = async (search = '') => {

  return await prisma.customer.findMany({
    where: search ? {
      OR: [
        { customerCode: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    } : {},
    include: {
      package: true,
      tickets: {
        select: {
          id: true,
          ticketCode: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const findCustomerById = async (id) => {
  return await prisma.customer.findUnique({
    where: { id: parseInt(id) },
    include: {
      package: true,
      tickets: {
        select: {
          id: true,
          ticketCode: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          assignedTo: {
            select: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      }
    }
  });
};

const createCustomer = async (customerData) => {
  return await prisma.customer.create({
    data: {
      ...customerData,
      customerCode: `CUST-${uuidv4().substring(0, 8).toUpperCase()}`
    },
    include: {
      package: true
    }
  });
};

const updateCustomer = async (id, customerData) => {
  // Extract only updatable fields and ensure correct types
  const {
    fullName,
    email,
    phone,
    address,
    packageId
  } = customerData;

  return await prisma.customer.update({
    where: { 
      id: parseInt(id)
    },
    data: {
      fullName,
      email,
      phone,
      address,
      packageId: parseInt(packageId)
    },
    include: {
      package: true
    }
  });
};

const deleteCustomer = async (id) => {
  return await prisma.customer.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  findCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};