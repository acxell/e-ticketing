const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const apiResponse = require("./middleware/apiResponse");

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(apiResponse);

const authController = require("./auth/auth.controller");
const rolesController = require("./roles/roles.controller");
const roleAssignmentsController = require("./roles/role-assignments.controller");
const permissionsController = require("./permissions/permissions.controller");
const ticketsController = require("./tickets/tickets.controller");
const customersController = require("./customers/customers.controller");
const packagesController = require("./packages/packages.controller");
const usersController = require("./users/users.controller");

app.use("/auth", authController);
app.use("/roles", rolesController);
app.use("/role-assignments", roleAssignmentsController);
app.use("/permissions", permissionsController);
app.use("/tickets", ticketsController);
app.use("/customers", customersController);
app.use("/packages", packagesController);
app.use("/users", usersController);

app.listen(PORT, () => {
  console.log("Server running on port:" + PORT);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
