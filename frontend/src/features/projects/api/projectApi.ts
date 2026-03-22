import api from "@/shared/lib/axios";
import type { Project } from "../types";

export const fetchProjects = async (
  workspaceId: number,
): Promise<Project[]> => {
  const response = await api.get<Project[]>(
    `/projects?workspaceId=${workspaceId}`,
  );
  return response.data;
};

export const fetchProject = async (projectId: number): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${projectId}`);
  return response.data;
};

export const createProject = async (
  name: string,
  workspaceId: number,
): Promise<Project> => {
  const response = await api.post<Project>("/projects", {
    name,
    workspace_id: workspaceId,
  });

  return response.data;
};

export const updateProject = async (
  id: number,
  name: string,
): Promise<Project> => {
  const response = await api.patch<Project>(`/projects/${id}`, { name });
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
