import pool from "../../config/db.js";
import { WorkspaceMember, WorkspaceMemberRole } from "../../types/index.js";

type InviteWorkspaceMemberResult =
  | { kind: "success"; member: WorkspaceMember }
  | { kind: "workspace_not_found" }
  | { kind: "already_member" };

type RemoveWorkspaceMemberResult =
  | { kind: "success" }
  | { kind: "workspace_not_found" }
  | { kind: "member_not_found" }
  | { kind: "cannot_remove_owner" };

const isUniqueViolation = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
};

export const getWorkspaceMembersForUser = async (
  workspaceId: number,
  userId: number,
): Promise<WorkspaceMember[] | null> => {
  const membershipResult = await pool.query<{ workspace_id: number }>(
    `SELECT workspace_id
     FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId],
  );

  if ((membershipResult.rowCount ?? 0) === 0) {
    return null;
  }

  const result = await pool.query<WorkspaceMember>(
    `SELECT wm.workspace_id, wm.user_id, wm.role, wm.created_at, u.email
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = $1
     ORDER BY CASE wm.role WHEN 'owner' THEN 0 ELSE 1 END, lower(u.email) ASC`,
    [workspaceId],
  );

  return result.rows;
};

export const inviteWorkspaceMember = async (
  workspaceId: number,
  ownerId: number,
  targetUserId: number,
): Promise<InviteWorkspaceMemberResult> => {
  const workspaceResult = await pool.query<{ id: number }>(
    `SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2`,
    [workspaceId, ownerId],
  );

  if ((workspaceResult.rowCount ?? 0) === 0) {
    return { kind: "workspace_not_found" };
  }

  try {
    const result = await pool.query<WorkspaceMember>(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'member')
       RETURNING workspace_id, user_id, role, created_at, ''::text AS email`,
      [workspaceId, targetUserId],
    );

    return { kind: "success", member: result.rows[0] };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { kind: "already_member" };
    }

    throw error;
  }
};

export const removeWorkspaceMember = async (
  workspaceId: number,
  ownerId: number,
  targetUserId: number,
): Promise<RemoveWorkspaceMemberResult> => {
  const workspaceResult = await pool.query<{ id: number }>(
    `SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2`,
    [workspaceId, ownerId],
  );

  if ((workspaceResult.rowCount ?? 0) === 0) {
    return { kind: "workspace_not_found" };
  }

  const memberResult = await pool.query<{ role: WorkspaceMemberRole }>(
    `SELECT role
     FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, targetUserId],
  );

  const member = memberResult.rows[0];

  if (!member) {
    return { kind: "member_not_found" };
  }

  if (member.role === "owner") {
    return { kind: "cannot_remove_owner" };
  }

  await pool.query(
    `DELETE FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, targetUserId],
  );

  return { kind: "success" };
};
