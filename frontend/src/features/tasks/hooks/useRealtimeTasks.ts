import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/shared/lib/socket";
import { SOCKET_EVENTS } from "@/shared/lib/socketEvents";
import type { Task, TaskStatus } from "../types";

const statusOrder: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
};

const sortTasks = (tasks: Task[]) => {
  return [...tasks].sort((left, right) => {
    if (left.status === right.status) {
      if (left.sort_order === right.sort_order) {
        return left.id - right.id;
      }

      return left.sort_order - right.sort_order;
    }

    return statusOrder[left.status] - statusOrder[right.status];
  });
};

export const useRealtimeTasks = (projectId: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return;
    }

    const joinProjectRoom = () => {
      socket.emit(SOCKET_EVENTS.JOIN_PROJECT, projectId);
    };

    const onTaskCreated = (task: Task) => {
      queryClient.setQueryData<Task[]>(["tasks", projectId], (current = []) => {
        if (current.some((currentTask) => currentTask.id === task.id)) {
          return current;
        }

        return sortTasks([...current, task]);
      });
    };

    const onTaskUpdated = (task: Task) => {
      queryClient.setQueryData<Task[]>(["tasks", projectId], (current = []) => {
        const remainingTasks = current.filter(
          (currentTask) => currentTask.id !== task.id,
        );

        return sortTasks([...remainingTasks, task]);
      });
    };

    const onTaskDeleted = ({ id }: Pick<Task, "id">) => {
      queryClient.setQueryData<Task[]>(["tasks", projectId], (current = []) => {
        return current.filter((task) => task.id !== id);
      });
    };

    const onTasksReordered = (tasks: Task[]) => {
      queryClient.setQueryData(["tasks", projectId], tasks);
    };

    joinProjectRoom();

    socket.on("connect", joinProjectRoom);
    socket.on(SOCKET_EVENTS.TASK_CREATED, onTaskCreated);
    socket.on(SOCKET_EVENTS.TASK_UPDATED, onTaskUpdated);
    socket.on(SOCKET_EVENTS.TASK_DELETED, onTaskDeleted);
    socket.on(SOCKET_EVENTS.TASK_REORDERED, onTasksReordered);

    return () => {
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.LEAVE_PROJECT, projectId);
      }

      socket.off("connect", joinProjectRoom);
      socket.off(SOCKET_EVENTS.TASK_CREATED, onTaskCreated);
      socket.off(SOCKET_EVENTS.TASK_UPDATED, onTaskUpdated);
      socket.off(SOCKET_EVENTS.TASK_DELETED, onTaskDeleted);
      socket.off(SOCKET_EVENTS.TASK_REORDERED, onTasksReordered);
    };
  }, [projectId, queryClient]);
};
