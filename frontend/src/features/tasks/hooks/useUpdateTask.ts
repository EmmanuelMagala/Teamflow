import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/apiError";
import { updateTask } from "../api/taskApi";
import type { Task, TaskStatus } from "../types";

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    if (left.status === right.status) {
      return left.sort_order - right.sort_order;
    }

    const order: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 1,
      done: 2,
    };

    return order[left.status] - order[right.status];
  });
}

function buildOptimisticTask(
  existingTask: Task,
  updates: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    due_date: string | null;
  }>,
  tasks: Task[],
) {
  const nextStatus = updates.status ?? existingTask.status;
  const movedToNewStatus = nextStatus !== existingTask.status;

  const nextSortOrder = movedToNewStatus
    ? tasks
        .filter(
          (task) => task.id !== existingTask.id && task.status === nextStatus,
        )
        .reduce((highest, task) => Math.max(highest, task.sort_order), -1) + 1
    : existingTask.sort_order;

  return {
    ...existingTask,
    ...updates,
    status: nextStatus,
    sort_order: nextSortOrder,
  };
}

export const useUpdateTask = (projectId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<{
        title: string;
        description: string | null;
        status: TaskStatus;
        due_date: string | null;
      }>;
    }) => updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

      const previousTasks =
        queryClient.getQueryData<Task[]>(["tasks", projectId]) ?? [];
      const existingTask = previousTasks.find((task) => task.id === id);

      if (!existingTask) {
        return { previousTasks };
      }

      const optimisticTask = buildOptimisticTask(
        existingTask,
        updates,
        previousTasks,
      );

      queryClient.setQueryData<Task[]>(
        ["tasks", projectId],
        sortTasks(
          previousTasks.map((task) => (task.id === id ? optimisticTask : task)),
        ),
      );

      return { previousTasks };
    },
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(
        ["tasks", projectId],
        (currentTasks = []) => {
          const remainingTasks = currentTasks.filter(
            (currentTask) => currentTask.id !== task.id,
          );

          return sortTasks([...remainingTasks, task]);
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast({
        variant: "success",
        title: "Task updated",
        description: `${task.title} was saved successfully.`,
      });
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", projectId], context.previousTasks);
      }

      toast({
        variant: "error",
        title: "Task could not be updated",
        description: getErrorMessage(
          error,
          "The task changes were not saved. Try again.",
        ),
      });
    },
  });
};
