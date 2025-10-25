const { authenticate, authorize } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Assign role to user
router.post('/:roleId/users/:userId', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { roleId, userId } = req.params;
    const userRole = await prisma.userRole.create({
      data: {
        roleId: parseInt(roleId),
        userId: parseInt(userId)
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    res.success(userRole, 'Role assigned to user successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Remove role from user
router.delete('/:roleId/users/:userId', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { roleId, userId } = req.params;
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: parseInt(userId),
          roleId: parseInt(roleId)
        }
      }
    });
    res.success(null, 'Role removed from user successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Assign permission to role
router.post('/:roleId/permissions/:permissionId', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: parseInt(roleId),
        permissionId: parseInt(permissionId)
      },
      include: {
        role: true,
        permission: true
      }
    });
    res.success(rolePermission, 'Permission assigned to role successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Remove permission from role
router.delete('/:roleId/permissions/:permissionId', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: parseInt(roleId),
          permissionId: parseInt(permissionId)
        }
      }
    });
    res.success(null, 'Permission removed from role successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// Get user's roles
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: parseInt(req.params.userId)
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
    res.success(userRoles);
  } catch (err) {
    res.error(err.message);
  }
});

// Get role's permissions
router.get('/:roleId/permissions', authenticate, async (req, res) => {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: parseInt(req.params.roleId)
      },
      include: {
        permission: true
      }
    });
    res.success(rolePermissions);
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;