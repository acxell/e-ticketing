const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../db');

// Get all users
router.get('/', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    res.success(users);
  } catch (err) {
    res.error(err.message);
  }
});

// Get user by id
router.get('/:id', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    if (!user) {
      return res.error('User not found', 404);
    }
    res.success(user);
  } catch (err) {
    res.error(err.message);
  }
});

// Create new user
router.post('/', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    const { username, email, password, fullName, phone, roleId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.error('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        phone,
        userRoles: roleId ? {
          create: {
            roleId: parseInt(roleId)
          }
        } : undefined
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    res.success(user, 'User created successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Update user
router.put('/:id', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    const { username, email, fullName, phone, roleId } = req.body;
    const userId = parseInt(req.params.id);

    // Check if username or email exists for other users
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: {
          id: userId
        }
      }
    });

    if (existingUser) {
      return res.error('Username or email already exists');
    }

    // Start a transaction to update user and role
    const user = await prisma.$transaction(async (prisma) => {
      // Update user details
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username,
          email,
          fullName,
          phone
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          createdAt: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      // Update role if provided
      if (roleId) {
        // Delete existing roles
        await prisma.userRole.deleteMany({
          where: { userId }
        });

        // Create new role assignment
        await prisma.userRole.create({
          data: {
            userId,
            roleId: parseInt(roleId)
          }
        });
      }

      return updatedUser;
    });

    res.success(user, 'User updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Delete user
router.delete('/:id', authenticate, authorize(['users.manage']), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.success(null, 'User deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;