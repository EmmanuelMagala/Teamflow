import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUIStore } from "@/app/store";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateTask } from "../hooks/useCreateTask";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(255),
    description: z.string().max(1000).optional(),
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

interface CreateTaskModalProps {
  projectId: number;
}

export function CreateTaskModal({ projectId }: CreateTaskModalProps) {
  const { isCreateTaskOpen, closeTaskModals } = useUIStore();
  const { mutateAsync: createTask, isPending } = useCreateTask(projectId);
  const minDueDate = getTodayDate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createTask({
        title: values.title,
        description: values.description?.trim() || undefined,
        project_id: projectId,
        due_date: values.dueDate || undefined,
      });
      reset();
      closeTaskModals();
    } catch {
      // Toast feedback is handled in the mutation hook.
    }
  };

  return (
    <Modal
      description="Add a new task to this project board."
      isOpen={isCreateTaskOpen}
      onClose={closeTaskModals}
      title="Create task"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="task-title"
          >
            Task title
          </label>
          <Input
            id="task-title"
            placeholder="Build dashboard cards"
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="task-description"
          >
            Description
          </label>
          <Textarea
            id="task-description"
            placeholder="Optional context or acceptance criteria"
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
            htmlFor="task-due-date"
          >
            Due date
          </label>
          <Input
            id="task-due-date"
            min={minDueDate}
            type="date"
            {...register("dueDate")}
          />
          {errors.dueDate ? (
            <p className="text-sm text-destructive">{errors.dueDate.message}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={closeTaskModals} type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? "Creating..." : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
