import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUIStore } from "@/app/store";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/ui/input";
import { useCreateWorkspace } from "../hooks/useCreateWorkspace";

const schema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(255),
});

type FormValues = z.infer<typeof schema>;

export function CreateWorkspaceModal() {
  const { isCreateWorkspaceOpen, closeCreateWorkspace } = useUIStore();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: FormValues) => {
    createWorkspace(values.name, {
      onSuccess: () => {
        reset();
        closeCreateWorkspace();
      },
    });
  };

  return (
    <Modal
      isOpen={isCreateWorkspaceOpen}
      onClose={closeCreateWorkspace}
      title="Create a workspace"
      description="Set up a high-level space for your team, projects, and upcoming work."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="workspace-name"
          >
            Workspace name
          </label>
          <Input
            id="workspace-name"
            placeholder="Design Ops"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={closeCreateWorkspace}
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
            {isPending ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
