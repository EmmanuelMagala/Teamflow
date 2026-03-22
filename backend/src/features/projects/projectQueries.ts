import pool from "../../config/db.js";
import { Project } from "../../types/index.js";

type ProjectCreateResult =
  | { kind: "success"; project: Project }
  | { kind: "workspace_not_found" }
  | { kind: "duplicate_name" };

type ProjectUpdateResult =
  | { kind: "success"; project: Project }
  | { kind: "duplicate_name" };

const normalizedNameExpression = `lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))`;

export const getProjectsByWorkspaceIdAndOwnerId = async (
  workspaceId: number,
  userId: number,
): Promise<Project[]> => {
  const result = await pool.query<Project>(
    `SELECT p.*
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
		 JOIN workspace_members wm ON wm.workspace_id = w.id
		 WHERE p.workspace_id = $1 AND wm.user_id = $2
		 ORDER BY p.created_at DESC`,
    [workspaceId, userId],
  );

  return result.rows;
};

export const getProjectByIdAndOwnerId = async (
  projectId: number,
  userId: number,
): Promise<Project | null> => {
  const result = await pool.query<Project>(
    `SELECT p.*
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
		 JOIN workspace_members wm ON wm.workspace_id = w.id
		 WHERE p.id = $1 AND wm.user_id = $2`,
    [projectId, userId],
  );

  return result.rows[0] || null;
};

export const createProjectForOwner = async (
  name: string,
  workspaceId: number,
  userId: number,
): Promise<ProjectCreateResult> => {
  const workspaceResult = await pool.query<{ id: number }>(
    `SELECT w.id
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = $1 AND wm.user_id = $2`,
    [workspaceId, userId],
  );

  if ((workspaceResult.rowCount ?? 0) === 0) {
    return { kind: "workspace_not_found" };
  }

  const existingProjectResult = await pool.query<{ id: number }>(
    `SELECT p.id
     FROM projects p
     WHERE p.workspace_id = $1
       AND ${normalizedNameExpression} = lower(regexp_replace(btrim($2), '\\s+', ' ', 'g'))`,
    [workspaceId, name],
  );

  if ((existingProjectResult.rowCount ?? 0) > 0) {
    return { kind: "duplicate_name" };
  }

  const result = await pool.query<Project>(
    `INSERT INTO projects (name, workspace_id)
		 SELECT $1, w.id
		 FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = $2 AND wm.user_id = $3
		 RETURNING *`,
    [name, workspaceId, userId],
  );

  return { kind: "success", project: result.rows[0] };
};

export const updateProjectByIdAndOwnerId = async (
  projectId: number,
  name: string,
  userId: number,
): Promise<ProjectUpdateResult | null> => {
  const currentProjectResult = await pool.query<
    Pick<Project, "id" | "workspace_id">
  >(
    `SELECT p.id, p.workspace_id
     FROM projects p
     JOIN workspaces w ON w.id = p.workspace_id
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE p.id = $1 AND wm.user_id = $2`,
    [projectId, userId],
  );

  const currentProject = currentProjectResult.rows[0];

  if (!currentProject) {
    return null;
  }

  const existingProjectResult = await pool.query<{ id: number }>(
    `SELECT p.id
     FROM projects p
     WHERE p.workspace_id = $1
       AND p.id <> $2
       AND ${normalizedNameExpression} = lower(regexp_replace(btrim($3), '\\s+', ' ', 'g'))`,
    [currentProject.workspace_id, projectId, name],
  );

  if ((existingProjectResult.rowCount ?? 0) > 0) {
    return { kind: "duplicate_name" };
  }

  const result = await pool.query<Project>(
    `UPDATE projects
		 SET name = $1
		 WHERE id = $2
			 AND workspace_id IN (
         SELECT w.id
         FROM workspaces w
         JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $3
			 )
		 RETURNING *`,
    [name, projectId, userId],
  );

  return { kind: "success", project: result.rows[0] };
};

export const deleteProjectByIdAndOwnerId = async (
  projectId: number,
  userId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM projects
		 WHERE id = $1
			 AND workspace_id IN (
				 SELECT w.id
				 FROM workspaces w
				 JOIN workspace_members wm ON wm.workspace_id = w.id
				 WHERE wm.user_id = $2
			 )`,
    [projectId, userId],
  );

  return (result.rowCount ?? 0) > 0;
};
