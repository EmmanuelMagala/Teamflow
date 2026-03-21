import pool from "../../config/db.js";
import { Task, TaskStatus } from "../../types/index.js";

type CreateTaskInput = {
  title: string;
  description?: string | null;
  projectId: number;
  assignedUserId?: number | null;
  dueDate?: string | null;
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assignedUserId?: number | null;
  dueDate?: string | null;
};

export const getTasksByProjectIdAndOwnerId = async (
  projectId: number,
  ownerId: number,
): Promise<Task[]> => {
  const result = await pool.query<Task>(
    `SELECT t.*
		 FROM tasks t
		 JOIN projects p ON p.id = t.project_id
		 JOIN workspaces w ON w.id = p.workspace_id
		 WHERE t.project_id = $1 AND w.owner_id = $2
		 ORDER BY t.created_at ASC`,
    [projectId, ownerId],
  );

  return result.rows;
};

export const createTaskForOwner = async (
  input: CreateTaskInput,
  ownerId: number,
): Promise<Task | null> => {
  const result = await pool.query<Task>(
    `INSERT INTO tasks (title, description, project_id, assigned_user_id, due_date)
		 SELECT $1, $2, p.id, $3, $4
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
		 WHERE p.id = $5 AND w.owner_id = $6
		 RETURNING *`,
    [
      input.title,
      input.description ?? null,
      input.assignedUserId ?? null,
      input.dueDate ?? null,
      input.projectId,
      ownerId,
    ],
  );

  return result.rows[0] || null;
};

export const updateTaskByIdAndOwnerId = async (
  taskId: number,
  ownerId: number,
  updates: UpdateTaskInput,
): Promise<Task | null> => {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];
  let index = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(updates.title);
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(updates.description);
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(updates.status);
  }

  if (updates.assignedUserId !== undefined) {
    fields.push(`assigned_user_id = $${index++}`);
    values.push(updates.assignedUserId);
  }

  if (updates.dueDate !== undefined) {
    fields.push(`due_date = $${index++}`);
    values.push(updates.dueDate);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(taskId, ownerId);

  const result = await pool.query<Task>(
    `UPDATE tasks
		 SET ${fields.join(", ")}
		 WHERE id = $${index++}
			 AND project_id IN (
				 SELECT p.id
				 FROM projects p
				 JOIN workspaces w ON w.id = p.workspace_id
				 WHERE w.owner_id = $${index}
			 )
		 RETURNING *`,
    values,
  );

  return result.rows[0] || null;
};

export const deleteTaskByIdAndOwnerId = async (
  taskId: number,
  ownerId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM tasks
		 WHERE id = $1
			 AND project_id IN (
				 SELECT p.id
				 FROM projects p
				 JOIN workspaces w ON w.id = p.workspace_id
				 WHERE w.owner_id = $2
			 )`,
    [taskId, ownerId],
  );

  return (result.rowCount ?? 0) > 0;
};
