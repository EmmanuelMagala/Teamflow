// src/types/index.ts

export interface User {
  id: number;
  clerk_id: string;
  email: string;
  created_at: Date;
}

export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
}

export type WorkspaceMemberRole = "owner" | "member";

export interface WorkspaceMember {
  workspace_id: number;
  user_id: number;
  role: WorkspaceMemberRole;
  created_at: Date;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  workspace_id: number;
  created_at: Date;
}

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  sort_order: number;
  project_id: number;
  assigned_user_id: number | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}
