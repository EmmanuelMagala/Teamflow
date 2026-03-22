import pool from "../../config/db.js";
import { Workspace } from "../../types/index.js";

type WorkspaceMutationResult =
  | { kind: "success"; workspace: Workspace }
  | { kind: "duplicate_name" };

const normalizedNameExpression = `lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))`;

export const getWorkspacesByUserId = async (
  userId: number,
): Promise<Workspace[]> => {
  const result = await pool.query<Workspace>(
    `SELECT w.*
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId],
  );

  return result.rows;
};

export const getWorkspaceByIdAndUserId = async (
  workspaceId: number,
  userId: number,
): Promise<Workspace | null> => {
  const result = await pool.query<Workspace>(
    `SELECT w.*
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = $1 AND wm.user_id = $2`,
    [workspaceId, userId],
  );

  return result.rows[0] || null;
};

export const createWorkspace = async (
  name: string,
  ownerId: number,
): Promise<WorkspaceMutationResult> => {
  const existingWorkspaceResult = await pool.query<{ id: number }>(
    `SELECT id
     FROM workspaces
     WHERE owner_id = $1
       AND ${normalizedNameExpression} = lower(regexp_replace(btrim($2), '\\s+', ' ', 'g'))`,
    [ownerId, name],
  );

  if ((existingWorkspaceResult.rowCount ?? 0) > 0) {
    return { kind: "duplicate_name" };
  }

  const result = await pool.query<Workspace>(
    `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *`,
    [name, ownerId],
  );

  return { kind: "success", workspace: result.rows[0] };
};

export const updateWorkspaceByIdAndOwnerId = async (
  workspaceId: number,
  name: string,
  ownerId: number,
): Promise<WorkspaceMutationResult | null> => {
  const existingWorkspaceResult = await pool.query<{ id: number }>(
    `SELECT id
     FROM workspaces
     WHERE owner_id = $1
       AND id <> $2
       AND ${normalizedNameExpression} = lower(regexp_replace(btrim($3), '\\s+', ' ', 'g'))`,
    [ownerId, workspaceId, name],
  );

  if ((existingWorkspaceResult.rowCount ?? 0) > 0) {
    return { kind: "duplicate_name" };
  }

  const result = await pool.query<Workspace>(
    `UPDATE workspaces
     SET name = $1
     WHERE id = $2 AND owner_id = $3
     RETURNING *`,
    [name, workspaceId, ownerId],
  );

  if (!result.rows[0]) {
    return null;
  }

  return { kind: "success", workspace: result.rows[0] };
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
