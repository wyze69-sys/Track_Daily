const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { weeklyPlanController } = require("../controllers/weeklyPlanController");

const router = Router();

router.get("/", authenticateToken, weeklyPlanController.getWeeklyPlan);
router.post("/", authenticateToken, weeklyPlanController.updateWeeklyPlan);
router.put("/", authenticateToken, weeklyPlanController.updateWeeklyPlan);

module.exports = router;
