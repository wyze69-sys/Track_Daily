const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { aiController } = require("../controllers/aiController");

const router = Router();

router.get("/latest", authenticateToken, aiController.getLatestInsight);
router.post("/generate", authenticateToken, aiController.generateWeeklyInsight);
router.post("/daily-calorie-target", authenticateToken, aiController.getDailyCalorieTarget);
router.post("/meal-plan", authenticateToken, aiController.getMealPlan);

module.exports = router;
