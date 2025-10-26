const {
  findPackages,
  findPackageById,
  createPackage,
  updatePackage,
  deletePackage
} = require('./packages.repository');

const getAllPackages = async (search = '') => {
  return await findPackages(search);
};

const getPackageById = async (id) => {
  const package = await findPackageById(id);
  if (!package) {
    throw new Error('Package not found');
  }
  return package;
};

const createNewPackage = async (packageData) => {
  if (!packageData.name || !packageData.price) {
    throw new Error('Name and price are required');
  }
  
  if (packageData.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  return await createPackage(packageData);
};

const updatePackageById = async (id, packageData) => {
  await getPackageById(id);
  
  if (packageData.price && packageData.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  return await updatePackage(id, packageData);
};

const deletePackageById = async (id) => {
  await getPackageById(id);
  return await deletePackage(id);
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage: createNewPackage,
  updatePackage: updatePackageById,
  deletePackage: deletePackageById
};