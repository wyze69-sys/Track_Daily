const pool = require("../config/db");

function mapActivityRow(row) {
  let parsedTags = [];
  if (row.tags) {
    if (typeof row.tags === 'string') {
      try {
        parsedTags = JSON.parse(row.tags);
      } catch (e) {
        parsedTags = [];
      }
    } else if (Array.isArray(row.tags)) {
      parsedTags = row.tags;
    }
  }
  
  return {
    id: row.id,
    categoryId: row.category_id || null,
    categoryName: row.category_name || null,
    name: row.name,
    normalizedName: row.normalized_name || row.name.toLowerCase().replace(/\s+/g, ' '),
    trackingType: row.tracking_type || 'sets_reps_weight',
    tags: parsedTags,
    difficulty: row.difficulty || 'beginner',
    isActive: row.is_active === undefined || row.is_active === null ? true : Boolean(row.is_active),
    source: row.source || 'default',
    createdByUserId: row.created_by || null,
    defaultMet: row.default_met !== null && row.default_met !== undefined ? Number(row.default_met) : undefined,
    distanceMultiplier: row.distance_multiplier !== null && row.distance_multiplier !== undefined ? Number(row.distance_multiplier) : undefined,
    bodyweightFactor: row.bodyweight_factor !== null && row.bodyweight_factor !== undefined ? Number(row.bodyweight_factor) : undefined,
    calorieMethod: row.calorie_method || undefined,
    intensityLevel: row.intensity_level || undefined,
    estimateConfidence: row.estimate_confidence || undefined,
    
    // Legacy fields mapping:
    muscleGroup: row.muscle_group || (parsedTags[0] || 'General'),
    equipment: row.equipment || (parsedTags[1] || 'Bodyweight'),
    exerciseType: row.exercise_type || (row.tracking_type === 'sets_reps_weight' ? 'strength' :
                  row.tracking_type === 'duration_distance' ? 'cardio' :
                  row.tracking_type === 'duration_focus' ? 'mobility' : 'sports'),
    defaultDuration: Number(row.default_duration || 10),
    isCustom: row.is_custom === undefined || row.is_custom === null ? false : Boolean(row.is_custom),
    createdAt: row.created_at
  };
}

const activityLibraryRepository = {
  async getAll(filters = {}) {
    const conditions = ["1 = 1"];
    const params = [];

    if (!filters.includeInactive) {
      conditions.push("el.is_active = 1");
    }

    if (filters.categoryId) {
      conditions.push("el.category_id = ?");
      params.push(filters.categoryId);
    }

    if (filters.categoryName) {
      conditions.push("LOWER(ec.name) = ?");
      params.push(filters.categoryName.toLowerCase().trim());
    }

    if (!filters.includeCustom) {
      conditions.push("el.source != 'custom'");
    }

    if (filters.currentUserId) {
      conditions.push("(el.source != 'custom' OR el.created_by = ?)");
      params.push(filters.currentUserId);
    }

    if (filters.search && filters.search.trim() !== '') {
      const query = `%${filters.search.toLowerCase().trim()}%`;
      conditions.push("(LOWER(el.name) LIKE ? OR LOWER(el.tags) LIKE ?)");
      params.push(query, query);
    }

    const [rows] = await pool.execute(
      `SELECT el.*, ec.name AS category_name
       FROM exercise_library el
       LEFT JOIN exercise_categories ec ON ec.id = el.category_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY el.source ASC, el.name ASC`,
      params
    );

    const items = rows.map(mapActivityRow);
    
    const total = items.length;
    const offset = filters.offset || 0;
    const limit = filters.limit !== undefined ? filters.limit : 25;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total
    };
  },

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT el.*, ec.name AS category_name
       FROM exercise_library el
       LEFT JOIN exercise_categories ec ON ec.id = el.category_id
       WHERE el.id = ?`,
      [id]
    );
    return rows[0] ? mapActivityRow(rows[0]) : null;
  },

  async findByNameAndCategory(normalizedName, categoryId) {
    const [rows] = await pool.execute(
      `SELECT el.*, ec.name AS category_name
       FROM exercise_library el
       LEFT JOIN exercise_categories ec ON ec.id = el.category_id
       WHERE LOWER(el.normalized_name) = ? AND el.category_id = ?`,
      [normalizedName.toLowerCase().trim(), categoryId]
    );
    return rows[0] ? mapActivityRow(rows[0]) : null;
  },

  async create(item) {
    await pool.execute(
      `INSERT INTO exercise_library (
        id, name, category_id, muscle_group, equipment, exercise_type, default_duration, is_custom, created_by,
        normalized_name, tracking_type, tags, difficulty, is_active, source,
        default_met, distance_multiplier, bodyweight_factor, calorie_method, intensity_level, estimate_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.name,
        item.categoryId || null,
        item.muscleGroup || 'General',
        item.equipment || 'Bodyweight',
        item.exerciseType || 'strength',
        Number(item.defaultDuration || 10),
        item.source === 'custom' || item.source === 'user' ? 1 : 0,
        item.createdByUserId || null,
        item.normalizedName,
        item.trackingType || 'sets_reps_weight',
        JSON.stringify(item.tags || []),
        item.difficulty || 'beginner',
        item.isActive ? 1 : 0,
        item.source || 'default',
        item.defaultMet !== undefined ? item.defaultMet : null,
        item.distanceMultiplier !== undefined ? item.distanceMultiplier : null,
        item.bodyweightFactor !== undefined ? item.bodyweightFactor : null,
        item.calorieMethod || null,
        item.intensityLevel || null,
        item.estimateConfidence || null
      ]
    );

    return this.getById(item.id);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];

    const FIELD_MAP = {
      categoryId: "category_id",
      name: "name",
      normalizedName: "normalized_name",
      trackingType: "tracking_type",
      difficulty: "difficulty",
      isActive: "is_active",
      source: "source",
      createdByUserId: "created_by",
      defaultMet: "default_met",
      distanceMultiplier: "distance_multiplier",
      bodyweightFactor: "bodyweight_factor",
      calorieMethod: "calorie_method",
      intensityLevel: "intensity_level",
      estimateConfidence: "estimate_confidence"
    };

    for (const [key, column] of Object.entries(FIELD_MAP)) {
      if (updates[key] !== undefined) {
        fields.push(`${column} = ?`);
        if (key === 'isActive') {
          values.push(updates[key] ? 1 : 0);
        } else {
          values.push(updates[key]);
        }
      }
    }

    if (updates.tags !== undefined) {
      fields.push("tags = ?");
      values.push(JSON.stringify(updates.tags || []));

      const muscleGroup = updates.tags[0] || 'General';
      const equipment = updates.tags[1] || 'Bodyweight';
      fields.push("muscle_group = ?");
      values.push(muscleGroup);
      fields.push("equipment = ?");
      values.push(equipment);
    }

    if (updates.trackingType !== undefined) {
      const exerciseType = updates.trackingType === 'sets_reps_weight' ? 'strength' :
                           updates.trackingType === 'duration_distance' ? 'cardio' :
                           updates.trackingType === 'duration_focus' ? 'mobility' : 'sports';
      fields.push("exercise_type = ?");
      values.push(exerciseType);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE exercise_library SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }
};

module.exports = { activityLibraryRepository };
