import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { updateProject } from "../api/projectApi";

interface UpdateProjectPayload {
  id: number;
  name: string;
  workspaceId: number;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, name }: UpdateProjectPayload) => updateProject(id, name),
    onSuccess: (project, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["project", project.id],
      });
      toast({
        variant: "success",
        title: "Project updated",
        description: `${project.name} was renamed successfully.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Project could not be updated",
        description: getErrorMessage(
          error,
          "The project name was not saved. Try again.",
        ),
      });
    },
  });
};
