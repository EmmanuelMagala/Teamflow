import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["CLERK_SECRET_KEY", "CLIENT_URL"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]?.trim()) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const databaseUrl =
  process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "Missing required environment variable: DATABASE_URL or DATABASE_POOLER_URL",
  );
}

const port = Number(process.env.PORT ?? "5000");

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error("NODE_ENV must be one of: development, test, production");
}

export const env = {
  DATABASE_URL: databaseUrl,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY as string,
  CLIENT_URLS: process.env
    .CLIENT_URL!.split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  PORT: port,
  NODE_ENV: nodeEnv as "development" | "test" | "production",
  HOST:
    process.env.HOST?.trim() ||
    (nodeEnv === "production" ? "127.0.0.1" : "0.0.0.0"),
  LOG_LEVEL: process.env.LOG_LEVEL?.trim() || "info",
};

if (env.CLIENT_URLS.length === 0) {
  throw new Error("CLIENT_URL must contain at least one allowed origin");
}
