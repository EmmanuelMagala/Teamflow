import type { Workspace } from "../types";
import { WorkspaceCard } from "./WorkspaceCard";

interface WorkspaceListProps {
  workspaces: Workspace[];
  onSelect: (workspaceId: number) => void;
}

export function WorkspaceList({ workspaces, onSelect }: WorkspaceListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onClick={() => onSelect(workspace.id)}
        />
      ))}
    </div>
  );
}
