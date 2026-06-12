const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { workoutBodySchema, workoutQuerySchema } = require("../validation/schemas");
const { workoutController } = require("../controllers/workoutController");

const router = Router();

router.get(
  "/",
  authenticateToken,
  validate(workoutQuerySchema, "query"),
  workoutController.getWorkouts
);
router.get("/recent", authenticateToken, workoutController.getRecent);
router.get("/last", authenticateToken, workoutController.getLast);
router.post("/", authenticateToken, validate(workoutBodySchema), workoutController.createWorkout);
router.post("/quick-log", authenticateToken, workoutController.quickLog);
router.post("/repeat-last", authenticateToken, workoutController.repeatLast);
router.put("/:id", authenticateToken, validate(workoutBodySchema), workoutController.updateWorkout);
router.delete("/:id", authenticateToken, workoutController.deleteWorkout);

module.exports = router;
