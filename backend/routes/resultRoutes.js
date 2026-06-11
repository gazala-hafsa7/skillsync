const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const resultController = require("../controllers/resultController");

router.get("/", protect, resultController.getResults);
router.post("/", protect, resultController.createResult);
router.delete("/:id", protect, resultController.deleteResult);

module.exports = router;
