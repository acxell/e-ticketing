const bcrypt = require('bcryptjs');
const usersRepository = require('./users.repository');

class UsersService {
  async getAllUsers(excludeRoles = []) {
    return await usersRepository.findMany(excludeRoles);
  }

  async getUserById(id) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(userData) {
    // Check if username or email exists
    const existingUser = await usersRepository.findByUsernameOrEmail(
      userData.username,
      userData.email
    );

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    return await usersRepository.create(userData);
  }

  async updateUser(id, userData) {
    // Check if username or email exists for other users
    const existingUser = await usersRepository.findByUsernameOrEmailExcept(
      userData.username,
      userData.email,
      id
    );

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    return await usersRepository.update(id, userData);
  }

  async deleteUser(id) {
    return await usersRepository.delete(id);
  }
}

module.exports = new UsersService();
