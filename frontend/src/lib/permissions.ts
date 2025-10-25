export const ROLES = {
  ADMIN: 'ADMIN',
  AGENT_NOC: 'AGENT_NOC',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE'
};

export const PERMISSIONS = {
  CUSTOMERS: {
    READ: 'customers.read',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete'
  },
  TICKETS: {
    READ: 'tickets.read',
    CREATE: 'tickets.create',
    UPDATE: 'tickets.update',
    ASSIGN: 'tickets.assign',
    SET_PRIORITY: 'tickets.set_priority'
  },
  PACKAGES: {
    MANAGE: 'packages.manage'
  },
  USERS: {
    MANAGE: 'users.manage'
  },
  ROLES: {
    MANAGE: 'roles.manage'
  }
};

interface UserRole {
  role: {
    name: string;
    rolePermissions: Array<{
      permission: {
        key: string;
      };
    }>;
  };
}

interface User {
  id: number;
  username: string;
  userRoles: UserRole[];
}

export const hasRole = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user?.userRoles) return false;
  return user.userRoles.some(userRole => 
    allowedRoles.includes(userRole.role.name)
  );
};

export const hasPermission = (user: User | null, requiredPermission: string): boolean => {
  if (!user?.userRoles) return false;
  return user.userRoles.some(userRole =>
    userRole.role.rolePermissions.some(rp => 
      rp.permission.key === requiredPermission
    )
  );
};