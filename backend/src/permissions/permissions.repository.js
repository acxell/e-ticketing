const prisma = require('../db');

const findPermissions = async (filters = {}) => {
  const { search, key } = filters;
  
  return await prisma.permission.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { key: { contains: search, mode: 'insensitive' } },
            { label: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        key ? { key: { equals: key } } : {}
      ]
    },
    include: {
      rolePermissions: {
        include: {
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const findPermissionById = async (id) => {
  return await prisma.permission.findUnique({
    where: { id: parseInt(id) },
    include: {
      rolePermissions: {
        include: {
          role: true
        }
      }
    }
  });
};

const findPermissionByKey = async (key) => {
  return await prisma.permission.findUnique({
    where: { key }
  });
};

const createPermission = async (permissionData) => {
  return await prisma.permission.create({
    data: permissionData,
    include: {
      rolePermissions: {
        include: {
          role: true
        }
      }
    }
  });
};

const updatePermission = async (id, permissionData) => {
  return await prisma.permission.update({
    where: { id: parseInt(id) },
    data: permissionData,
    include: {
      rolePermissions: {
        include: {
          role: true
        }
      }
    }
  });
};

const deletePermission = async (id) => {
  return await prisma.permission.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  findPermissions,
  findPermissionById,
  findPermissionByKey,
  createPermission,
  updatePermission,
  deletePermission
};