const { templateRepository } = require("../repositories/templateRepository");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const templateService = {
  async getTemplates(filters = {}, viewerId = null) {
    return templateRepository.getTemplates(filters, viewerId);
  },

  async getTemplateById(id) {
    const template = await templateRepository.getTemplateById(id);
    if (!template) {
      throw httpError("Workout template not found.", 404);
    }
    return template;
  },

  async getActiveTemplates(filters = {}, viewerId = null) {
    return templateRepository.getActiveTemplates(filters, viewerId);
  },

  async createTemplate(templateData, creatorId = null) {
    const title = String(templateData.title || templateData.name || "").trim();
    if (title.length < 2) {
      throw httpError("Template name is required.", 400);
    }

    const exercises = Array.isArray(templateData.exercises) ? templateData.exercises : [];
    if (exercises.length === 0) {
      throw httpError("Add at least one exercise before saving a template.", 400);
    }

    const categoryName = templateData.categoryName || templateData.category || "Strength";
    const durationMin = templateData.durationMin || templateData.durationMinutes || exercises.reduce(
      (sum, exercise) => sum + Number(exercise.duration || 0),
      0
    ) || 30;

    return templateRepository.createTemplate({
      ...templateData,
      title,
      categoryName,
      durationMin,
      description: templateData.description || `${title} custom workout template`,
      exercises
    }, creatorId);
  },

  async updateTemplate(id, templateData) {
    const existing = await templateRepository.getTemplateById(id);
    if (!existing) {
      throw httpError("Workout template not found.", 404);
    }
    return templateRepository.updateTemplate(id, templateData);
  },

  async updateTemplateStatus(id, isActive) {
    const existing = await templateRepository.getTemplateById(id);
    if (!existing) {
      throw httpError("Workout template not found.", 404);
    }
    return templateRepository.updateTemplate(id, { isActive });
  },

  async deleteTemplate(id) {
    const deleted = await templateRepository.deleteTemplate(id);
    if (!deleted) {
      throw httpError("Workout template not found.", 404);
    }
    return { success: true, message: "Workout template removed." };
  }
};

module.exports = { templateService };
