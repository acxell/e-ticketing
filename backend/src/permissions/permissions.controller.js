const express = require('express');
const router = express.Router();
const {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
} = require('./permissions.service');
const { authenticate, authorize } = require('../middleware/auth');

// Get all permissions with search and filters
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const permissions = await getAllPermissions(filters);
    res.json({
      success: true,
      data: permissions,
      message: 'Permissions retrieved successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get permission by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const permission = await getPermissionById(req.params.id);
    res.json(permission);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create new permission
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const permission = await createPermission(req.body);
    res.status(201).json({
      data: permission,
      message: 'Permission created successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update permission
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const permission = await updatePermission(req.params.id, req.body);
    res.json({
      data: permission,
      message: 'Permission updated successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete permission
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    await deletePermission(req.params.id);
    res.json({ message: 'Permission deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;