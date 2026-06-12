const pool = require("../config/db");
const { createId } = require("../utils/ids");
const { mapTemplateRow } = require("../utils/rowMappers");

async function getTemplates() {
  const [rows] = await pool.execute(
    "SELECT * FROM workout_templates ORDER BY sort_order ASC, created_at DESC"
  );
  return rows.map(mapTemplateRow);
}

async function getTemplateById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM workout_templates WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  return mapTemplateRow(rows[0]);
}

async function getActiveTemplates() {
  const [rows] = await pool.execute(
    "SELECT * FROM workout_templates WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC"
  );
  return rows.map(mapTemplateRow);
}

async function createTemplate(template, creatorId = null) {
  const id = createId("tpl");
  const exercisesJson = JSON.stringify(template.exercises || []);

  const title = template.title || template.name || "";
  const categoryName = template.categoryName || template.category || "";
  const durationMin = template.durationMin !== undefined ? template.durationMin : (template.durationMinutes !== undefined ? template.durationMinutes : 30);
  const description = template.description || "";

  await pool.execute(
    `INSERT INTO workout_templates (
      id, title, description, category_id, category_name, subtype, duration_min, exercises, is_active, sort_order, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      description,
      template.categoryId || null,
      categoryName,
      template.subtype || null,
      durationMin,
      exercisesJson,
      template.isActive !== undefined ? (template.isActive ? 1 : 0) : 1,
      template.sortOrder !== undefined ? template.sortOrder : 0,
      creatorId
    ]
  );

  return getTemplateById(id);
}

async function updateTemplate(id, updates) {
  const fields = [];
  const values = [];

  const title = updates.title !== undefined ? updates.title : updates.name;
  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(updates.categoryId || null);
  }
  const categoryName = updates.categoryName !== undefined ? updates.categoryName : updates.category;
  if (categoryName !== undefined) {
    fields.push("category_name = ?");
    values.push(categoryName);
  }
  if (updates.subtype !== undefined) {
    fields.push("subtype = ?");
    values.push(updates.subtype || null);
  }
  const durationMin = updates.durationMin !== undefined ? updates.durationMin : updates.durationMinutes;
  if (durationMin !== undefined) {
    fields.push("duration_min = ?");
    values.push(durationMin);
  }
  if (updates.exercises !== undefined) {
    fields.push("exercises = ?");
    values.push(JSON.stringify(updates.exercises));
  }
  if (updates.isActive !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.isActive ? 1 : 0);
  }
  if (updates.sortOrder !== undefined) {
    fields.push("sort_order = ?");
    values.push(updates.sortOrder);
  }

  if (fields.length > 0) {
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE workout_templates SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new Error("Workout template not found");
    }
  }

  return getTemplateById(id);
}

async function deleteTemplate(id) {
  const [result] = await pool.execute(
    "DELETE FROM workout_templates WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  templateRepository: {
    getTemplates,
    getTemplateById,
    getActiveTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
};
