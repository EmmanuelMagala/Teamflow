import type { Migration } from "./index.js";

export const addTaskSortOrderMigration: Migration = {
  id: "001_add_task_sort_order",
  name: "Add persisted task sort order",
  up: `
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS sort_order integer;

    WITH ranked_tasks AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY project_id, status
          ORDER BY created_at ASC, id ASC
        ) - 1 AS next_sort_order
      FROM tasks
    )
    UPDATE tasks AS target
    SET sort_order = ranked_tasks.next_sort_order
    FROM ranked_tasks
    WHERE target.id = ranked_tasks.id
      AND (target.sort_order IS NULL OR target.sort_order <> ranked_tasks.next_sort_order);

    UPDATE tasks
    SET sort_order = 0
    WHERE sort_order IS NULL;

    ALTER TABLE tasks
    ALTER COLUMN sort_order SET DEFAULT 0;

    CREATE INDEX IF NOT EXISTS idx_tasks_project_status_sort_order
      ON tasks (project_id, status, sort_order);
  `,
};
