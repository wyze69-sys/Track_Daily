const { nutritionRepository } = require("../repositories/nutritionRepository");

const nutritionController = {
  async searchFoods(req, res, next) {
    try {
      const search = req.query.search;
      
      let limit = 25;
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = parsedLimit;
        }
      }

      let offset = 0;
      if (req.query.offset) {
        const parsedOffset = parseInt(req.query.offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          offset = parsedOffset;
        }
      }

      const result = nutritionRepository.searchFoods(search, limit, offset);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { nutritionController };
