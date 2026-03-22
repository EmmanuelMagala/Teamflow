import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../api/projectApi";

export const useProjects = (workspaceId: number) =>
  useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => fetchProjects(workspaceId),
    enabled: Number.isFinite(workspaceId) && workspaceId > 0,
  });
