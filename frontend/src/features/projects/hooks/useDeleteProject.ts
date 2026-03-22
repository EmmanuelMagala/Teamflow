import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { deleteProject } from "../api/projectApi";

interface DeleteProjectPayload {
  id: number;
  workspaceId: number;
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id }: DeleteProjectPayload) => deleteProject(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
      void queryClient.removeQueries({
        queryKey: ["project", variables.id],
      });
      toast({
        variant: "success",
        title: "Project deleted",
        description: "The project was removed from this workspace.",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Project could not be deleted",
        description: getErrorMessage(
          error,
          "The project is still in place because the delete request failed.",
        ),
      });
    },
  });
};
