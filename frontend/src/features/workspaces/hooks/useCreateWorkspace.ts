import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { createWorkspace } from "../api/workspaceApi";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: (workspace) => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast({
        variant: "success",
        title: "Workspace created",
        description: `${workspace.name} is ready for projects and tasks.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Workspace could not be created",
        description: getErrorMessage(
          error,
          "Check the workspace name and backend connection, then try again.",
        ),
      });
    },
  });
};
