const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { challengeController } = require("../controllers/challengeController");

const router = Router();

router.get("/", authenticateToken, challengeController.getChallenges);
router.get("/active", authenticateToken, challengeController.getActiveChallenges);
router.get("/user/active", authenticateToken, challengeController.getUserChallenges);
router.post("/:id/opt-in", authenticateToken, challengeController.joinChallenge);
router.post("/:id/join", authenticateToken, challengeController.joinChallenge);

module.exports = router;
