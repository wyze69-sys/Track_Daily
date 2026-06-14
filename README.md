# Track Daily – Workout Log Application

Track Daily is a responsive workout logging application built with a React frontend and Express backend.

## Project Structure Overview

```
track_daily/
├── docs/                   # Project documentation & structure design
├── database/               # SQL schema definitions, migrations, and seed scripts
├── backend/                # Production Express & MySQL backend and backend tests
├── client/                 # React frontend application
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page views
│   ├── services/           # Client-side network API services
│   └── routes/             # Client-side router definition
├── package.json            # Workspaces configuration & root scripts
└── README.md               # Project guide
```

For a detailed breakdown of directories, files, and where to add pages/components/routes, please see the [Project Structure Guide](file:///D:/PROJECT/track_daily/docs/PROJECT_STRUCTURE.md).

## Getting Started

### Run Locally

**Prerequisites:** Node.js, MySQL (database `track_daily`)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set the environment variables:**
   - In `backend/.env`, configure your database variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, etc.).
   - Make sure your local MySQL instance has the `track_daily` database created or allowed to be created by the bootstrapper.
3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   This will run both the Vite frontend (on `http://localhost:5173`) and the Express backend (on `http://localhost:5000`) concurrently.
4. **Run backend tests:**
   ```bash
   npm test
   ```
