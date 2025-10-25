const prisma = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userIncludeConfig = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  }
};

const findUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
    include: userIncludeConfig
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: userIncludeConfig
  });
};

const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      userRoles: {
        create: {
          role: {
            connect: {
              name: 'CUSTOMER_SERVICE' // Default role for new users
            }
          }
        }
      }
    },
    include: userIncludeConfig
  });
};

module.exports = {
  findUserByUsername,
  findUserById,
  createUser
};