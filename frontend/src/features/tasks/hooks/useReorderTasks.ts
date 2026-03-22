import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { reorderTasks } from "../api/taskApi";
import type { Task, TaskIdColumns } from "../types";

interface ReorderTaskPayload {
  nextTasks: Task[];
  columns: TaskIdColumns;
}

export const useReorderTasks = (projectId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ columns }: ReorderTaskPayload) =>
      reorderTasks(projectId, columns),
    onMutate: async ({ nextTasks }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

      const previousTasks =
        queryClient.getQueryData<Task[]>(["tasks", projectId]) ?? [];

      queryClient.setQueryData(["tasks", projectId], nextTasks);

      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", projectId], context.previousTasks);
      }

      toast({
        variant: "error",
        title: "Task order could not be saved",
        description: getErrorMessage(
          error,
          "The board order was reverted because the reorder request failed.",
        ),
      });
    },
    onSuccess: (tasks) => {
      queryClient.setQueryData(["tasks", projectId], tasks);
    },
  });
};
