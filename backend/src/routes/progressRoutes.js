const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { progressController } = require("../controllers/progressController");

const router = Router();

router.get("/summary", authenticateToken, progressController.getSummary);
router.get("/consistency", authenticateToken, progressController.getConsistency);
router.get("/mood", authenticateToken, progressController.getMoodDistribution);
router.get("/workout-mix", authenticateToken, progressController.getWorkoutMix);

module.exports = router;
