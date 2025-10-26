const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader); 

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token.substring(0, 20) + '...'); 
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); 
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError); 
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token',
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }
  } catch (err) {
    console.error('Auth Middleware Error:', err); 
    return res.status(500).json({ 
      success: false,
      error: 'Authentication error' 
    });
  }
};

const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.permissions) {
        return res.status(403).json({
          success: false,
          error: 'User not authenticated or missing permissions'
        });
      }

      const hasRequiredPermissions = requiredPermissions.every(
        permission => req.user.permissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (err) {
      res.status(403).json({
        success: false,
        error: err.message
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize
};