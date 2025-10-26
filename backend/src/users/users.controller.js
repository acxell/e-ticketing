const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { userValidationRules, validateIdParam, handleValidationErrors } = require('../middleware/validators');
const usersService = require('./users.service');

// Get all users
router.get('/', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    const excludeRoles = req.query.excludeRoles ? req.query.excludeRoles.split(',') : [];
    const users = await usersService.getAllUsers(excludeRoles);
    res.success(users);
  } catch (err) {
    res.error(err.message);
  }
});

// Get user by id
router.get('/:id', 
  authenticate, 
  authorize(['users.manage']),
  validateIdParam(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.success(user);
  } catch (err) {
    if (err.message === 'User not found') {
      res.error(err.message, 404);
    } else {
      res.error(err.message);
    }
  }
});

// Create new user
router.post('/', 
  authenticate, 
  authorize(['users.manage']),
  userValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { username, email, password, fullName, phone, roleId } = req.body;
    const user = await usersService.createUser({
      username,
      email,
      password,
      fullName,
      phone,
      roleId
    });
    res.success(user, 'User created successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Update user
router.patch('/:id', 
  authenticate, 
  authorize(['users.manage']),
  validateIdParam(),
  userValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { username, email, fullName, phone, roleId } = req.body;
    const user = await usersService.updateUser(req.params.id, {
      username,
      email,
      fullName,
      phone,
      roleId
    });
    res.success(user, 'User updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Delete user
router.delete('/:id', 
  authenticate, 
  authorize(['users.manage']),
  validateIdParam(),
  handleValidationErrors,
  async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id);
    res.success(null, 'User deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;