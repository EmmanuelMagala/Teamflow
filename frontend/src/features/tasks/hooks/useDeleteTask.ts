import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { deleteTask } from "../api/taskApi";

export const useDeleteTask = (projectId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast({
        variant: "success",
        title: "Task deleted",
        description: "The task was removed from the board.",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Task could not be deleted",
        description: getErrorMessage(
          error,
          "The task is still in place because the delete request failed.",
        ),
      });
    },
  });
};
