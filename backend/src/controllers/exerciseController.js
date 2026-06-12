const { exerciseService } = require("../services/exerciseService");

const exerciseController = {
  async getExercises(req, res, next) {
    try {
      const exercises = await exerciseService.getExercises(req.query);
      res.json(exercises);
    } catch (err) {
      next(err);
    }
  },

  async createExercise(req, res, next) {
    try {
      const exercise = await exerciseService.createExercise(req.user.id, req.body);
      res.status(201).json(exercise);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { exerciseController };
