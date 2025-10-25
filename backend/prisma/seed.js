require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db");

async function main() {
  console.log("Start seeding ...");

  // Roles
  const roleNames = [
    { name: "ADMIN", label: "Administrator" },
    { name: "AGENT_NOC", label: "Agent NOC" },
    { name: "CUSTOMER_SERVICE", label: "Customer Service" },
  ];

  const roleRecords = [];
  for (const r of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { label: r.label },
      create: { name: r.name, label: r.label },
    });
    roleRecords.push(role);
  }

  // Permissions
  const permissions = [
    { key: "customers.read", label: "Read customers" },
    { key: "customers.write", label: "Create/Update customers" },
    { key: "customers.delete", label: "Delete customers" },
    { key: "tickets.read", label: "Read tickets" },
    { key: "tickets.create", label: "Create tickets" },
    { key: "tickets.update", label: "Update tickets" },
    { key: "tickets.delete", label: "Delete tickets" },
    { key: "roles.manage", label: "Manage roles" },
    { key: "permissions.manage", label: "Manage permissions" },
    { key: "users.manage", label: "Manage users" },
    { key: "packages.manage", label: "Manage packages" },
  ];

  const permissionRecords = [];
  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { label: p.label },
      create: { key: p.key, label: p.label },
    });
    permissionRecords.push(perm);
  }

  // Role-Permission mapping (use createMany with skipDuplicates)
  const mappings = [];
  const adminRole = roleRecords.find((r) => r.name === "ADMIN");
  const nocRole = roleRecords.find((r) => r.name === "AGENT_NOC");
  const csRole = roleRecords.find((r) => r.name === "CUSTOMER_SERVICE");

  // ADMIN gets everything
  for (const perm of permissionRecords) {
    mappings.push({ roleId: adminRole.id, permissionId: perm.id });
  }

  // CUSTOMER_SERVICE gets customers.read, customers.write, tickets.create, tickets.read
  const csPermKeys = [
    "customers.read",
    "customers.write",
    "tickets.create",
    "tickets.read",
  ];
  for (const k of csPermKeys) {
    const perm = permissionRecords.find((p) => p.key === k);
    if (perm) mappings.push({ roleId: csRole.id, permissionId: perm.id });
  }

  // AGENT_NOC gets tickets read/update
  const nocPermKeys = ["tickets.read", "tickets.update"];
  for (const k of nocPermKeys) {
    const perm = permissionRecords.find((p) => p.key === k);
    if (perm) mappings.push({ roleId: nocRole.id, permissionId: perm.id });
  }

  if (mappings.length) {
    // createMany supports skipDuplicates
    try {
      await prisma.rolePermission.createMany({
        data: mappings,
        skipDuplicates: true,
      });
    } catch (err) {
      console.warn("Could not bulk create rolePermissions:", err.message);
    }
  }

  // Create admin user
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const hashed = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: { email: "admin@example.com", fullName: "Administrator" },
    create: {
      username: "admin",
      email: "admin@example.com",
      password: hashed,
      fullName: "Administrator",
    },
  });

  // Assign ADMIN role to admin user
  try {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  } catch (err) {
    // ignore unique constraint
  }

  const users = [
    {
      username: "cs_agent",
      email: "cs@example.com",
      password: "Cs123!",
      fullName: "Customer Service Agent",
      role: "CUSTOMER_SERVICE",
    },
    {
      username: "noc_agent",
      email: "noc@example.com",
      password: "Noc123!",
      fullName: "NOC Engineer",
      role: "AGENT_NOC",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {
        email: userData.email,
        fullName: userData.fullName,
      },
      create: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
      },
    });

    // Assign role to user
    const role = roleRecords.find((r) => r.name === userData.role);
    if (role) {
      try {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      } catch (err) {
        // ignore unique constraint violation
        console.log(
          `Role ${userData.role} already assigned to ${userData.username}`
        );
      }
    }

    console.log(
      `Created user: ${userData.username} with password: ${userData.password}`
    );
  }

  // Create sample packages
  const packages = [
    {
      code: "PKG-BASIC",
      name: "Basic",
      description: "Basic internet package",
      price: 19.99,
    },
    {
      code: "PKG-PREMIUM",
      name: "Premium",
      description: "Premium internet package",
      price: 49.99,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { code: pkg.code },
      update: pkg,
      create: pkg,
    });
  }

  // Create sample customer
  const pkgPremium = await prisma.package.findUnique({
    where: { code: "PKG-PREMIUM" },
  });
  const customer = await prisma.customer.upsert({
    where: { customerCode: "CUST-0001" },
    update: { fullName: "John Doe", email: "john@example.com" },
    create: {
      customerCode: "CUST-0001",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "08123456789",
      address: "Jl. Example No 1",
      packageId: pkgPremium.id,
    },
  });

  // Create sample ticket
  const ticket = await prisma.ticket.upsert({
    where: { ticketCode: "TKT-0001" },
    update: { title: "Sample ticket" },
    create: {
      ticketCode: "TKT-0001",
      title: "Unable to connect",
      description: "Customer reports no connectivity since last night",
      status: "OPEN",
      priority: "HIGH",
      customerId: customer.id,
      createdById: adminUser.id,
      ticketLogs: {
        create: {
          actorId: adminUser.id,
          note: "Ticket created by seed",
          toStatus: "OPEN",
        },
      },
    },
  });

  console.log("Seeding finished.");
  console.log("Admin credentials: username=admin, password=" + adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
