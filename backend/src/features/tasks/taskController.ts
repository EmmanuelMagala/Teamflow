import { NextFunction, Request, Response } from "express";
import { TaskStatus } from "../../types/index.js";
import { getCurrentAppUser } from "../users/currentUser.js";
import {
  createTaskForOwner,
  deleteTaskByIdAndOwnerId,
  getTasksByProjectIdAndOwnerId,
  reorderTasksForOwner,
  updateTaskByIdAndOwnerId,
} from "./taskQueries.js";

const normalizeNullableString = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  return String(value);
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getCurrentAppUser(req);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    const projectId = Number(req.query.projectId);
    const tasks = await getTasksByProjectIdAndOwnerId(projectId, user.id);

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getCurrentAppUser(req);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    const task = await createTaskForOwner(
      {
        title: req.body.title,
        description: normalizeNullableString(req.body.description),
        projectId: Number(req.body.project_id),
        assignedUserId:
          req.body.assigned_user_id === undefined ||
          req.body.assigned_user_id === null
            ? req.body.assigned_user_id
            : Number(req.body.assigned_user_id),
        dueDate: normalizeNullableString(req.body.due_date),
      },
      user.id,
    );

    if (!task) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getCurrentAppUser(req);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    const updates = {
      title: req.body.title as string | undefined,
      description: normalizeNullableString(req.body.description),
      status: req.body.status as TaskStatus | undefined,
      assignedUserId:
        req.body.assigned_user_id === undefined
          ? undefined
          : req.body.assigned_user_id === null
            ? null
            : Number(req.body.assigned_user_id),
      dueDate: normalizeNullableString(req.body.due_date),
    };

    const task = await updateTaskByIdAndOwnerId(
      Number(req.params.id),
      user.id,
      updates,
    );

    if (!task) {
      res
        .status(404)
        .json({ error: "Task not found or no valid updates provided" });
      return;
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTaskHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getCurrentAppUser(req);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    const deleted = await deleteTaskByIdAndOwnerId(
      Number(req.params.id),
      user.id,
    );

    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const reorderTasksHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getCurrentAppUser(req);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    const result = await reorderTasksForOwner(
      {
        projectId: Number(req.body.project_id),
        columns: {
          todo: req.body.columns.todo,
          in_progress: req.body.columns.in_progress,
          done: req.body.columns.done,
        },
      },
      user.id,
    );

    if (result.kind === "project_not_found") {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (result.kind === "invalid_order") {
      res.status(400).json({ error: "Task order payload is invalid" });
      return;
    }

    res.status(200).json(result.tasks);
  } catch (err) {
    next(err);
  }
};
