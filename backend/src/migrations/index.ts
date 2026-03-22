import type { PoolClient } from "pg";
import pool from "../config/db.js";
import { addTaskSortOrderMigration } from "./migration_001_add_task_sort_order.js";
import { addNormalizedNameUniquenessMigration } from "./migration_002_add_normalized_name_uniqueness.js";
import { addWorkspaceMembersMigration } from "./migration_003_add_workspace_members.js";

export interface Migration {
  id: string;
  name: string;
  up: string;
}

const migrations: Migration[] = [
  addTaskSortOrderMigration,
  addNormalizedNameUniquenessMigration,
  addWorkspaceMembersMigration,
];

const ensureMigrationsTable = async (client: Pick<PoolClient, "query">) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT NOW()
    )
  `);
};

export const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const appliedResult = await client.query<{ id: string }>(
      "SELECT id FROM schema_migrations ORDER BY id ASC",
    );
    const appliedIds = new Set(appliedResult.rows.map((row) => row.id));

    for (const migration of migrations) {
      if (appliedIds.has(migration.id)) {
        continue;
      }

      await client.query("BEGIN");

      try {
        await client.query(migration.up);
        await client.query(
          "INSERT INTO schema_migrations (id, name) VALUES ($1, $2)",
          [migration.id, migration.name],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
};
