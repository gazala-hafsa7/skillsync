const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// test route
router.get("/test", (req, res) => {
  res.send("AUTH ROUTE WORKING");
});

// real routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", protect, authController.getMe);

module.exports = router;