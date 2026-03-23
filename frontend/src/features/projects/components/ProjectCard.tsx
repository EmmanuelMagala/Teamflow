import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import type { Project } from "../types";
import { Button } from "@/shared/components/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onRename,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card className="group border-white/70 bg-white/90 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-panel">
      <CardHeader className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              Project
            </p>
            <CardTitle className="break-words text-lg sm:text-xl">
              {project.name}
            </CardTitle>
          </div>
          <Button onClick={onOpen} size="icon" variant="secondary">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3 p-5 pt-0 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pt-0">
        <span className="break-words">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            onClick={() => onRename(project)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(project)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
