// src/features/users/userQueries.ts
import pool from "../../config/db.js";
import { User } from "../../types/index.js";

export const upsertUser = async (
  clerkId: string,
  email: string,
): Promise<User> => {
  const result = await pool.query<User>(
    `INSERT INTO users (clerk_id, email)
     VALUES ($1, $2)
     ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
     RETURNING *`,
    [clerkId, email],
  );
  return result.rows[0];
};

export const getUserByClerkId = async (
  clerkId: string,
): Promise<User | null> => {
  const result = await pool.query<User>(
    `SELECT * FROM users WHERE clerk_id = $1`,
    [clerkId],
  );
  return result.rows[0] || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<User>(
    `SELECT *
     FROM users
     WHERE lower(email) = lower($1)`,
    [email],
  );

  return result.rows[0] || null;
};
