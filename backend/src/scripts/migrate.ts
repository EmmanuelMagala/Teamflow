import { closeDatabasePool } from "../config/db.js";
import { runMigrations } from "../migrations/index.js";

const main = async () => {
  try {
    await runMigrations();
    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Database migrations failed.", error);
    process.exitCode = 1;
  } finally {
    await closeDatabasePool();
  }
};

void main();
