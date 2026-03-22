import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { updateWorkspace } from "../api/workspaceApi";

interface UpdateWorkspacePayload {
  id: number;
  name: string;
}

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, name }: UpdateWorkspacePayload) =>
      updateWorkspace(id, name),
    onSuccess: (workspace) => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      void queryClient.invalidateQueries({
        queryKey: ["workspace", workspace.id],
      });
      toast({
        variant: "success",
        title: "Workspace updated",
        description: `${workspace.name} was renamed successfully.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Workspace could not be updated",
        description: getErrorMessage(
          error,
          "The workspace name was not saved. Try again.",
        ),
      });
    },
  });
};
