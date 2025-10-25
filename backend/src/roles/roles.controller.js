const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
  getAllRole,
  getRoleById,
  createRole,
  deleteRoleById,
  putRoleById,
  patchRoleById,
} = require("./roles.service");

// Get all roles - accessible by authenticated users
router.get("/", authenticate, async (req, res) => {
  try {
    const role = await getAllRole();
    res.json({
      success: true,
      data: role,
      message: 'Roles retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get role by ID - accessible by authenticated users
router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const role = await getRoleById(id);
    res.json(role);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create new role - admin only
router.post("/", authenticate, authorize(['roles.manage']), async (req, res) => {
  try {
    const newRoleData = req.body;
    const role = await createRole(newRoleData);
    res.status(201).json({
      data: role,
      message: "Role Created Successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete role - roles.manage only
router.delete("/:id", authenticate, authorize(['roles.manage']), async (req, res) => {
  try {
    const id = req.params.id;
    await deleteRoleById(parseInt(id));
    res.json({ message: "Role Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Update role (full update) - roles.manage only
router.put("/:id", authenticate, authorize(['roles.manage']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const roleData = req.body;
    const role = await putRoleById(id, roleData);
    res.json({
      data: role,
      message: "Role Updated Successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update role (partial update) - roles.manage only
router.patch("/:id", authenticate, authorize(['roles.manage']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const roleData = req.body;
    const role = await patchRoleById(id, roleData);
    res.json({
      data: role,
      message: "Role Updated Successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
