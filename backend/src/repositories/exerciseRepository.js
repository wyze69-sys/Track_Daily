const pool = require("../config/db");
const { createId } = require("../utils/ids");

function mapExercise(row) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id || null,
    categoryName: row.category_name || null,
    muscleGroup: row.muscle_group || "General",
    equipment: row.equipment || "Bodyweight",
    exerciseType: row.exercise_type || "strength",
    defaultDuration: Number(row.default_duration || 10),
    isCustom: Boolean(row.is_custom),
    createdAt: row.created_at
  };
}

const exerciseRepository = {
  async getExercises(filters = {}) {
    const conditions = ["1 = 1"];
    const params = [];

    if (filters.search) {
      conditions.push("(el.name LIKE ? OR el.muscle_group LIKE ? OR el.equipment LIKE ?)");
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    if (filters.categoryId) {
      conditions.push("el.category_id = ?");
      params.push(filters.categoryId);
    }

    if (filters.exerciseType) {
      conditions.push("el.exercise_type = ?");
      params.push(filters.exerciseType);
    }

    const [rows] = await pool.execute(
      `SELECT el.*, ec.name AS category_name
       FROM exercise_library el
       LEFT JOIN exercise_categories ec ON ec.id = el.category_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY el.is_custom ASC, el.muscle_group ASC, el.name ASC`,
      params
    );

    return rows.map(mapExercise);
  },

  async createExercise(exercise) {
    const id = createId("libex");
    await pool.execute(
      `INSERT INTO exercise_library
        (id, name, category_id, muscle_group, equipment, exercise_type, default_duration, is_custom, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        id,
        exercise.name,
        exercise.categoryId || null,
        exercise.muscleGroup || "General",
        exercise.equipment || "Bodyweight",
        exercise.exerciseType || "strength",
        Number(exercise.defaultDuration || 10),
        exercise.createdBy || null
      ]
    );

    const [rows] = await pool.execute(
      `SELECT el.*, ec.name AS category_name
       FROM exercise_library el
       LEFT JOIN exercise_categories ec ON ec.id = el.category_id
       WHERE el.id = ?`,
      [id]
    );
    return mapExercise(rows[0]);
  }
};

module.exports = { exerciseRepository };
