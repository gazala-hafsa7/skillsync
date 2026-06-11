const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/me", protect, userController.getCurrentUserProfile);
router.put("/me", protect, userController.updateCurrentUserProfile);
router.get("/", protect, userController.listUsers);
router.get("/:id", protect, userController.getUserProfileById);

module.exports = router;
