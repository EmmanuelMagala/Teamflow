import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onSelect: (projectId: number) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectList({
  projects,
  onSelect,
  onRename,
  onDelete,
}: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          onDelete={onDelete}
          onOpen={() => onSelect(project.id)}
          onRename={onRename}
          project={project}
        />
      ))}
    </div>
  );
}
