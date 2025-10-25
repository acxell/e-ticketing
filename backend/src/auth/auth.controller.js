const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser } = require("./auth.service");
const { authenticate } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    const user = await register(userData);
    res.send({
      data: user,
      message: "User Registration Successful",
      success: true
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
      success: false
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, user } = await login(username, password);
    res.send({
      data: { token, user },
      message: "Login Successful",
      success: true
    });
  } catch (err) {
    res.status(401).send({
      message: err.message,
      success: false
    });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);
    res.send({
      data: user,
      success: true
    });
  } catch (err) {
    res.status(401).send({
      message: err.message,
      success: false
    });
  }
});

module.exports = router;