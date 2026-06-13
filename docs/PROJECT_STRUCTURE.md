# Logweb Project Structure Guide

This document describes the structure of the Logweb project, helping developers understand where to find resources and where to add new files.

## Project Structure Overview

```
logweb/
├── docs/                   # Project documentation
│   └── PROJECT_STRUCTURE.md # This guide
├── database/               # SQL schemas, migrations, and seed scripts
├── backend/                # Real production Express backend
│   ├── src/                # Backend source code (Controllers, Services, Routes, Repositories)
│   └── test/               # Backend integration and unit tests
├── src/                    # Frontend React application and local API server
│   ├── components/         # Frontend shared UI components
│   ├── pages/              # Frontend page containers
│   ├── services/           # Frontend API and business services
│   ├── server/             # Express API server source code for local development
│   └── App.tsx & main.tsx  # React application root entrypoints
├── server.ts               # Root entrypoint that boots the Vite + Express dev server
├── package.json            # Node project configuration and run scripts
└── vite.config.ts          # Vite configuration for development and build bundler
```

---

## 1. Frontend Location (`src/`)
The frontend React client app resides under the `src/` directory.
- **Where to add Pages**: Add new page containers in [src/pages/](file:///D:/PROJECT/logweb/src/pages/).
- **Where to add Components**: Add reusable UI elements in [src/components/](file:///D:/PROJECT/logweb/src/components/).
- **Where to add Services**: Place frontend API client services in [src/services/](file:///D:/PROJECT/logweb/src/services/).

## 2. Backend Location (`backend/`)
The production Express API application is stored in the [backend/](file:///D:/PROJECT/logweb/backend/) directory.
- **Where to add controllers/services/routes**:
  - **Controllers**: [backend/src/controllers/](file:///D:/PROJECT/logweb/backend/src/controllers/)
  - **Services**: [backend/src/services/](file:///D:/PROJECT/logweb/backend/src/services/)
  - **Routes**: [backend/src/routes/](file:///D:/PROJECT/logweb/backend/src/routes/)
  - **Repositories**: [backend/src/repositories/](file:///D:/PROJECT/logweb/backend/src/repositories/)
  - **Middleware**: [backend/src/middleware/](file:///D:/PROJECT/logweb/backend/src/middleware/)

## 3. Database Location (`database/`)
All relational SQL schemas, database setup queries, reference seed data, and migration scripts reside in [database/](file:///D:/PROJECT/logweb/database/).
- `schema.sql`: Contains the primary PostgreSQL/MySQL schema tables.
- `seed.sql`: Contains reference seed datasets used to initialize development databases.
- `migrations/`: Holds structural alter-table/migration SQL scripts.

## 4. Development Server Role (`server.ts` & `src/server/`)
For local developer speed and ease of testing without requiring external hosting, the app runs Vite middleware alongside a real Express API server in [src/server/](file:///D:/PROJECT/logweb/src/server/).
- Root `server.ts` is the main entry point run by `npm run dev`.
- It dynamically loads Vite's middleware inside an Express application (`src/server/app.ts`) to serve pages and API endpoints backed by the local data layer.
