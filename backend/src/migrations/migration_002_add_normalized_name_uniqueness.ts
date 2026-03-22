import type { Migration } from "./index.js";

export const addNormalizedNameUniquenessMigration: Migration = {
  id: "002_add_normalized_name_uniqueness",
  name: "Add normalized workspace and project name uniqueness",
  up: `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_owner_normalized_name_unique
      ON workspaces (
        owner_id,
        lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))
      );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_workspace_normalized_name_unique
      ON projects (
        workspace_id,
        lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))
      );
  `,
};
