import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useUIStore } from "@/app/store";
import { cn } from "@/shared/lib/utils";
import type { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  activeTaskId: number | null;
  columnId: TaskStatus;
  label: string;
  tasks: Task[];
}

export function KanbanColumn({
  activeTaskId,
  columnId,
  label,
  tasks,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });
  const { openCreateTask } = useUIStore();

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] w-full flex-col rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-4 shadow-panel backdrop-blur transition lg:w-[23rem]",
        isOver &&
          "border-2 border-sky-400 bg-sky-50/95 shadow-[0_24px_70px_-38px_rgba(14,165,233,0.55)] scale-[1.01]",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-muted-foreground">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
          onClick={openCreateTask}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3">
          {tasks.length === 0 ? (
            <div
              className={cn(
                "flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 text-center text-sm text-muted-foreground transition",
                isOver && "border-sky-400 bg-sky-100/80 text-sky-900",
              )}
            >
              {activeTaskId
                ? "Drop the task here to move it into this lane."
                : "Drop a task here or create a new one."}
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </section>
  );
}
