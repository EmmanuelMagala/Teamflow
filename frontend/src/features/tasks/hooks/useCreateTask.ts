import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { createTask } from "../api/taskApi";

interface CreateTaskPayload {
  title: string;
  description?: string;
  project_id: number;
  due_date?: string;
}

export const useCreateTask = (projectId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast({
        variant: "success",
        title: "Task created",
        description: `${task.title} was added to the board.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Task could not be created",
        description: getErrorMessage(
          error,
          "The task was not saved. Try again.",
        ),
      });
    },
  });
};
