const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:id/join", protect, projectController.joinProject);
router.delete("/:id", protect, projectController.deleteProject);

module.exports = router;