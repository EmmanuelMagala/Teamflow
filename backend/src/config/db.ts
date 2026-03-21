// src/config/db.ts
import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false },
});

pool.on("connect", () => console.log("✅ PostgreSQL connected"));
pool.on("error", (err) => console.error("❌ PostgreSQL pool error", err));

export const checkDatabaseHealth = async () => {
  await pool.query("SELECT 1");
};

export const closeDatabasePool = async () => {
  await pool.end();
};

export default pool;
