import type { PoolClient } from "pg";
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

type ReorderTasksInput = {
  projectId: number;
  columns: Record<TaskStatus, number[]>;
};

type ReorderTasksResult =
  | { kind: "success"; tasks: Task[] }
  | { kind: "project_not_found" }
  | { kind: "invalid_order" };

const taskOrderByClause = `
  CASE t.status
    WHEN 'todo' THEN 1
    WHEN 'in_progress' THEN 2
    WHEN 'done' THEN 3
    ELSE 4
  END,
  t.sort_order ASC,
  t.id ASC
`;

const getOrderedTasksForProjectAndOwner = async (
  client: Pick<PoolClient, "query">,
  projectId: number,
  userId: number,
) => {
  const result = await client.query<Task>(
    `SELECT t.*
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     JOIN workspaces w ON w.id = p.workspace_id
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE t.project_id = $1 AND wm.user_id = $2
     ORDER BY ${taskOrderByClause}`,
    [projectId, userId],
  );

  return result.rows;
};

export const getTasksByProjectIdAndOwnerId = async (
  projectId: number,
  userId: number,
): Promise<Task[]> => {
  return getOrderedTasksForProjectAndOwner(pool, projectId, userId);
};

export const createTaskForOwner = async (
  input: CreateTaskInput,
  userId: number,
): Promise<Task | null> => {
  const result = await pool.query<Task>(
    `INSERT INTO tasks (
     	title,
     	description,
     	project_id,
     	assigned_user_id,
     	due_date,
     	sort_order
     )
     SELECT
     	$1,
     	$2,
     	p.id,
     	$3,
     	$4,
     	COALESCE(
     		(
     			SELECT MAX(t.sort_order) + 1
     			FROM tasks t
     			WHERE t.project_id = p.id AND t.status = 'todo'
     		),
     		0
     	)
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE p.id = $5 AND wm.user_id = $6
		 RETURNING *`,
    [
      input.title,
      input.description ?? null,
      input.assignedUserId ?? null,
      input.dueDate ?? null,
      input.projectId,
      userId,
    ],
  );

  return result.rows[0] || null;
};

export const updateTaskByIdAndOwnerId = async (
  taskId: number,
  userId: number,
  updates: UpdateTaskInput,
): Promise<Task | null> => {
  const client = await pool.connect();
  const fields: string[] = [];
  const values: Array<string | number | null> = [];
  let index = 1;
  let nextStatusSortOrder: number | null = null;

  try {
    await client.query("BEGIN");

    const currentTaskResult = await client.query<
      Pick<Task, "id" | "project_id" | "status">
    >(
      `SELECT t.id, t.project_id, t.status
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN workspaces w ON w.id = p.workspace_id
       JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE t.id = $1 AND wm.user_id = $2`,
      [taskId, userId],
    );

    const currentTask = currentTaskResult.rows[0];

    if (!currentTask) {
      await client.query("ROLLBACK");
      return null;
    }

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

      const nextSortOrderResult = await client.query<{
        next_sort_order: number;
      }>(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
         FROM tasks
         WHERE project_id = $1
           AND status = $2
           AND id <> $3`,
        [currentTask.project_id, updates.status, taskId],
      );

      nextStatusSortOrder = nextSortOrderResult.rows[0]?.next_sort_order ?? 0;
      fields.push(`sort_order = $${index++}`);
      values.push(nextStatusSortOrder);
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
      await client.query("ROLLBACK");
      return null;
    }

    values.push(taskId, userId);

    const result = await client.query<Task>(
      `UPDATE tasks AS target
		 SET ${fields.join(", ")}
       WHERE target.id = $${index++}
         AND target.project_id IN (
				 SELECT p.id
				 FROM projects p
				 JOIN workspaces w ON w.id = p.workspace_id
           JOIN workspace_members wm ON wm.workspace_id = w.id
           WHERE wm.user_id = $${index}
			 )
		 RETURNING *`,
      values,
    );

    await client.query("COMMIT");

    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const reorderTasksForOwner = async (
  input: ReorderTasksInput,
  userId: number,
): Promise<ReorderTasksResult> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query<{ id: number }>(
      `SELECT p.id
		 FROM projects p
		 JOIN workspaces w ON w.id = p.workspace_id
		 JOIN workspace_members wm ON wm.workspace_id = w.id
		 WHERE p.id = $1 AND wm.user_id = $2`,
      [input.projectId, userId],
    );

    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { kind: "project_not_found" };
    }

    const existingTasks = await getOrderedTasksForProjectAndOwner(
      client,
      input.projectId,
      userId,
    );
    const submittedTaskIds = [
      ...input.columns.todo,
      ...input.columns.in_progress,
      ...input.columns.done,
    ];
    const uniqueTaskIds = new Set(submittedTaskIds);

    if (
      submittedTaskIds.length !== existingTasks.length ||
      uniqueTaskIds.size !== submittedTaskIds.length
    ) {
      await client.query("ROLLBACK");
      return { kind: "invalid_order" };
    }

    const existingTaskIds = new Set(existingTasks.map((task) => task.id));

    if (submittedTaskIds.some((taskId) => !existingTaskIds.has(taskId))) {
      await client.query("ROLLBACK");
      return { kind: "invalid_order" };
    }

    if (submittedTaskIds.length > 0) {
      const values: Array<number | string> = [];
      const rows: string[] = [];
      let index = 1;

      for (const status of ["todo", "in_progress", "done"] as const) {
        input.columns[status].forEach((taskId, sortOrder) => {
          rows.push(`($${index++}::int, $${index++}::text, $${index++}::int)`);
          values.push(taskId, status, sortOrder);
        });
      }

      values.push(input.projectId);

      await client.query(
        `UPDATE tasks AS target
		   SET status = updates.status,
			     sort_order = updates.sort_order
		   FROM (
			 VALUES ${rows.join(", ")}
		   ) AS updates(id, status, sort_order)
		   WHERE target.id = updates.id
		     AND target.project_id = $${index}`,
        values,
      );
    }

    const tasks = await getOrderedTasksForProjectAndOwner(
      client,
      input.projectId,
      userId,
    );

    await client.query("COMMIT");

    return { kind: "success", tasks };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteTaskByIdAndOwnerId = async (
  taskId: number,
  userId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM tasks
		 WHERE id = $1
			 AND project_id IN (
				 SELECT p.id
				 FROM projects p
				 JOIN workspaces w ON w.id = p.workspace_id
         JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $2
			 )`,
    [taskId, userId],
  );

  return (result.rowCount ?? 0) > 0;
};
