const { exerciseRepository } = require("../repositories/exerciseRepository");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const exerciseService = {
  async getExercises(filters = {}) {
    return exerciseRepository.getExercises(filters);
  },

  async createExercise(userId, body) {
    const name = String(body.name || "").trim();
    if (name.length < 2) {
      throw httpError("Exercise name is required.", 400);
    }

    return exerciseRepository.createExercise({
      name,
      categoryId: body.categoryId || body.category_id || null,
      muscleGroup: body.muscleGroup || body.muscle_group || "General",
      equipment: body.equipment || "Bodyweight",
      exerciseType: body.exerciseType || body.exercise_type || "strength",
      defaultDuration: body.defaultDuration || body.default_duration || 10,
      createdBy: userId
    });
  }
};

module.exports = { exerciseService };
