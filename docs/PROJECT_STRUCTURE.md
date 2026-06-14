# Track Daily Project Structure Guide

This document describes the structure of the Track Daily project, helping developers understand where to find resources and where to add new files.

## Project Structure Overview

```
track_daily/
├── docs/                   # Project documentation
│   └── PROJECT_STRUCTURE.md # This guide
├── database/               # SQL schemas, migrations, and seed scripts
├── backend/                # Real production Express/MySQL backend
│   ├── src/                # Backend source code (Controllers, Services, Routes, Repositories)
│   └── test/               # Backend integration and unit tests
├── client/                 # Frontend React application (React + Vite + TS)
│   ├── src/                # Frontend source code
│   │   ├── components/     # Frontend shared UI components
│   │   ├── pages/          # Frontend page containers
│   │   ├── services/       # Frontend API client services
│   │   └── App.tsx & main.tsx # React application root entrypoints
│   ├── index.html          # Frontend main entry HTML
│   ├── vite.config.ts      # Vite configuration with /api proxy to backend
│   └── tsconfig.json       # TypeScript configuration for client
├── package.json            # Root configuration and npm run scripts delegating to workspace packages
```

---

## 1. Frontend Location (`client/`)
The frontend React client app resides under the `client/` directory.
- **Where to add Pages**: Add new page containers in [client/src/pages/](file:///D:/PROJECT/track_daily/client/src/pages/).
- **Where to add Components**: Add reusable UI elements in [client/src/components/](file:///D:/PROJECT/track_daily/client/src/components/).
- **Where to add Services**: Place frontend API client services in [client/src/services/](file:///D:/PROJECT/track_daily/client/src/services/).

## 2. Backend Location (`backend/`)
The production Express API application is stored in the [backend/](file:///D:/PROJECT/track_daily/backend/) directory. It connects to the `track_daily` MySQL database.
- **Where to add controllers/services/routes**:
- **Controllers**: [backend/src/controllers/](file:///D:/PROJECT/track_daily/backend/src/controllers/)
- **Services**: [backend/src/services/](file:///D:/PROJECT/track_daily/backend/src/services/)
- **Routes**: [backend/src/routes/](file:///D:/PROJECT/track_daily/backend/src/routes/)
- **Repositories**: [backend/src/repositories/](file:///D:/PROJECT/track_daily/backend/src/repositories/)
- **Middleware**: [backend/src/middleware/](file:///D:/PROJECT/track_daily/backend/src/middleware/)

## 3. Database Location (`database/`)
All relational SQL schemas, database setup queries, reference seed data, and migration scripts reside in [database/](file:///D:/PROJECT/track_daily/database/).
- `schema.sql`: Contains the primary PostgreSQL/MySQL schema tables.
- `seed.sql`: Contains reference seed datasets used to initialize development databases.
- `migrations/`: Holds structural alter-table/migration SQL scripts.
