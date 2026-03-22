import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { removeWorkspaceMember } from "../api/workspaceApi";

interface RemoveWorkspaceMemberPayload {
  workspaceId: number;
  userId: number;
}

export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: RemoveWorkspaceMemberPayload) =>
      removeWorkspaceMember(workspaceId, userId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-members", variables.workspaceId],
      });
      toast({
        variant: "success",
        title: "Member removed",
        description: "That user no longer has access to this workspace.",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Member could not be removed",
        description: getErrorMessage(
          error,
          "The workspace member is still in place because the request failed.",
        ),
      });
    },
  });
};
