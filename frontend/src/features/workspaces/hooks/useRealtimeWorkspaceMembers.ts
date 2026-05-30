import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/shared/lib/socket";
import { SOCKET_EVENTS } from "@/shared/lib/socketEvents";
import type { WorkspaceMember } from "../types";

type RemovedWorkspaceMember = Pick<WorkspaceMember, "user_id" | "workspace_id">;

export const useRealtimeWorkspaceMembers = (
  workspaceId: number,
  enabled: boolean,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !Number.isFinite(workspaceId) || workspaceId <= 0) {
      return;
    }

    const joinWorkspaceRoom = () => {
      socket.emit(SOCKET_EVENTS.JOIN_WORKSPACE, workspaceId);
    };

    const onMemberInvited = (member: WorkspaceMember) => {
      queryClient.setQueryData<WorkspaceMember[]>(
        ["workspace-members", workspaceId],
        (current = []) => {
          if (
            current.some(
              (currentMember) => currentMember.user_id === member.user_id,
            )
          ) {
            return current.map((currentMember) =>
              currentMember.user_id === member.user_id ? member : currentMember,
            );
          }

          return [...current, member];
        },
      );
    };

    const onMemberRemoved = ({ user_id }: RemovedWorkspaceMember) => {
      queryClient.setQueryData<WorkspaceMember[]>(
        ["workspace-members", workspaceId],
        (current = []) => {
          return current.filter((member) => member.user_id !== user_id);
        },
      );
    };

    joinWorkspaceRoom();

    socket.on("connect", joinWorkspaceRoom);
    socket.on(SOCKET_EVENTS.MEMBER_INVITED, onMemberInvited);
    socket.on(SOCKET_EVENTS.MEMBER_REMOVED, onMemberRemoved);

    return () => {
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.LEAVE_WORKSPACE, workspaceId);
      }

      socket.off("connect", joinWorkspaceRoom);
      socket.off(SOCKET_EVENTS.MEMBER_INVITED, onMemberInvited);
      socket.off(SOCKET_EVENTS.MEMBER_REMOVED, onMemberRemoved);
    };
  }, [enabled, queryClient, workspaceId]);
};
