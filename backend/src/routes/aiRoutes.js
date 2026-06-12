const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { aiController } = require("../controllers/aiController");

const router = Router();

router.get("/latest", authenticateToken, aiController.getLatestInsight);
router.post("/generate", authenticateToken, aiController.generateWeeklyInsight);

module.exports = router;
