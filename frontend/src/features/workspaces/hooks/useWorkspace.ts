import { useQuery } from "@tanstack/react-query";
import { fetchWorkspace } from "../api/workspaceApi";

export const useWorkspace = (workspaceId: number) =>
  useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => fetchWorkspace(workspaceId),
    enabled: Number.isFinite(workspaceId) && workspaceId > 0,
  });
