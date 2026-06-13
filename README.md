# Logweb – Workout Log Application

Logweb is a responsive workout logging application built with a React frontend and Express backend.

## Project Structure Overview

```
logweb/
├── docs/                   # Project documentation & structure design
├── database/               # SQL schema definitions, migrations, and seed scripts
├── backend/                # Production Express backend and backend tests
├── src/                    # React frontend application
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page views
│   ├── services/           # Client-side network API services
│   └── server/             # Local Express API server
├── server.ts               # Local development entry point
└── package.json            # Scripts & project dependencies
```

For a detailed breakdown of directories, files, and where to add pages/components/routes, please see the [Project Structure Guide](file:///D:/PROJECT/logweb/docs/PROJECT_STRUCTURE.md).

## Getting Started

### Run Locally

**Prerequisites:** Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set the environment variables:**
   Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key.
3. **Run the local development server:**
   ```bash
   npm run dev
   ```
4. **Run production backend:**
   See instructions inside the [backend/README.md](file:///D:/PROJECT/logweb/backend/README.md).
