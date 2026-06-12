const { Router } = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { templateController } = require("../controllers/templateController");

const router = Router();

router.get("/", authenticateToken, templateController.getTemplates);
router.get("/active", authenticateToken, templateController.getActiveTemplates);
router.get("/:id", authenticateToken, templateController.getTemplateDetail);
router.post("/", authenticateToken, templateController.createTemplate);
router.put("/:id", authenticateToken, templateController.updateTemplate);
router.delete("/:id", authenticateToken, templateController.deleteTemplate);

module.exports = router;
