import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../api/taskApi";

export const useTasks = (projectId: number) =>
  useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: Number.isFinite(projectId) && projectId > 0,
  });
