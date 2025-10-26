const {
  findCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('./customers.repository');

const getAllCustomers = async (search = '') => {
  return await findCustomers(search);
};

const getCustomerById = async (id) => {
  const customer = await findCustomerById(id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

const createNewCustomer = async (customerData) => {
  if (!customerData.fullName || !customerData.packageId) {
    throw new Error('Full name and package ID are required');
  }
  return await createCustomer(customerData);
};

const updateCustomerById = async (id, customerData) => {
  await getCustomerById(id);
  return await updateCustomer(id, customerData);
};

const deleteCustomerById = async (id) => {
  await getCustomerById(id);
  return await deleteCustomer(id);
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createNewCustomer,
  updateCustomer: updateCustomerById,
  deleteCustomer: deleteCustomerById
};