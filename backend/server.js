require("dotenv").config();

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const app = require("./app");
const { initializeDatabase } = require("./src/utils/bootstrap");

const PORT = Number(process.env.PORT || 5000);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`track_daily backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start track_daily backend:", err);
    process.exit(1);
  });
