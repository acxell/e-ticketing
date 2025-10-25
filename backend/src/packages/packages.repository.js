const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');

const findPackages = async (search = '') => {
  const where = search 
    ? {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  return await prisma.package.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const findPackageById = async (id) => {
  return await prisma.package.findUnique({
    where: { id: parseInt(id) },
    include: {
      customers: {
        select: {
          id: true,
          customerCode: true,
          fullName: true,
          email: true,
          phone: true
        }
      }
    }
  });
};

const createPackage = async (packageData) => {
  return await prisma.package.create({
    data: {
      ...packageData,
      code: `PKG-${uuidv4().substring(0, 8).toUpperCase()}`
    }
  });
};

const updatePackage = async (id, packageData) => {
  return await prisma.package.update({
    where: { id: parseInt(id) },
    data: packageData
  });
};

const deletePackage = async (id) => {
  return await prisma.package.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  findPackages,
  findPackageById,
  createPackage,
  updatePackage,
  deletePackage
};