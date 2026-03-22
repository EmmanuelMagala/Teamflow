import {
  DragOverlay,
  DndContext,
  PointerSensor,
  pointerWithin,
  type DragOverEvent,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { useReorderTasks } from "../hooks/useReorderTasks";
import type { Task, TaskIdColumns, TaskStatus } from "../types";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCardPreview } from "./TaskCard";

const COLUMNS: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
];

interface KanbanBoardProps {
  isLoading: boolean;
  projectId: number;
  tasks: Task[];
}

function buildTaskColumns(tasks: Task[]) {
  return {
    todo: tasks
      .filter((task) => task.status === "todo")
      .sort((left, right) => left.sort_order - right.sort_order),
    in_progress: tasks
      .filter((task) => task.status === "in_progress")
      .sort((left, right) => left.sort_order - right.sort_order),
    done: tasks
      .filter((task) => task.status === "done")
      .sort((left, right) => left.sort_order - right.sort_order),
  };
}

function flattenColumns(columns: Record<TaskStatus, Task[]>) {
  return (["todo", "in_progress", "done"] as const).flatMap((status) =>
    columns[status].map((task, index) => ({
      ...task,
      status,
      sort_order: index,
    })),
  );
}

function buildIdColumns(columns: Record<TaskStatus, Task[]>): TaskIdColumns {
  return {
    todo: columns.todo.map((task) => task.id),
    in_progress: columns.in_progress.map((task) => task.id),
    done: columns.done.map((task) => task.id),
  };
}

function getTaskId(value: string | number) {
  return typeof value === "number" ? value : null;
}

function getContainerId(
  value: string | number,
  columns: Record<TaskStatus, Task[]>,
) {
  if (value === "todo" || value === "in_progress" || value === "done") {
    return value;
  }

  const taskId = getTaskId(value);

  if (taskId === null) {
    return null;
  }

  return (
    (Object.keys(columns) as TaskStatus[]).find((status) =>
      columns[status].some((task) => task.id === taskId),
    ) ?? null
  );
}

function moveTaskBetweenColumns(
  columns: Record<TaskStatus, Task[]>,
  activeId: number,
  overId: string | number,
) {
  const sourceColumnId = getContainerId(activeId, columns);
  const targetColumnId = getContainerId(overId, columns);

  if (!sourceColumnId || !targetColumnId) {
    return null;
  }

  const sourceTasks = [...columns[sourceColumnId]];
  const sourceIndex = sourceTasks.findIndex((task) => task.id === activeId);

  if (sourceIndex < 0) {
    return null;
  }

  const nextColumns = {
    todo: [...columns.todo],
    in_progress: [...columns.in_progress],
    done: [...columns.done],
  };

  if (sourceColumnId === targetColumnId) {
    const targetIndex =
      typeof overId === "string"
        ? nextColumns[targetColumnId].length - 1
        : nextColumns[targetColumnId].findIndex((task) => task.id === overId);

    if (targetIndex < 0 || sourceIndex === targetIndex) {
      return null;
    }

    nextColumns[sourceColumnId] = arrayMove(
      sourceTasks,
      sourceIndex,
      targetIndex,
    );
    return nextColumns;
  }

  const [movedTask] = sourceTasks.splice(sourceIndex, 1);
  const targetTasks = [...nextColumns[targetColumnId]];
  const targetIndex =
    typeof overId === "string"
      ? targetTasks.length
      : targetTasks.findIndex((task) => task.id === overId);

  targetTasks.splice(targetIndex < 0 ? targetTasks.length : targetIndex, 0, {
    ...movedTask,
    status: targetColumnId,
  });

  nextColumns[sourceColumnId] = sourceTasks;
  nextColumns[targetColumnId] = targetTasks;

  return nextColumns;
}

export function KanbanBoard({ isLoading, projectId, tasks }: KanbanBoardProps) {
  const { mutate: reorderTasks } = useReorderTasks(projectId);
  const [draftTasks, setDraftTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [isDropPending, setIsDropPending] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const boardTasks =
    activeTaskId !== null || isDropPending ? draftTasks : tasks;
  const taskColumns = useMemo(() => buildTaskColumns(boardTasks), [boardTasks]);

  const groupedTasks = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        tasks: taskColumns[column.id],
      })),
    [taskColumns],
  );

  const activeTask = useMemo(
    () => boardTasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, boardTasks],
  );

  const resetDragState = () => {
    setActiveTaskId(null);
    setIsDropPending(false);
    setDraftTasks(tasks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const nextActiveTaskId = getTaskId(event.active.id);
    setActiveTaskId(nextActiveTaskId);
    setIsDropPending(false);
    setDraftTasks(tasks);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = getTaskId(active.id);

    if (activeId === null) {
      return;
    }

    const nextColumns = moveTaskBetweenColumns(taskColumns, activeId, over.id);

    if (!nextColumns) {
      return;
    }

    setDraftTasks(flattenColumns(nextColumns));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    const currentTaskId = getTaskId(active.id);

    if (currentTaskId === null) {
      resetDragState();
      return;
    }

    const nextColumns = buildTaskColumns(boardTasks);

    const currentColumns = buildTaskColumns(tasks);
    const nextColumnIds = buildIdColumns(nextColumns);
    const currentColumnIds = buildIdColumns(currentColumns);

    if (JSON.stringify(nextColumnIds) === JSON.stringify(currentColumnIds)) {
      resetDragState();
      return;
    }

    const nextTasks = flattenColumns(nextColumns);
    setDraftTasks(nextTasks);
    setActiveTaskId(null);
    setIsDropPending(true);

    reorderTasks(
      {
        nextTasks,
        columns: nextColumnIds,
      },
      {
        onSettled: () => {
          setIsDropPending(false);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
            Delivery board
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Task flow
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Drag tasks between columns to update their status.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              className="min-h-[420px] rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-4 shadow-panel"
            />
          ))}
        </div>
      ) : (
        <DndContext
          collisionDetection={pointerWithin}
          onDragCancel={resetDragState}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {groupedTasks.map((column) => (
              <KanbanColumn
                activeTaskId={activeTaskId}
                columnId={column.id}
                key={column.id}
                label={column.label}
                tasks={column.tasks}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCardPreview task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
