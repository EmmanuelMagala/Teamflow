import api from "@/shared/lib/axios";
import type { Task, TaskIdColumns, TaskStatus } from "../types";

export const fetchTasks = async (projectId: number): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks?projectId=${projectId}`);
  return response.data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  project_id: number;
  due_date?: string;
}): Promise<Task> => {
  const response = await api.post<Task>("/tasks", data);
  return response.data;
};

export const updateTask = async (
  id: number,
  updates: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    due_date: string | null;
  }>,
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${id}`, updates);
  return response.data;
};

export const reorderTasks = async (
  projectId: number,
  columns: TaskIdColumns,
): Promise<Task[]> => {
  const response = await api.put<Task[]>("/tasks/reorder", {
    project_id: projectId,
    columns,
  });

  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
