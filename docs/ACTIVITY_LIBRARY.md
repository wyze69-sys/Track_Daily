# Activity Library

This document explains the architecture, storage, query parameters, duplicate avoidance, and backward compatibility mappings of the **Activity Library** in logweb.

## Storage Locations

To keep development simple while supporting production relational databases:
1. **TS Server (In-Memory/JSON Database)**:
   - File: `src/db/db.json` (managed under `src/db/db.ts`)
   - Table: `activityLibrary`
   - Seed Source: `database/seed/activity-library.json`
   - Population: Automatically loaded from the seed JSON on server start if `activityLibrary` is empty or missing.
2. **MySQL Database (Staging/Production)**:
   - Table: `exercise_library`
   - Migration/Seed: `database/migrations/0010_activity_library_seeds.sql`

---

## Category to Tracking Type Mapping

Default tracking types are mapped based on categories to provide customized logging forms:

| Category | JSON ID | SQL ID | Tracking Type | Description |
|---|---|---|---|---|
| **Strength** | `cat-1` | `cat_strength` | `sets_reps_weight` | Logs sets, reps, and weight |
| **Cardio** | `cat-2` | `cat_cardio` | `duration_distance` | Logs duration and distance |
| **Flexibility & Yoga** | `cat-3` | `cat_mobility` / `cat_yoga` | `duration_focus` | Logs duration and core focus |
| **Sports** | `cat-4` | `cat_sports` | `duration_intensity` | Logs duration and relative intensity |

---

## Duplicate Avoidance Rule

Duplicates are prevented at the service layer by checking the combination of `normalizedName` + `categoryId`.
- **Name Normalization**: Names are trimmed, lowercased, and consecutive spaces are collapsed (e.g. `" Bench   Press "` becomes `"bench press"`).
- **Scope**: Users can create activities with identical names in *different* categories, but name collisions *within the same category* are rejected with a `400 Bad Request` status code.

---

## API Documentation

### `GET /api/activity-library` (also mapped to `/api/exercises`)

Query parameters (all optional):
- `categoryId`: Filter activities by specific category ID.
- `categoryName`: Filter activities by category name (case-insensitive).
- `search`: Case-insensitive search on activity `name` and elements in the `tags` array.
- `limit`: Number of items to return (default: `25`).
- `offset`: Starting index for pagination (default: `0`).
- `includeInactive`: Boolean (`true` or `false`). Allowed for admins only. If `true`, returns inactive activities.

#### Response Format
Returns a JSON array of activity objects.

### `POST /api/activity-library` (also mapped to `/api/exercises`)

Create a custom activity.

Request body:
```json
{
  "name": "Single-Leg Squat",
  "categoryId": "cat-1",
  "tags": ["Legs", "Bodyweight"],
  "difficulty": "intermediate"
}
```

---

## Backward Compatibility with `/api/exercises`

To avoid breaking existing templates, workout logs, and frontend views:
1. Both `/api/activity-library` and `/api/exercises` route to the same handler.
2. The responses automatically merge the new `ActivityLibraryItem` fields with legacy `ExerciseLibraryItem` fields:
   - `muscleGroup` is mapped from `tags[0]` or defaults to `"General"`.
   - `equipment` is mapped from `tags[1]` or defaults to `"Bodyweight"`.
   - `exerciseType` is mapped from `trackingType` (`strength`, `cardio`, `mobility`, `sports`).
   - `isCustom` is mapped from `source === 'custom'`.
