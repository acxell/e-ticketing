const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors into a user-friendly message
    const errorMessages = errors.array().map(err => {
      const fieldName = err.path.charAt(0).toUpperCase() + err.path.slice(1);
      return `${fieldName}: ${err.msg}`;
    });

    return res.status(400).json({ 
      success: false,
      message: errorMessages.join('\n'), // Each error on a new line
      error: errorMessages.join('\n'),   // For backward compatibility
      details: errors.array()            // Keep detailed errors for debugging
    });
  }
  next();
};

// Customer Validation Rules
const customerValidationRules = () => {
  return [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    
    body('phone')
      .optional({ nullable: true })
      .trim()
      .matches(/^[0-9+\-\s()]*$/)
      .withMessage('Invalid phone number format'),
    
    body('address')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage('Address cannot exceed 255 characters'),
    
    body('packageId')
      .notEmpty()
      .withMessage('Package ID is required')
      .isInt()
      .withMessage('Package ID must be an integer')
  ];
};

// User Validation Rules
const userValidationRules = () => {
  return [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),

    body('password')
      .if((value, { req }) => !req.params.id) // Only required for new users
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),

    body('roleId')
      .optional()
      .isInt()
      .withMessage('Role ID must be an integer')
  ];
};

// Ticket Validation Rules
const ticketValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),

    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),

    body('customerId')
      .notEmpty()
      .withMessage('Customer ID is required')
      .isInt()
      .withMessage('Customer ID must be an integer'),

    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Priority must be LOW, MEDIUM, or HIGH'),

    body('status')
      .optional()
      .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .withMessage('Invalid ticket status')
  ];
};

// Package Validation Rules
const packageValidationRules = () => {
  return [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Package code is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Package code must be between 3 and 50 characters')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Package code can only contain uppercase letters, numbers, and hyphens'),

    body('name')
      .trim()
      .notEmpty()
      .withMessage('Package name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Package name must be between 2 and 100 characters'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),

    body('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ];
};

// Role Validation Rules
const roleValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Role name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Role name must be between 2 and 50 characters')
      .matches(/^[A-Z_]+$/)
      .withMessage('Role name must be uppercase letters and underscores only'),

    body('label')
      .trim()
      .notEmpty()
      .withMessage('Role label is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Role label must be between 2 and 100 characters')
  ];
};

// Status Update Validation Rules
const ticketStatusValidationRules = () => {
  return [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .withMessage('Invalid ticket status'),

    body('note')
      .notEmpty()
      .withMessage('Note is required')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Note cannot exceed 500 characters')
  ];
};

// Assignment Validation Rules
const ticketAssignmentValidationRules = () => {
  return [
    body('assignedToId')
      .notEmpty()
      .withMessage('Assigned user ID is required')
      .isInt()
      .withMessage('Assigned user ID must be an integer')
  ];
};

// ID Parameter Validation
const validateIdParam = () => {
  return [
    param('id')
      .notEmpty()
      .withMessage('ID parameter is required')
      .isInt()
      .withMessage('ID must be an integer')
  ];
};

module.exports = {
  handleValidationErrors,
  customerValidationRules,
  userValidationRules,
  ticketValidationRules,
  packageValidationRules,
  roleValidationRules,
  ticketStatusValidationRules,
  ticketAssignmentValidationRules,
  validateIdParam
};