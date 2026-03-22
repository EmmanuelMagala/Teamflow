import { useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Workspace } from "@/features/workspaces/types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { useInviteWorkspaceMember } from "../hooks/useInviteWorkspaceMember";
import { useRemoveWorkspaceMember } from "../hooks/useRemoveWorkspaceMember";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export function WorkspaceMembersModal({
  isOpen,
  onClose,
  workspace,
}: WorkspaceMembersModalProps) {
  const { user } = useUser();
  const { data: members = [], isLoading } = useWorkspaceMembers(
    workspace.id,
    isOpen,
  );
  const { mutate: inviteMember, isPending: isInviting } =
    useInviteWorkspaceMember();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveWorkspaceMember();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const currentUserEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const currentMember = useMemo(
    () =>
      members.find(
        (member) =>
          member.email.toLowerCase() === currentUserEmail.toLowerCase(),
      ) ?? null,
    [currentUserEmail, members],
  );
  const canManageMembers = currentMember?.role === "owner";

  const onSubmit = (values: FormValues) => {
    inviteMember(
      { workspaceId: workspace.id, email: values.email },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  const handleRemoveMember = (userId: number, email: string) => {
    const confirmed = window.confirm(`Remove ${email} from ${workspace.name}?`);

    if (!confirmed) {
      return;
    }

    removeMember({ workspaceId: workspace.id, userId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace members"
      description={
        canManageMembers
          ? "Invite existing TeamFlow users by email and manage current access."
          : "Current members of this workspace. Only the owner can manage access."
      }
    >
      <div className="space-y-6">
        {canManageMembers ? (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="member-email"
              >
                Invite by email
              </label>
              <Input
                id="member-email"
                placeholder="teammate@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Only existing TeamFlow users can be added right now.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={onClose} type="button" variant="ghost">
                Close
              </Button>
              <Button disabled={isInviting} type="submit">
                {isInviting ? "Inviting..." : "Invite member"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-muted-foreground">
            Workspace membership is visible to everyone here, but only the owner
            can invite or remove people.
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current members
            </h3>
            <span className="text-sm text-muted-foreground">
              {members.length} total
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-4"
                >
                  <Skeleton className="mb-3 h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-sm text-muted-foreground">
              No members found for this workspace.
            </div>
          ) : (
            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {members.map((member) => {
                const isCurrentUser =
                  member.email.toLowerCase() === currentUserEmail.toLowerCase();

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em]",
                            member.role === "owner"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {member.role}
                        </span>
                        {isCurrentUser ? <span>You</span> : null}
                      </div>
                    </div>

                    {canManageMembers && member.role !== "owner" ? (
                      <Button
                        disabled={isRemoving}
                        onClick={() =>
                          handleRemoveMember(member.user_id, member.email)
                        }
                        type="button"
                        variant="outline"
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
