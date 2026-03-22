import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/app/store";
import { CreateWorkspaceModal } from "@/features/workspaces/components/CreateWorkspaceModal";
import { WorkspaceList } from "@/features/workspaces/components/WorkspaceList";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Navbar } from "@/shared/components/Navbar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import api from "@/shared/lib/axios";

export function DashboardPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { isCreateWorkspaceOpen, openCreateWorkspace } = useUIStore();
  const { data: workspaces = [], isLoading, isError } = useWorkspaces();

  useEffect(() => {
    if (userId) {
      void api.post("/users/sync").catch(() => undefined);
    }
  }, [userId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                Workspace overview
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Organize your team’s work with a clearer starting point.
              </h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Workspaces are the highest-level containers in TeamFlow. Start
                by creating one for a team, client, or operating area.
              </p>
            </div>
            <Button
              className="self-start lg:self-auto"
              onClick={openCreateWorkspace}
              size="lg"
            >
              <Plus className="h-4 w-4" />
              New workspace
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              Failed to load workspaces
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check your backend connection and Clerk configuration, then
              refresh the page.
            </p>
          </div>
        ) : workspaces.length === 0 ? (
          <EmptyState
            title="No workspaces yet"
            description="Create your first workspace to start structuring projects and tasks."
            action={
              <Button onClick={openCreateWorkspace}>
                <Plus className="h-4 w-4" />
                Create first workspace
              </Button>
            }
          />
        ) : (
          <WorkspaceList
            onSelect={(workspaceId) => navigate(`/workspace/${workspaceId}`)}
            workspaces={workspaces}
          />
        )}

        <section className="mt-10 rounded-[1.5rem] border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                What’s next
              </h2>
              <p className="text-sm text-muted-foreground">
                After creating a workspace, you’ll start organizing projects and
                task flow inside it.
              </p>
            </div>
            <span className="hidden items-center gap-2 text-sm font-medium text-sky-700 sm:inline-flex">
              Workspaces lead into projects
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </section>
      </main>

      {isCreateWorkspaceOpen ? <CreateWorkspaceModal /> : null}
    </div>
  );
}
