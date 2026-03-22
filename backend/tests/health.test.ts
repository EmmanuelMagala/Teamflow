import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async (databaseHealthy = true) => {
  vi.resetModules();

  const checkDatabaseHealth = databaseHealthy
    ? vi.fn().mockResolvedValue(undefined)
    : vi.fn().mockRejectedValue(new Error("Database offline"));

  vi.doMock("../src/config/db.js", () => ({
    checkDatabaseHealth,
    closeDatabasePool: vi.fn().mockResolvedValue(undefined),
    default: {},
  }));

  const { default: app } = await import("../src/server.js");

  return { app, checkDatabaseHealth };
};

describe("health endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns alive for the liveness check", async () => {
    const { app } = await loadApp();

    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "alive" });
  });

  it("returns ready when database health succeeds", async () => {
    const { app, checkDatabaseHealth } = await loadApp(true);

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
    expect(checkDatabaseHealth).toHaveBeenCalledTimes(1);
  });

  it("returns 503 when database health fails", async () => {
    const { app } = await loadApp(false);

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("not-ready");
    expect(response.body.error).toBe("Database offline");
  });
});
