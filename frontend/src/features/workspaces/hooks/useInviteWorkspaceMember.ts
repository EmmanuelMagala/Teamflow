import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { inviteWorkspaceMember } from "../api/workspaceApi";

interface InviteWorkspaceMemberPayload {
  workspaceId: number;
  email: string;
}

export const useInviteWorkspaceMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ workspaceId, email }: InviteWorkspaceMemberPayload) =>
      inviteWorkspaceMember(workspaceId, email),
    onSuccess: (member) => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace-members", member.workspace_id],
      });
      toast({
        variant: "success",
        title: "Member invited",
        description: `${member.email} now has access to this workspace.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Invite could not be sent",
        description: getErrorMessage(
          error,
          "The workspace member was not added. Try again.",
        ),
      });
    },
  });
};
