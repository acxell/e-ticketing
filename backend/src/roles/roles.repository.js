const prisma = require("../db");

const findRole = async (filters = {}) => {
  const { search, name, createdAt } = filters;
  
  return await prisma.role.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { label: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        name ? { name } : {},
        createdAt ? {
          createdAt: {
            gte: new Date(createdAt),
            lt: new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + 1))
          }
        } : {}
      ]
    },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      },
      userRoles: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return roles;
};

const findRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      },
      userRoles: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            }
          }
        }
      }
    }
  });

  return role;
};

const findRoleByName = async (name) => {
  return await prisma.role.findUnique({
    where: {
      name
    }
  });
};

const makeRole = async (newRoleData) => {
  const existingRole = await findRoleByName(newRoleData.name);
  if (existingRole) {
    throw new Error('Role with this name already exists');
  }

  const role = await prisma.role.create({
    data: {
      name: newRoleData.name,
      label: newRoleData.label,
      ...(newRoleData.permissions ? {
        rolePermissions: {
          create: newRoleData.permissions.map(permId => ({
            permission: {
              connect: { id: parseInt(permId) }
            }
          }))
        }
      } : {})
    },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });

  return role;
};

const deleteRoleById = async (id) => {
  const role = await findRoleById(id);
  if (!role) {
    throw new Error('Role not found');
  }

  if (['ADMIN', 'AGENT_NOC', 'CUSTOMER_SERVICE'].includes(role.name)) {
    throw new Error('Cannot delete system roles');
  }

  return await prisma.role.delete({
    where: {
      id: parseInt(id),
    },
  });
};

const updateRoleById = async (id, roleData) => {
  const existingRole = await findRoleById(id);
  if (!existingRole) {
    throw new Error('Role not found');
  }

  if (['ADMIN', 'AGENT_NOC', 'CUSTOMER_SERVICE'].includes(existingRole.name) && 
      roleData.name && roleData.name !== existingRole.name) {
    throw new Error('Cannot modify system role names');
  }

  if (roleData.name && roleData.name !== existingRole.name) {
    const nameExists = await findRoleByName(roleData.name);
    if (nameExists) {
      throw new Error('Role with this name already exists');
    }
  }

  return await prisma.$transaction(async (tx) => {
    if (roleData.permissions) {
      await tx.rolePermission.deleteMany({
        where: { roleId: parseInt(id) }
      });
    }

    return await tx.role.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: roleData.name || existingRole.name,
        label: roleData.label || existingRole.label,
        ...(roleData.permissions ? {
          rolePermissions: {
            create: roleData.permissions.map(permId => ({
              permission: {
                connect: { id: parseInt(permId) }
              }
            }))
          }
        } : {})
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              }
            }
          }
        }
      }
    });
  });
};

const addPermissionToRole = async (roleId, permissionId) => {
  return await prisma.rolePermission.create({
    data: {
      roleId: parseInt(roleId),
      permissionId: parseInt(permissionId)
    },
    include: {
      role: true,
      permission: true
    }
  });
};

const removePermissionFromRole = async (roleId, permissionId) => {
  return await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId: parseInt(roleId),
        permissionId: parseInt(permissionId)
      }
    }
  });
};

module.exports = {
  findRole,
  findRoleById,
  findRoleByName,
  makeRole,
  deleteRoleById,
  updateRoleById,
  addPermissionToRole,
  removePermissionFromRole
};
