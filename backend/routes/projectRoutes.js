const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:id", protect, projectController.updateProject);
router.put("/:id/join", protect, projectController.joinProject);
router.post("/:id/mentor-request", protect, projectController.sendMentorRequest);
router.post("/:id/mentor-request/:mentorId/accept", protect, projectController.acceptMentorRequest);
router.post("/:id/mentor-request/:mentorId/reply", protect, projectController.replyToMentorRequest);
router.get("/:id/chat", protect, projectController.getProjectMessages);
router.post("/:id/chat", protect, projectController.sendProjectMessage);
router.get("/:id/calendar", protect, projectController.getProjectCalendar);
router.post("/:id/calendar", protect, projectController.addProjectCalendarItem);
router.delete("/:id", protect, projectController.deleteProject);

module.exports = router;
