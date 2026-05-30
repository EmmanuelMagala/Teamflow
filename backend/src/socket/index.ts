import { Server as HttpServer } from "node:http";
import { verifyToken } from "@clerk/express";
import { Server as SocketIOServer, type Socket } from "socket.io";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import { getUserByClerkId } from "../features/users/userQueries.js";
import { SOCKET_EVENTS } from "./events.js";

type SocketData = {
  clerkUserId: string;
  userId: number;
};

type ClientToServerEvents = {
  [SOCKET_EVENTS.JOIN_PROJECT]: (projectId: number) => void;
  [SOCKET_EVENTS.LEAVE_PROJECT]: (projectId: number) => void;
  [SOCKET_EVENTS.JOIN_WORKSPACE]: (workspaceId: number) => void;
  [SOCKET_EVENTS.LEAVE_WORKSPACE]: (workspaceId: number) => void;
};

type ServerToClientEvents = Record<string, never>;
type InterServerEvents = Record<string, never>;

type TeamFlowSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type TeamFlowSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: TeamFlowSocketServer | null = null;

const getProjectRoom = (projectId: number) => `project:${projectId}`;

const getWorkspaceRoom = (workspaceId: number) => `workspace:${workspaceId}`;

const getPositiveInteger = (value: unknown) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
};

const getAuthToken = (socket: TeamFlowSocket) => {
  const authToken = socket.handshake.auth.token;

  if (typeof authToken === "string" && authToken.trim().length > 0) {
    return authToken.trim();
  }

  const authorization = socket.handshake.headers.authorization;

  if (typeof authorization !== "string") {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
};

const getTestClerkUserId = (socket: TeamFlowSocket) => {
  if (env.NODE_ENV !== "test") {
    return null;
  }

  const testUserId = socket.handshake.headers["x-test-user-id"];

  return typeof testUserId === "string" && testUserId.trim().length > 0
    ? testUserId.trim()
    : null;
};

const getVerificationErrorMessage = (errors: unknown) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Unauthorized";
  }

  const firstError = errors[0];

  if (
    typeof firstError === "object" &&
    firstError !== null &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message;
  }

  return "Unauthorized";
};

const getVerifiedSubject = (payload: unknown) => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "sub" in payload &&
    typeof payload.sub === "string" &&
    payload.sub.trim().length > 0
  ) {
    return payload.sub.trim();
  }

  return null;
};

const resolveSocketUser = async (socket: TeamFlowSocket) => {
  const testClerkUserId = getTestClerkUserId(socket);
  const clerkUserId =
    testClerkUserId ?? (await resolveVerifiedClerkUserId(socket));

  const user = await getUserByClerkId(clerkUserId);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

const resolveVerifiedClerkUserId = async (socket: TeamFlowSocket) => {
  const token = getAuthToken(socket);

  if (!token) {
    throw new Error("Unauthorized");
  }

  const { data, errors } = await verifyToken(token, {
    authorizedParties: env.CLIENT_URLS,
    secretKey: env.CLERK_SECRET_KEY,
  });

  if (errors) {
    throw new Error(getVerificationErrorMessage(errors));
  }

  const clerkUserId = getVerifiedSubject(data);

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  return clerkUserId;
};

const canJoinProjectRoom = async (projectId: number, userId: number) => {
  const result = await pool.query<{ id: number }>(
    `SELECT p.id
     FROM projects p
     JOIN workspaces w ON w.id = p.workspace_id
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE p.id = $1 AND wm.user_id = $2`,
    [projectId, userId],
  );

  return (result.rowCount ?? 0) > 0;
};

const canJoinWorkspaceRoom = async (workspaceId: number, userId: number) => {
  const result = await pool.query<{ workspace_id: number }>(
    `SELECT workspace_id
     FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId],
  );

  return (result.rowCount ?? 0) > 0;
};

const registerRoomHandlers = (socket: TeamFlowSocket) => {
  socket.on(SOCKET_EVENTS.JOIN_PROJECT, async (projectId) => {
    const parsedProjectId = getPositiveInteger(projectId);

    if (!parsedProjectId) {
      return;
    }

    if (!(await canJoinProjectRoom(parsedProjectId, socket.data.userId))) {
      return;
    }

    socket.join(getProjectRoom(parsedProjectId));
  });

  socket.on(SOCKET_EVENTS.LEAVE_PROJECT, (projectId) => {
    const parsedProjectId = getPositiveInteger(projectId);

    if (!parsedProjectId) {
      return;
    }

    socket.leave(getProjectRoom(parsedProjectId));
  });

  socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, async (workspaceId) => {
    const parsedWorkspaceId = getPositiveInteger(workspaceId);

    if (!parsedWorkspaceId) {
      return;
    }

    if (!(await canJoinWorkspaceRoom(parsedWorkspaceId, socket.data.userId))) {
      return;
    }

    socket.join(getWorkspaceRoom(parsedWorkspaceId));
  });

  socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (workspaceId) => {
    const parsedWorkspaceId = getPositiveInteger(workspaceId);

    if (!parsedWorkspaceId) {
      return;
    }

    socket.leave(getWorkspaceRoom(parsedWorkspaceId));
  });
};

export const initSocket = (httpServer: HttpServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      credentials: true,
      methods: ["GET", "POST"],
      origin: env.CLIENT_URLS,
    },
  });

  io.use(async (socket, next) => {
    try {
      const user = await resolveSocketUser(socket);

      socket.data.clerkUserId = user.clerk_id;
      socket.data.userId = user.id;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerRoomHandlers(socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

export { getProjectRoom, getWorkspaceRoom };
