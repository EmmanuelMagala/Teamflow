import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceMembers } from "../api/workspaceApi";

export const useWorkspaceMembers = (workspaceId: number, enabled = true) =>
  useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => fetchWorkspaceMembers(workspaceId),
    enabled: enabled && Number.isFinite(workspaceId) && workspaceId > 0,
  });
