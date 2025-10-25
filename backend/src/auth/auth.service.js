const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByUsername, createUser, findUserById } = require("./auth.repository");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}


const register = async (userData) => {
  const existingUser = await findUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const user = await createUser(userData);
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const login = async (username, password) => {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...userWithoutPassword } = user;
  
  const tokenPayload = { 
    userId: user.id,
    username: user.username,
    roles: user.userRoles.map(ur => ur.role.name),
    permissions: user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.key)
    )
  };

  const token = jwt.sign(
    tokenPayload,
    JWT_SECRET,
    { 
      expiresIn: "24h",
      algorithm: 'HS256'
    }
  );

  return {
    token,
    user: userWithoutPassword
  };
};

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  register,
  login,
  getCurrentUser
};