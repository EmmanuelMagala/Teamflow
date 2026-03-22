import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();

  const getCurrentAppUser = vi.fn();
  const getWorkspacesByUserId = vi.fn();
  const createWorkspace = vi.fn();
  const getWorkspaceByIdAndUserId = vi.fn();
  const updateWorkspaceByIdAndOwnerId = vi.fn();
  const deleteWorkspaceByIdAndOwnerId = vi.fn();

  vi.doMock("../src/features/users/currentUser.js", () => ({
    getCurrentAppUser,
  }));
  vi.doMock("../src/features/workspaces/workspaceQueries.js", () => ({
    getWorkspacesByUserId,
    createWorkspace,
    getWorkspaceByIdAndUserId,
    updateWorkspaceByIdAndOwnerId,
    deleteWorkspaceByIdAndOwnerId,
  }));

  const { default: app } = await import("../src/server.js");

  return {
    app,
    getCurrentAppUser,
    getWorkspacesByUserId,
    createWorkspace,
    getWorkspaceByIdAndUserId,
    updateWorkspaceByIdAndOwnerId,
    deleteWorkspaceByIdAndOwnerId,
  };
};

describe("workspace routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated workspace requests", async () => {
    const { app } = await loadApp();

    const response = await request(app).get("/api/workspaces");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("lists workspaces for the current user", async () => {
    const { app, getCurrentAppUser, getWorkspacesByUserId } = await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    getWorkspacesByUserId.mockResolvedValue([
      { id: 1, name: "Design Ops", owner_id: 17, created_at: new Date() },
    ]);

    const response = await request(app)
      .get("/api/workspaces")
      .set("x-test-user-id", "clerk_17");

    expect(response.status).toBe(200);
    expect(getWorkspacesByUserId).toHaveBeenCalledWith(17);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Design Ops");
  });

  it("returns a duplicate-name error when creating an existing workspace", async () => {
    const { app, getCurrentAppUser, createWorkspace } = await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    createWorkspace.mockResolvedValue({ kind: "duplicate_name" });

    const response = await request(app)
      .post("/api/workspaces")
      .set("x-test-user-id", "clerk_17")
      .send({ name: "Design Ops" });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      "You already have a workspace with a similar name",
    );
  });
});
