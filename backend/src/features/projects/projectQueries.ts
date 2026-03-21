import pool from "../../config/db.js";
import { Project } from "../../types/index.js";

export const getProjectsByWorkspaceIdAndOwnerId = async (
  workspaceId: number,
  ownerId: number,
): Promise<Project[]> => {
  const result = await pool.query<Project>(
    `SELECT p.*
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
		 WHERE p.workspace_id = $1 AND w.owner_id = $2
		 ORDER BY p.created_at DESC`,
    [workspaceId, ownerId],
  );

  return result.rows;
};

export const createProjectForOwner = async (
  name: string,
  workspaceId: number,
  ownerId: number,
): Promise<Project | null> => {
  const result = await pool.query<Project>(
    `INSERT INTO projects (name, workspace_id)
		 SELECT $1, w.id
		 FROM workspaces w
		 WHERE w.id = $2 AND w.owner_id = $3
		 RETURNING *`,
    [name, workspaceId, ownerId],
  );

  return result.rows[0] || null;
};

export const updateProjectByIdAndOwnerId = async (
  projectId: number,
  name: string,
  ownerId: number,
): Promise<Project | null> => {
  const result = await pool.query<Project>(
    `UPDATE projects
		 SET name = $1
		 WHERE id = $2
			 AND workspace_id IN (
				 SELECT id FROM workspaces WHERE owner_id = $3
			 )
		 RETURNING *`,
    [name, projectId, ownerId],
  );

  return result.rows[0] || null;
};

export const deleteProjectByIdAndOwnerId = async (
  projectId: number,
  ownerId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM projects
		 WHERE id = $1
			 AND workspace_id IN (
				 SELECT id FROM workspaces WHERE owner_id = $2
			 )`,
    [projectId, ownerId],
  );

  return (result.rowCount ?? 0) > 0;
};
