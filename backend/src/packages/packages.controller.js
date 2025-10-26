const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} = require('./packages.service');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  packageValidationRules,
  validateIdParam,
  handleValidationErrors 
} = require('../middleware/validators');

// Get all packages
router.get('/', authenticate, async (req, res) => {
  try {
    const search = req.query.search || '';
    const packages = await getAllPackages(search);
    res.json({
      success: true,
      data: packages,
      message: 'Packages retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get package by ID
router.get('/:id', 
  authenticate,
  validateIdParam(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const package = await getPackageById(req.params.id);
    res.json(package);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create new package
router.post('/', 
  authenticate, 
  authorize(['packages.manage']),
  packageValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const package = await createPackage(req.body);
    res.status(201).json(package);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update package
router.patch('/:id', 
  authenticate, 
  authorize(['packages.manage']),
  validateIdParam(),
  packageValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const package = await updatePackage(req.params.id, req.body);
    res.json(package);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete package
router.delete('/:id', 
  authenticate, 
  authorize(['packages.manage']),
  validateIdParam(),
  handleValidationErrors,
  async (req, res) => {
  try {
    await deletePackage(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;