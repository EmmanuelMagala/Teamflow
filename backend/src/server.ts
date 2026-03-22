// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { errorHandler } from "./middleware/errorHandler.js";
import { checkDatabaseHealth, closeDatabasePool } from "./config/db.js";
import { env } from "./config/env.js";
import { attachClerkAuth } from "./middleware/auth.js";
import userRoutes from "./features/users/userRoutes.js";
import workspaceMemberRoutes from "./features/workspace_members/memberRoutes.js";
import workspaceRoutes from "./features/workspaces/workspaceRoutes.js";
import projectRoutes from "./features/projects/projectRoutes.js";
import taskRoutes from "./features/tasks/taskRoutes.js";

const PORT = env.PORT;
const HOST = env.HOST;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.NODE_ENV === "production" ? 1 : 0);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use((req, res, next) => {
    const requestId = req.header("x-request-id") || randomUUID();

    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    next();
  });
  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      console.log(
        JSON.stringify({
          level: env.LOG_LEVEL,
          requestId: res.locals.requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    });

    next();
  });
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.CLIENT_URLS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(attachClerkAuth);
  app.use("/api", apiLimiter);

  app.get("/", (_req, res) => {
    res.json({ message: "Welcome to the TeamFlow API" });
  });

  app.get("/health/live", (_req, res) => {
    res.json({ status: "alive" });
  });

  app.get("/health/ready", async (_req, res, next) => {
    try {
      await checkDatabaseHealth();
      res.json({ status: "ready" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Database is not ready";

      res.status(503).json({
        status: "not-ready",
        error:
          env.NODE_ENV === "production" ? "Database is unavailable" : message,
        requestId: res.locals.requestId,
      });
    }
  });

  app.use("/api/users", userRoutes);
  app.use("/api/workspaces/:workspaceId/members", workspaceMemberRoutes);
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);

  app.use(errorHandler);

  return app;
};

const app = createApp();

let server: ReturnType<typeof app.listen> | null = null;

const startServer = async () => {
  try {
    server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start TeamFlow API", error);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (!server) {
    try {
      await closeDatabasePool();
      process.exit(0);
    } catch (dbError) {
      console.error("Failed to close PostgreSQL pool cleanly", dbError);
      process.exit(1);
    }

    return;
  }

  server.close(async (error) => {
    if (error) {
      console.error("Failed to close HTTP server cleanly", error);
      process.exit(1);
    }

    try {
      await closeDatabasePool();
      process.exit(0);
    } catch (dbError) {
      console.error("Failed to close PostgreSQL pool cleanly", dbError);
      process.exit(1);
    }
  });
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  void startServer();
}

export default app;
