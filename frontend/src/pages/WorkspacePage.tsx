import { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUIStore } from "@/app/store";
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { useDeleteProject } from "@/features/projects/hooks/useDeleteProject";
import { useProjects } from "@/features/projects/hooks/useProjects";
import type { Project } from "@/features/projects/types";
import { EditWorkspaceModal } from "@/features/workspaces/components/EditWorkspaceModal";
import { WorkspaceMembersModal } from "@/features/workspaces/components/WorkspaceMembersModal";
import { useDeleteWorkspace } from "@/features/workspaces/hooks/useDeleteWorkspace";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/useWorkspaceMembers";
import { useWorkspace } from "@/features/workspaces/hooks/useWorkspace";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Navbar } from "@/shared/components/Navbar";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const parsedWorkspaceId = Number(workspaceId);
  const { isCreateProjectOpen, openCreateProject } = useUIStore();
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useWorkspace(parsedWorkspaceId);
  const {
    data: projects = [],
    isLoading: areProjectsLoading,
    isError: areProjectsErrored,
  } = useProjects(parsedWorkspaceId);
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const { data: members = [] } = useWorkspaceMembers(parsedWorkspaceId);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const isLoading = isWorkspaceLoading || areProjectsLoading;
  const isError = isWorkspaceError || areProjectsErrored;
  const currentUserEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const isOwner = useMemo(
    () =>
      members.some(
        (member) =>
          member.role === "owner" &&
          member.email.toLowerCase() === currentUserEmail.toLowerCase(),
      ),
    [currentUserEmail, members],
  );

  const subtitle = useMemo(() => {
    if (isLoading) {
      return "Loading projects for this workspace.";
    }

    if (projects.length === 0) {
      return "Start by creating the first project for this workspace.";
    }

    return `${projects.length} active project${projects.length === 1 ? "" : "s"} in this workspace.`;
  }, [isLoading, projects.length]);

  const handleDeleteProject = (project: Project) => {
    deleteProject({ id: project.id, workspaceId: parsedWorkspaceId });
  };

  const handleDeleteWorkspace = () => {
    if (!workspace) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${workspace.name}? This removes the workspace and its projects.`,
    );

    if (!confirmed) {
      return;
    }

    deleteWorkspace(
      { id: workspace.id },
      {
        onSuccess: () => {
          navigate("/");
        },
      },
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Link
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                to="/"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                Workspace
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {isWorkspaceLoading
                  ? "Loading workspace..."
                  : (workspace?.name ?? `Workspace ${workspaceId}`)}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <Button
                onClick={() => setIsMembersModalOpen(true)}
                type="button"
                variant="secondary"
              >
                <Users className="h-4 w-4" />
                {isOwner ? "Manage members" : "View members"}
              </Button>
              {isOwner ? (
                <>
                  <Button
                    onClick={() => setIsEditWorkspaceOpen(true)}
                    type="button"
                    variant="secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit workspace
                  </Button>
                  <Button
                    disabled={!workspace || isDeletingWorkspace}
                    onClick={handleDeleteWorkspace}
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeletingWorkspace ? "Deleting..." : "Delete workspace"}
                  </Button>
                </>
              ) : null}
              <Button
                className="self-start lg:self-auto"
                onClick={openCreateProject}
                size="lg"
              >
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 shadow-sm"
              >
                <Skeleton className="mb-4 h-4 w-24" />
                <Skeleton className="mb-8 h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-[1.5rem] border border-destructive/20 bg-white/90 p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              Failed to load projects
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check the backend and then refresh this workspace page.
            </p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={openCreateProject}>
                <Plus className="h-4 w-4" />
                Create first project
              </Button>
            }
            description="Projects break your workspace into focused initiatives and make task planning manageable."
            title="No projects yet"
          />
        ) : (
          <ProjectList
            onDelete={handleDeleteProject}
            onRename={setEditingProject}
            onSelect={(projectId) =>
              navigate(`/workspace/${workspaceId}/project/${projectId}`)
            }
            projects={projects}
          />
        )}

        <section className="mt-10 rounded-[1.5rem] border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <FolderKanban className="h-4 w-4 text-sky-600" />
            Each project opens into a Kanban board where work moves from
            planning to done.
          </div>
        </section>
      </main>

      {(isCreateProjectOpen || editingProject) &&
      Number.isFinite(parsedWorkspaceId) ? (
        <CreateProjectModal
          onCloseEdit={() => setEditingProject(null)}
          project={editingProject}
          workspaceId={parsedWorkspaceId}
        />
      ) : null}
      {workspace ? (
        <EditWorkspaceModal
          isOpen={isEditWorkspaceOpen}
          onClose={() => setIsEditWorkspaceOpen(false)}
          workspace={workspace}
        />
      ) : null}
      {workspace ? (
        <WorkspaceMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          workspace={workspace}
        />
      ) : null}
    </div>
  );
}
