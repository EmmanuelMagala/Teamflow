import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, SquarePen } from "lucide-react";
import { useUIStore } from "@/app/store";
import { cn } from "@/shared/lib/utils";
import type { Task } from "../types";

interface TaskCardLayoutProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  dragCardProps?: React.HTMLAttributes<HTMLDivElement>;
  onEdit?: () => void;
}

function TaskCardLayout({
  task,
  isDragging = false,
  isOverlay = false,
  dragCardProps,
  onEdit,
}: TaskCardLayoutProps) {
  const canEdit = Boolean(onEdit);

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit?.();
  };

  const handleEditPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <div
      {...dragCardProps}
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white px-4 py-4 text-left transition will-change-transform",
        isOverlay
          ? "scale-[1.02] cursor-grabbing shadow-[0_32px_90px_-30px_rgba(15,23,42,0.5)] ring-1 ring-sky-200"
          : "cursor-grab shadow-[0_16px_45px_-28px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_24px_60px_-28px_rgba(14,165,233,0.3)] active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-0 shadow-none",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          className="flex-1 text-left"
          disabled={!canEdit}
          onClick={handleEditClick}
          onPointerDown={handleEditPointerDown}
          type="button"
        >
          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </button>
        {canEdit ? (
          <button
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={handleEditClick}
            onPointerDown={handleEditPointerDown}
            type="button"
          >
            <SquarePen className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString()
            : "No due date"}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-right">
          Drag card
        </span>
      </div>
    </div>
  );
}

export function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });
  const { openEditTask } = useUIStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCardLayout
        dragCardProps={{ ...listeners, ...attributes }}
        isDragging={isDragging}
        onEdit={() => openEditTask(task.id)}
        task={task}
      />
    </div>
  );
}

export function TaskCardPreview({ task }: { task: Task }) {
  return <TaskCardLayout isOverlay task={task} />;
}
