import { ArrowRight, CalendarDays } from "lucide-react";
import type { Workspace } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  return (
    <button className="w-full text-left" onClick={onClick} type="button">
      <Card className="group h-full border-white/70 bg-white/90 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-panel">
        <CardHeader className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                Workspace
              </p>
              <CardTitle className="break-words text-lg sm:text-xl">
                {workspace.name}
              </CardTitle>
            </div>
            <span className="rounded-full bg-sky-50 p-2 text-sky-600 transition group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex items-start justify-between p-5 pt-0 text-sm text-muted-foreground sm:items-center sm:p-6 sm:pt-0">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Created {new Date(workspace.created_at).toLocaleDateString()}
          </span>
        </CardContent>
      </Card>
    </button>
  );
}
