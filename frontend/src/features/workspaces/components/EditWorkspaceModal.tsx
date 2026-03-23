import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/ui/input";
import { useUpdateWorkspace } from "../hooks/useUpdateWorkspace";
import type { Workspace } from "../types";

const schema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(255),
});

type FormValues = z.infer<typeof schema>;

interface EditWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export function EditWorkspaceModal({
  isOpen,
  onClose,
  workspace,
}: EditWorkspaceModalProps) {
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: workspace.name },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({ name: workspace.name });
  }, [isOpen, reset, workspace.id, workspace.name]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateWorkspace({ id: workspace.id, name: values.name.trim() });
      onClose();
    } catch {
      // Toast feedback is handled in the mutation hook.
    }
  };

  return (
    <Modal
      description="Rename this workspace without leaving the projects view."
      isOpen={isOpen}
      onClose={onClose}
      title="Edit workspace"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="edit-workspace-name"
          >
            Workspace name
          </label>
          <Input id="edit-workspace-name" {...register("name")} />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
