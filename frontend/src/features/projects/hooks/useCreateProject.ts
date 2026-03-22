import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { createProject } from "../api/projectApi";

interface CreateProjectPayload {
  name: string;
  workspaceId: number;
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ name, workspaceId }: CreateProjectPayload) =>
      createProject(name, workspaceId),
    onSuccess: (project, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
      toast({
        variant: "success",
        title: "Project created",
        description: `${project.name} is ready for task planning.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Project could not be created",
        description: getErrorMessage(
          error,
          "Check the project name and workspace access, then try again.",
        ),
      });
    },
  });
};
