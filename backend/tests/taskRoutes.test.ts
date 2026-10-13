import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();

  const getCurrentAppUser = vi.fn();
  const createTaskForOwner = vi.fn();
  const deleteTaskByIdAndOwnerId = vi.fn();
  const getTasksByProjectIdAndOwnerId = vi.fn();
  const reorderTasksForOwner = vi.fn();
  const updateTaskByIdAndOwnerId = vi.fn();
  const emit = vi.fn();
  const to = vi.fn(() => ({ emit }));
  const getIO = vi.fn(() => ({ to }));

  vi.doMock("../src/features/users/currentUser.js", () => ({
    getCurrentAppUser,
  }));
  vi.doMock("../src/features/tasks/taskQueries.js", () => ({
    createTaskForOwner,
    deleteTaskByIdAndOwnerId,
    getTasksByProjectIdAndOwnerId,
    reorderTasksForOwner,
    updateTaskByIdAndOwnerId,
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
    createTaskForOwner,
    deleteTaskByIdAndOwnerId,
    emit,
    getCurrentAppUser,
    getIO,
    getTasksByProjectIdAndOwnerId,
    reorderTasksForOwner,
    to,
    updateTaskByIdAndOwnerId,
  };
};

describe("task routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits task:created after creating a task", async () => {
    const { app, createTaskForOwner, emit, getCurrentAppUser, to } =
      await loadApp();

    const task = {
      assigned_user_id: null,
      created_at: new Date(),
      description: null,
      due_date: null,
      id: 41,
      project_id: 5,
      sort_order: 0,
      status: "todo",
      title: "Wire sockets",
      updated_at: new Date(),
    };

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    createTaskForOwner.mockResolvedValue(task);

    const response = await request(app)
      .post("/api/tasks")
      .set("x-test-user-id", "clerk_17")
      .send({ project_id: 5, title: "Wire sockets" });

    expect(response.status).toBe(201);
    expect(to).toHaveBeenCalledWith("project:5");
    expect(emit).toHaveBeenCalledWith("task:created", task);
  });

  it("emits task:updated after updating a task", async () => {
    const { app, emit, getCurrentAppUser, to, updateTaskByIdAndOwnerId } =
      await loadApp();

    const task = {
      assigned_user_id: null,
      created_at: new Date(),
      description: null,
      due_date: null,
      id: 41,
      project_id: 5,
      sort_order: 0,
      status: "done",
      title: "Wire sockets",
      updated_at: new Date(),
    };

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    updateTaskByIdAndOwnerId.mockResolvedValue(task);

    const response = await request(app)
      .patch("/api/tasks/41")
      .set("x-test-user-id", "clerk_17")
      .send({ status: "done" });

    expect(response.status).toBe(200);
    expect(to).toHaveBeenCalledWith("project:5");
    expect(emit).toHaveBeenCalledWith("task:updated", task);
  });

  it("emits task:deleted after deleting a task", async () => {
    const { app, deleteTaskByIdAndOwnerId, emit, getCurrentAppUser, to } =
      await loadApp();

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    deleteTaskByIdAndOwnerId.mockResolvedValue({ id: 41, project_id: 5 });

    const response = await request(app)
      .delete("/api/tasks/41")
      .set("x-test-user-id", "clerk_17");

    expect(response.status).toBe(204);
    expect(to).toHaveBeenCalledWith("project:5");
    expect(emit).toHaveBeenCalledWith("task:deleted", {
      id: 41,
      project_id: 5,
    });
  });

  it("emits task:reordered after reordering tasks", async () => {
    const { app, emit, getCurrentAppUser, reorderTasksForOwner, to } =
      await loadApp();

    const reorderedTasks = [
      {
        assigned_user_id: null,
        created_at: new Date(),
        description: null,
        due_date: null,
        id: 41,
        project_id: 5,
        sort_order: 0,
        status: "done",
        title: "Wire sockets",
        updated_at: new Date(),
      },
    ];

    getCurrentAppUser.mockResolvedValue({ id: 17 });
    reorderTasksForOwner.mockResolvedValue({
      kind: "success",
      tasks: reorderedTasks,
    });

    const response = await request(app)
      .put("/api/tasks/reorder")
      .set("x-test-user-id", "clerk_17")
      .send({
        columns: {
          done: [41],
          in_progress: [],
          todo: [],
        },
        project_id: 5,
      });

    expect(response.status).toBe(200);
    expect(to).toHaveBeenCalledWith("project:5");
    expect(emit).toHaveBeenCalledWith("task:reordered", reorderedTasks);
  });
});
