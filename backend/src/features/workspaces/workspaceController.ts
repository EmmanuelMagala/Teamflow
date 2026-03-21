import { NextFunction, Request, Response } from "express";
import { getCurrentAppUser } from "../users/currentUser.js";
import {
  createWorkspace,
  deleteWorkspaceByIdAndOwnerId,
  getWorkspacesByOwnerId,
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

    const workspaces = await getWorkspacesByOwnerId(user.id);

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

    res.status(201).json(workspace);
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
