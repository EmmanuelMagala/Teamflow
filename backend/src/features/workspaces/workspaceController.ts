import { NextFunction, Request, Response } from "express";
import { getCurrentAppUser } from "../users/currentUser.js";
import {
  createWorkspace,
  deleteWorkspaceByIdAndOwnerId,
  getWorkspaceByIdAndUserId,
  getWorkspacesByUserId,
  updateWorkspaceByIdAndOwnerId,
} from "./workspaceQueries.js";

export const getWorkspaces = async (
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

    const workspaces = await getWorkspacesByUserId(user.id);

    res.status(200).json(workspaces);
  } catch (err) {
    next(err);
  }
};

export const createWorkspaceHandler = async (
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

    const workspace = await createWorkspace(req.body.name, user.id);

    if (workspace.kind === "duplicate_name") {
      res.status(409).json({
        error: "You already have a workspace with a similar name",
      });
      return;
    }

    res.status(201).json(workspace.workspace);
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceByIdHandler = async (
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

    const workspace = await getWorkspaceByIdAndUserId(
      Number(req.params.id),
      user.id,
    );

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.status(200).json(workspace);
  } catch (err) {
    next(err);
  }
};

export const updateWorkspaceHandler = async (
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

    const workspace = await updateWorkspaceByIdAndOwnerId(
      Number(req.params.id),
      req.body.name,
      user.id,
    );

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (workspace.kind === "duplicate_name") {
      res.status(409).json({
        error: "You already have a workspace with a similar name",
      });
      return;
    }

    res.status(200).json(workspace.workspace);
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspaceHandler = async (
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

    const deleted = await deleteWorkspaceByIdAndOwnerId(
      Number(req.params.id),
      user.id,
    );

    if (!deleted) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
