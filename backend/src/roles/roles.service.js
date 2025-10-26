const prisma = require("../db");

const {
  findRole,
  findRoleById,
  findRoleByName,
  makeRole,
  updateRoleById,
  deleteRoleById: deleteRole,
  addPermissionToRole,
  removePermissionFromRole
} = require("./roles.repository");

const getAllRole = async () => {
  const roles = await findRole();
  return roles;
};

const getRoleById = async (id) => {
  const role = await findRoleById(id);
  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};

const createRole = async (newRoleData) => {
  if (!newRoleData.name) {
    throw new Error("Role name is required");
  }

  if (!newRoleData.label) {
    throw new Error("Role label is required");
  }

  if (!['ADMIN', 'AGENT_NOC', 'CUSTOMER_SERVICE'].includes(newRoleData.name)) {
    throw new Error("Invalid role name. Must be one of: ADMIN, AGENT_NOC, CUSTOMER_SERVICE");
  }

  if (newRoleData.permissions && newRoleData.permissions.length > 0) {
    const invalidPermissions = await prisma.permission.count({
      where: {
        id: {
          in: newRoleData.permissions.map(id => parseInt(id))
        }
      }
    });

    if (invalidPermissions !== newRoleData.permissions.length) {
      throw new Error("One or more permission IDs are invalid");
    }
  }

  const role = await makeRole(newRoleData);
  return role;
};

const deleteRoleById = async (id) => {
  const role = await getRoleById(id);
  await deleteRole(parseInt(id));
  return { message: 'Role deleted successfully' };
};

const putRoleById = async (id, roleData) => {
  if (!roleData.name || !roleData.label) {
    throw new Error("Name and label are required for full update");
  }

  if (roleData.name && !['ADMIN', 'AGENT_NOC', 'CUSTOMER_SERVICE'].includes(roleData.name)) {
    throw new Error("Invalid role name. Must be one of: ADMIN, AGENT_NOC, CUSTOMER_SERVICE");
  }

  if (roleData.permissions && roleData.permissions.length > 0) {
    const invalidPermissions = await prisma.permission.count({
      where: {
        id: {
          in: roleData.permissions.map(id => parseInt(id))
        }
      }
    });

    if (invalidPermissions !== roleData.permissions.length) {
      throw new Error("One or more permission IDs are invalid");
    }
  }

  return await updateRoleById(parseInt(id), roleData);
};

const patchRoleById = async (id, roleData) => {
  if (Object.keys(roleData).length === 0) {
    throw new Error("No data provided for update");
  }

  if (roleData.name && !['ADMIN', 'AGENT_NOC', 'CUSTOMER_SERVICE'].includes(roleData.name)) {
    throw new Error("Invalid role name. Must be one of: ADMIN, AGENT_NOC, CUSTOMER_SERVICE");
  }

  return await updateRoleById(parseInt(id), roleData);
};

const addPermission = async (roleId, permissionId) => {
  const role = await getRoleById(roleId);
  return await addPermissionToRole(role.id, permissionId);
};

const removePermission = async (roleId, permissionId) => {
  const role = await getRoleById(roleId);
  return await removePermissionFromRole(role.id, permissionId);
};

module.exports = {
  getAllRole,
  getRoleById,
  createRole,
  deleteRoleById,
  putRoleById,
  patchRoleById,
  addPermission,
  removePermission
};
