import type { Migration } from "./index.js";

export const addWorkspaceMembersMigration: Migration = {
  id: "003_add_workspace_members",
  name: "Add workspace members table",
  up: `
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id integer NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('owner', 'member')),
      created_at timestamptz NOT NULL DEFAULT NOW(),
      PRIMARY KEY (workspace_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
      ON workspace_members (user_id);

    INSERT INTO workspace_members (workspace_id, user_id, role)
    SELECT w.id, w.owner_id, 'owner'
    FROM workspaces w
    ON CONFLICT (workspace_id, user_id) DO UPDATE
      SET role = EXCLUDED.role;

    CREATE OR REPLACE FUNCTION ensure_workspace_owner_membership()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (NEW.id, NEW.owner_id, 'owner')
      ON CONFLICT (workspace_id, user_id) DO UPDATE
        SET role = EXCLUDED.role;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_ensure_workspace_owner_membership ON workspaces;

    CREATE TRIGGER trg_ensure_workspace_owner_membership
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION ensure_workspace_owner_membership();
  `,
};
