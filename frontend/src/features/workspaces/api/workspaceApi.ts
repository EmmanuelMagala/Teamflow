import api from "@/shared/lib/axios";
import type { Workspace, WorkspaceMember } from "../types";

export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<Workspace[]>("/workspaces");
  return response.data;
};

export const fetchWorkspace = async (id: number): Promise<Workspace> => {
  const response = await api.get<Workspace>(`/workspaces/${id}`);
  return response.data;
};

export const createWorkspace = async (name: string): Promise<Workspace> => {
  const response = await api.post<Workspace>("/workspaces", { name });
  return response.data;
};

export const updateWorkspace = async (
  id: number,
  name: string,
): Promise<Workspace> => {
  const response = await api.patch<Workspace>(`/workspaces/${id}`, { name });
  return response.data;
};

export const deleteWorkspace = async (id: number): Promise<void> => {
  await api.delete(`/workspaces/${id}`);
};

export const fetchWorkspaceMembers = async (
  workspaceId: number,
): Promise<WorkspaceMember[]> => {
  const response = await api.get<WorkspaceMember[]>(
    `/workspaces/${workspaceId}/members`,
  );
  return response.data;
};

export const inviteWorkspaceMember = async (
  workspaceId: number,
  email: string,
): Promise<WorkspaceMember> => {
  const response = await api.post<WorkspaceMember>(
    `/workspaces/${workspaceId}/members/invite`,
    { email },
  );

  return response.data;
};

export const removeWorkspaceMember = async (
  workspaceId: number,
  userId: number,
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
};
