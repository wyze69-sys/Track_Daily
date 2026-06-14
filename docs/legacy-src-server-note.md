# Legacy TypeScript Mock Server Note

The files previously located in `src/server` (TypeScript Express server using in-memory/JSON `db.json`) have been archived.

- Archive Location: `docs/legacy-src-server/`
- Archive Contents:
  - `server/` - The complete source code of the TypeScript mock Express server (app.ts, index.ts, and services/routes/middleware/repositories subfolders).
  - `db/` - The TypeScript mock database engine (`db.ts`) and mock database JSON store (`db.json`).
  - `README.md` - The old readme describing the monolithic Vite + TS server setup.

## Why was this archived?
The project has been refactored to cleanly separate the frontend (`client/`) and backend (`backend/`).
1. **Frontend (`client/`)**: Replaced the local TS server mode. It now runs a standard Vite dev server on port 5173, and proxy configurations in `vite.config.ts` route `/api` calls directly to the real Express backend.
2. **Backend (`backend/`)**: Relies entirely on the JavaScript Express server running on port 5000, which connects to the real `track_daily` MySQL database.
3. **Database (`database/`)**: Retained as the source of truth for the MySQL database migrations, seed datasets, and schema definitions.

This removes the mock `db.json` file completely from active application code and ensures all queries go directly to the MySQL database.
