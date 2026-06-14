const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { profileUpdateSchema } = require("../validation/schemas");
const { profileController } = require("../controllers/profileController");

const router = Router();

router.post(
  "/update",
  authenticateToken,
  validate(profileUpdateSchema),
  profileController.updateProfile
);

router.get("/nutrition", authenticateToken, profileController.getNutritionProfile);
router.put("/nutrition", authenticateToken, profileController.updateNutritionProfile);

module.exports = router;
