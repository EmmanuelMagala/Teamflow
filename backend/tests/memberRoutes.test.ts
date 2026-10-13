import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();

  const getCurrentAppUser = vi.fn();
  const getUserByEmail = vi.fn();
  const getWorkspaceMembersForUser = vi.fn();
  const inviteWorkspaceMember = vi.fn();
  const removeWorkspaceMember = vi.fn();
  const emit = vi.fn();
  const to = vi.fn(() => ({ emit }));
  const getIO = vi.fn(() => ({ to }));

  vi.doMock("../src/features/users/currentUser.js", () => ({
    getCurrentAppUser,
  }));
  vi.doMock("../src/features/users/userQueries.js", () => ({
    getUserByEmail,
  }));
  vi.doMock("../src/features/workspace_members/memberQueries.js", () => ({
    getWorkspaceMembersForUser,
    inviteWorkspaceMember,
    removeWorkspaceMember,
  }));
  vi.doMock("../src/socket/index.js", () => ({
    getIO,
    getProjectRoom: (projectId: number) => `project:${projectId}`,
    getWorkspaceRoom: (workspaceId: number) => `workspace:${workspaceId}`,
    initSocket: vi.fn(),
  }));

  const { default: app } = await import("../src/server.js");

  return {
    app,
    emit,
    getCurrentAppUser,
    getIO,
    getUserByEmail,
    getWorkspaceMembersForUser,
    inviteWorkspaceMember,
    removeWorkspaceMember,
    to,
  };
};

describe("workspace member routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists members for an authenticated workspace member", async () => {
    const { app, getCurrentAppUser, getWorkspaceMembersForUser } =
      await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    getWorkspaceMembersForUser.mockResolvedValue([
      {
        workspace_id: 5,
        user_id: 17,
        role: "owner",
        created_at: new Date(),
        email: "owner@example.com",
      },
    ]);

    const response = await request(app)
      .get("/api/workspaces/5/members")
      .set("x-test-user-id", "clerk_17");

    expect(response.status).toBe(200);
    expect(getWorkspaceMembersForUser).toHaveBeenCalledWith(5, 17);
    expect(response.body[0].role).toBe("owner");
  });

  it("returns USER_NOT_FOUND when inviting an unknown email", async () => {
    const { app, getCurrentAppUser, getUserByEmail } = await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    getUserByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/workspaces/5/members/invite")
      .set("x-test-user-id", "clerk_17")
      .send({ email: "missing@example.com" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("USER_NOT_FOUND");
  });

  it("returns ALREADY_MEMBER when inviting an existing member", async () => {
    const { app, getCurrentAppUser, getUserByEmail, inviteWorkspaceMember } =
      await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    getUserByEmail.mockResolvedValue({ id: 23, email: "member@example.com" });
    inviteWorkspaceMember.mockResolvedValue({ kind: "already_member" });

    const response = await request(app)
      .post("/api/workspaces/5/members/invite")
      .set("x-test-user-id", "clerk_17")
      .send({ email: "member@example.com" });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("ALREADY_MEMBER");
  });

  it("emits member:invited after a successful invite", async () => {
    const {
      app,
      emit,
      getCurrentAppUser,
      getUserByEmail,
      inviteWorkspaceMember,
      to,
    } = await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    getUserByEmail.mockResolvedValue({ id: 23, email: "member@example.com" });
    inviteWorkspaceMember.mockResolvedValue({
      kind: "success",
      member: {
        created_at: new Date(),
        email: "",
        role: "member",
        user_id: 23,
        workspace_id: 5,
      },
    });

    const response = await request(app)
      .post("/api/workspaces/5/members/invite")
      .set("x-test-user-id", "clerk_17")
      .send({ email: "member@example.com" });

    expect(response.status).toBe(201);
    expect(to).toHaveBeenCalledWith("workspace:5");
    expect(emit).toHaveBeenCalledWith("member:invited", {
      created_at: expect.any(Date),
      email: "member@example.com",
      role: "member",
      user_id: 23,
      workspace_id: 5,
    });
  });

  it("emits member:removed after a successful removal", async () => {
    const { app, emit, getCurrentAppUser, removeWorkspaceMember, to } =
      await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    removeWorkspaceMember.mockResolvedValue({ kind: "success" });

    const response = await request(app)
      .delete("/api/workspaces/5/members/23")
      .set("x-test-user-id", "clerk_17");

    expect(response.status).toBe(204);
    expect(to).toHaveBeenCalledWith("workspace:5");
    expect(emit).toHaveBeenCalledWith("member:removed", {
      user_id: 23,
      workspace_id: 5,
    });
  });
});
