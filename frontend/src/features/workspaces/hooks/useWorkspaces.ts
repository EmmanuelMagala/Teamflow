import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaces } from "../api/workspaceApi";

export const useWorkspaces = () =>
  useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });
