import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUIStore } from "@/app/store";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import type { Task, TaskStatus } from "../types";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(255),
    description: z.string().max(1000).optional(),
    status: z.enum(["todo", "in_progress", "done"]),
    dueDate: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.dueDate && values.dueDate < getTodayDate()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be in the past",
        path: ["dueDate"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface EditTaskModalProps {
  projectId: number;
  task: Task | null;
}

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function EditTaskModal({ projectId, task }: EditTaskModalProps) {
  const { isEditTaskOpen, closeTaskModals } = useUIStore();
  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTask(projectId);
  const { mutateAsync: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);
  const minDueDate = getTodayDate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      dueDate: task?.due_date?.slice(0, 10) ?? "",
    },
  });

  useEffect(() => {
    if (!isEditTaskOpen) {
      return;
    }

    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      dueDate: task?.due_date?.slice(0, 10) ?? "",
    });
  }, [
    isEditTaskOpen,
    reset,
    task?.description,
    task?.due_date,
    task?.id,
    task?.status,
    task?.title,
  ]);

  const onSubmit = async (values: FormValues) => {
    if (!task) {
      return;
    }

    const normalizedTitle = values.title.trim();
    const normalizedDescription = values.description?.trim() || null;
    const nextStatus =
      values.status !== task.status ? values.status : undefined;
    const currentDueDate = task.due_date?.slice(0, 10) ?? "";
    const nextDueDate = values.dueDate || "";

    try {
      await updateTask({
        id: task.id,
        updates: {
          title: normalizedTitle,
          description: normalizedDescription,
          status: nextStatus,
          due_date:
            nextDueDate !== currentDueDate ? nextDueDate || null : undefined,
        },
      });
      closeTaskModals();
    } catch {
      // Toast feedback is handled in the mutation hook.
    }
  };

  const handleDelete = async () => {
    if (!task) {
      return;
    }

    try {
      await deleteTask(task.id);
      closeTaskModals();
    } catch {
      // Toast feedback is handled in the mutation hook.
    }
  };

  return (
    <Modal
      description="Adjust the task details or move it to a new status."
      isOpen={isEditTaskOpen && Boolean(task)}
      onClose={closeTaskModals}
      title="Edit task"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="edit-task-title"
          >
            Task title
          </label>
          <Input
            id="edit-task-title"
            placeholder="Refine dashboard layout"
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="edit-task-description"
          >
            Description
          </label>
          <Textarea
            id="edit-task-description"
            placeholder="Optional notes"
            {...register("description")}
          />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="edit-task-status"
          >
            Status
          </label>
          <select
            className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="edit-task-status"
            {...register("status")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="edit-task-due-date"
          >
            Due date
          </label>
          <Input
            id="edit-task-due-date"
            min={minDueDate}
            type="date"
            {...register("dueDate")}
          />
          {errors.dueDate ? (
            <p className="text-sm text-destructive">{errors.dueDate.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete task"}
          </Button>
          <div className="flex gap-3">
            <Button onClick={closeTaskModals} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
