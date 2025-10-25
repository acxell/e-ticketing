const {
  findPermissions,
  findPermissionById,
  findPermissionByKey,
  createPermission,
  updatePermission,
  deletePermission
} = require('./permissions.repository');

const getAllPermissions = async (filters) => {
  return await findPermissions(filters);
};

const getPermissionById = async (id) => {
  const permission = await findPermissionById(id);
  if (!permission) {
    throw new Error('Permission not found');
  }
  return permission;
};

const createNewPermission = async (permissionData) => {
  if (!permissionData.key || !permissionData.label) {
    throw new Error('Key and label are required');
  }

  const existingPermission = await findPermissionByKey(permissionData.key);
  if (existingPermission) {
    throw new Error('Permission with this key already exists');
  }

  return await createPermission(permissionData);
};

const updatePermissionById = async (id, permissionData) => {
  await getPermissionById(id); // Verify permission exists

  if (permissionData.key) {
    const existingPermission = await findPermissionByKey(permissionData.key);
    if (existingPermission && existingPermission.id !== parseInt(id)) {
      throw new Error('Permission with this key already exists');
    }
  }

  return await updatePermission(id, permissionData);
};

const deletePermissionById = async (id) => {
  await getPermissionById(id); // Verify permission exists
  return await deletePermission(id);
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission: createNewPermission,
  updatePermission: updatePermissionById,
  deletePermission: deletePermissionById
};