const prisma = require('../db');

class UsersRepository {
  async findMany(excludeRoles = []) {
    const where = excludeRoles.length > 0 ? {
      userRoles: {
        none: {
          role: {
            name: {
              in: excludeRoles
            }
          }
        }
      }
    } : undefined;
    return prisma.user.findMany({
      where,
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
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
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
  }

  async findByUsernameOrEmail(username, email) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
  }

  async findByUsernameOrEmailExcept(username, email, userId) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: {
          id: parseInt(userId)
        }
      }
    });
  }

  async create(data) {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        userRoles: data.roleId ? {
          create: {
            roleId: parseInt(data.roleId)
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
  }

  async update(id, data) {
    return prisma.$transaction(async (prisma) => {
      // Update user details
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone
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
      if (data.roleId) {
        // Delete existing roles
        await prisma.userRole.deleteMany({
          where: { userId: parseInt(id) }
        });

        // Create new role assignment
        await prisma.userRole.create({
          data: {
            userId: parseInt(id),
            roleId: parseInt(data.roleId)
          }
        });
      }

      return updatedUser;
    });
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new UsersRepository();
