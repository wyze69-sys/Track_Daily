const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { activityLibraryController } = require("../controllers/activityLibraryController");

const router = Router();

router.get("/", authenticateToken, activityLibraryController.getActivities);
router.post("/", authenticateToken, activityLibraryController.createActivity);

module.exports = router;
