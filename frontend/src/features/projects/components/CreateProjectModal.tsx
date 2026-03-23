import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUIStore } from "@/app/store";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/ui/input";
import { useCreateProject } from "../hooks/useCreateProject";
import { useUpdateProject } from "../hooks/useUpdateProject";
import type { Project } from "../types";

const schema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(255),
});

type FormValues = z.infer<typeof schema>;

interface CreateProjectModalProps {
  workspaceId: number;
  project?: Project | null;
  onCloseEdit?: () => void;
}

export function CreateProjectModal({
  workspaceId,
  project,
  onCloseEdit,
}: CreateProjectModalProps) {
  const { isCreateProjectOpen, closeCreateProject } = useUIStore();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const isEditing = Boolean(project);
  const isOpen = isEditing ? Boolean(project) : isCreateProjectOpen;
  const close = () => {
    if (isEditing && onCloseEdit) {
      onCloseEdit();
      return;
    }

    closeCreateProject();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: project?.name ?? "" },
  });

  useEffect(() => {
    reset({ name: project?.name ?? "" });
  }, [project, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEditing && project) {
      updateProject(
        { id: project.id, name: values.name, workspaceId },
        {
          onSuccess: () => {
            reset({ name: values.name });
            close();
          },
        },
      );
      return;
    }

    createProject(
      { name: values.name, workspaceId },
      {
        onSuccess: () => {
          reset({ name: "" });
          close();
        },
      },
    );
  };

  return (
    <Modal
      description="Projects break a workspace into focused delivery tracks."
      isOpen={isOpen}
      onClose={close}
      title={isEditing ? "Rename project" : "Create a project"}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="project-name"
          >
            Project name
          </label>
          <Input
            id="project-name"
            placeholder="Sprint 1"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={close}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isCreating || isUpdating}
            type="submit"
          >
            {isCreating || isUpdating
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
