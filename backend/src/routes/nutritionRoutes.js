const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { nutritionController } = require("../controllers/nutritionController");

const router = Router();

router.get("/foods", authenticateToken, nutritionController.searchFoods);

module.exports = router;
