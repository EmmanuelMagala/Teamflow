import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { deleteWorkspace } from "../api/workspaceApi";

interface DeleteWorkspacePayload {
  id: number;
}

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id }: DeleteWorkspacePayload) => deleteWorkspace(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      void queryClient.removeQueries({
        queryKey: ["workspace", variables.id],
      });
      toast({
        variant: "success",
        title: "Workspace deleted",
        description: "The workspace was removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Workspace could not be deleted",
        description: getErrorMessage(
          error,
          "The workspace is still in place because the delete request failed.",
        ),
      });
    },
  });
};
