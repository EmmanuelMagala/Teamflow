export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export type WorkspaceMemberRole = "owner" | "member";

export interface WorkspaceMember {
  workspace_id: number;
  user_id: number;
  role: WorkspaceMemberRole;
  created_at: string;
  email: string;
}
