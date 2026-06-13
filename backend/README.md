# Backend Application Server (`backend/`)

This directory houses the real production-ready Node.js & Express backend.

## Structure Overview
- **[src/config/](file:///D:/PROJECT/logweb/backend/src/config/)**: Database connections and environment setups.
- **[src/controllers/](file:///D:/PROJECT/logweb/backend/src/controllers/)**: Request handoff and validation boundary handling logic.
- **[src/services/](file:///D:/PROJECT/logweb/backend/src/services/)**: Domain business logic.
- **[src/repositories/](file:///D:/PROJECT/logweb/backend/src/repositories/)**: Data layer interactions (SQL execution).
- **[src/routes/](file:///D:/PROJECT/logweb/backend/src/routes/)**: API routing mountpoints matching path requests to controllers.
- **[src/middleware/](file:///D:/PROJECT/logweb/backend/src/middleware/)**: Auth verification and system middleware.
- **[test/](file:///D:/PROJECT/logweb/backend/test/)**: Mocha/Chai/Jest test specs validating database transactions, controllers, and routing logic.
