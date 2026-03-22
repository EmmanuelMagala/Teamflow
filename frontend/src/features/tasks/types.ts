export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  sort_order: number;
  project_id: number;
  assigned_user_id: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskIdColumns {
  todo: number[];
  in_progress: number[];
  done: number[];
}
