const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { customerValidationRules, handleValidationErrors } = require('../middleware/validators');
const {
  getAllCustomers,
  getCustomerById,
  createNewCustomer,
  updateCustomer,
  deleteCustomer
} = require('./customers.service');

// Get all customers with optional filters
router.get('/', authenticate, authorize(['customers.read']), async (req, res) => {
  try {
    const { search } = req.query;
    const customers = await getAllCustomers(search);
    res.json({
      success: true,
      data: customers,
      message: 'Customers retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get customer by ID
router.get('/:id', authenticate, authorize(['customers.read']), async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);
    res.json(customer);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create new customer - with validation
router.post('/', 
  authenticate,
  authorize(['customers.write']),
  customerValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const customer = await createNewCustomer(req.body);
      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully'
      });
    } catch (err) {
      res.error(err.message);
    }
  }
);

// Update customer - with validation
router.patch('/:id',
  authenticate,
  authorize(['customers.write']),
  customerValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const customer = await updateCustomer(req.params.id, req.body);
      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      });
    } catch (err) {
      res.error(err.message);
    }
  }
);

// Delete customer
router.delete('/:id', authenticate, authorize(['customers.delete']), async (req, res) => {
  try {
    await deleteCustomer(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;