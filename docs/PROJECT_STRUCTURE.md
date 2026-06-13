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
├── src/                    # Frontend React application (and development mock server)
│   ├── components/         # Frontend shared UI components
│   ├── pages/              # Frontend page containers
│   ├── services/           # Frontend API and business services
│   ├── server/             # Development mock server source code
│   └── App.tsx & main.tsx  # React application root entrypoints
├── server.ts               # Root entrypoint that boots the Vite/mock dev server
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
All relational SQL schemas, database setup queries, mock seeds, and migration scripts reside in [database/](file:///D:/PROJECT/logweb/database/).
- `schema.sql`: Contains the primary PostgreSQL/MySQL schema tables.
- `seed.sql`: Contains mock/development initial seed datasets.
- `migrations/`: Holds structural alter-table/migration SQL scripts.

## 4. Development Server Role (`server.ts` & `src/server/`)
For local developer speed and ease of testing without requiring a live database connection or full-blown external hosting, the frontend features a Vite development server mounted alongside a mock Express server in [src/server/](file:///D:/PROJECT/logweb/src/server/).
- Root `server.ts` is the main entry point run by `npm run dev`.
- It dynamically loads Vite's middleware inside an Express application (`src/server/app.ts`) to serve pages and mock API endpoints.
