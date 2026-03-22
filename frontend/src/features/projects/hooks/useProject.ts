import { useQuery } from "@tanstack/react-query";
import { fetchProject } from "../api/projectApi";

export const useProject = (projectId: number) =>
  useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: Number.isFinite(projectId) && projectId > 0,
  });
