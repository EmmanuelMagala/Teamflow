import { useMemo } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useUIStore } from "@/app/store";
import { useProject } from "@/features/projects/hooks/useProject";
import { CreateTaskModal } from "@/features/tasks/components/CreateTaskModal";
import { EditTaskModal } from "@/features/tasks/components/EditTaskModal";
import { KanbanBoard } from "@/features/tasks/components/KanbanBoard";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { Button } from "@/shared/components/Button";
import { Navbar } from "@/shared/components/Navbar";

export function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const parsedProjectId = Number(projectId);
  const { data: project, isLoading: isProjectLoading } =
    useProject(parsedProjectId);
  const { data: tasks = [], isLoading: isTasksLoading } =
    useTasks(parsedProjectId);
  const { isCreateTaskOpen, isEditTaskOpen, openCreateTask, selectedTaskId } =
    useUIStore();

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-panel backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Link
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                to={`/workspace/${workspaceId}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to workspace
              </Link>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                Project board
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {isProjectLoading
                  ? "Loading project..."
                  : (project?.name ?? `Project ${projectId}`)}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {project
                  ? `${project.name} is tracked on a persisted Kanban board. Click a card to edit it, or drag it to a new position to save order and status.`
                  : "Move tasks through the board as work progresses. Click a card to edit, or drag it to a new column to update status."}
              </p>
            </div>
            <Button
              className="self-start lg:self-auto"
              onClick={openCreateTask}
              size="lg"
            >
              <Plus className="h-4 w-4" />
              New task
            </Button>
          </div>
        </section>

        <KanbanBoard
          isLoading={isTasksLoading}
          projectId={parsedProjectId}
          tasks={tasks}
        />
      </main>

      {isCreateTaskOpen && Number.isFinite(parsedProjectId) ? (
        <CreateTaskModal projectId={parsedProjectId} />
      ) : null}
      {isEditTaskOpen && Number.isFinite(parsedProjectId) ? (
        <EditTaskModal projectId={parsedProjectId} task={selectedTask} />
      ) : null}
    </div>
  );
}
