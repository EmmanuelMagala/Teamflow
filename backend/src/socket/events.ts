export const SOCKET_EVENTS = {
  JOIN_PROJECT: "project:join",
  LEAVE_PROJECT: "project:leave",
  JOIN_WORKSPACE: "workspace:join",
  LEAVE_WORKSPACE: "workspace:leave",
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_REORDERED: "task:reordered",
  MEMBER_INVITED: "member:invited",
  MEMBER_REMOVED: "member:removed",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
