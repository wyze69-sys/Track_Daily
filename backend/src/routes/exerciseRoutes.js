const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { exerciseController } = require("../controllers/exerciseController");

const router = Router();

router.get("/", authenticateToken, exerciseController.getExercises);
router.post("/", authenticateToken, exerciseController.createExercise);

module.exports = router;
