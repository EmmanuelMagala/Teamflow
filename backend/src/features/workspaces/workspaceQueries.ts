import pool from "../../config/db.js";
import { Workspace } from "../../types/index.js";

export const getWorkspacesByOwnerId = async (
  ownerId: number,
): Promise<Workspace[]> => {
  const result = await pool.query<Workspace>(
    `SELECT * FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId],
  );

  return result.rows;
};

export const createWorkspace = async (
  name: string,
  ownerId: number,
): Promise<Workspace> => {
  const result = await pool.query<Workspace>(
    `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *`,
    [name, ownerId],
  );

  return result.rows[0];
};

export const deleteWorkspaceByIdAndOwnerId = async (
  workspaceId: number,
  ownerId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM workspaces WHERE id = $1 AND owner_id = $2`,
    [workspaceId, ownerId],
  );

  return (result.rowCount ?? 0) > 0;
};
