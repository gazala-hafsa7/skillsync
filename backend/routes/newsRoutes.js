const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const newsController = require("../controllers/newsController");

router.get("/", newsController.getNews);
router.post("/", protect, newsController.createNews);
router.put("/:id", protect, newsController.updateNews);
router.delete("/:id", protect, newsController.deleteNews);

module.exports = router;
