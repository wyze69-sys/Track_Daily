const { aiService } = require("../services/aiService");

const aiController = {
  async getLatestInsight(req, res, next) {
    try {
      let insights = await aiService.getInsightsByUserId(req.user.id);
      if (insights.length === 0) {
        // Generate an initial insight if none exist
        const initial = await aiService.generateWeeklyInsight(req.user.id);
        insights = [initial];
      }
      const latest = insights[0];
      const text = `${latest.summary}\n\nRecommendations:\n${latest.recommendations.map(r => `- ${r}`).join("\n")}\n\nGoal Progress: ${latest.goalProgress}`;
      res.json({
        text,
        date: latest.dateGenerated
      });
    } catch (err) {
      next(err);
    }
  },

  async generateWeeklyInsight(req, res, next) {
    try {
      const latest = await aiService.generateWeeklyInsight(req.user.id);
      const text = `${latest.summary}\n\nRecommendations:\n${latest.recommendations.map(r => `- ${r}`).join("\n")}\n\nGoal Progress: ${latest.goalProgress}`;
      res.status(201).json({
        text,
        date: latest.dateGenerated
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { aiController };
