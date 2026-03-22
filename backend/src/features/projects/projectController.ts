import { NextFunction, Request, Response } from "express";
import { getCurrentAppUser } from "../users/currentUser.js";
import {
  createProjectForOwner,
  deleteProjectByIdAndOwnerId,
  getProjectByIdAndOwnerId,
  getProjectsByWorkspaceIdAndOwnerId,
  updateProjectByIdAndOwnerId,
} from "./projectQueries.js";

export const getProjects = async (
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

    const workspaceId = Number(req.query.workspaceId);
    const projects = await getProjectsByWorkspaceIdAndOwnerId(
      workspaceId,
      user.id,
    );

    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectByIdHandler = async (
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

    const project = await getProjectByIdAndOwnerId(
      Number(req.params.id),
      user.id,
    );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

export const createProjectHandler = async (
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

    const project = await createProjectForOwner(
      req.body.name,
      Number(req.body.workspace_id),
      user.id,
    );

    if (project.kind === "workspace_not_found") {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (project.kind === "duplicate_name") {
      res.status(409).json({
        error: "This workspace already has a project with a similar name",
      });
      return;
    }

    res.status(201).json(project.project);
  } catch (err) {
    next(err);
  }
};

export const updateProjectHandler = async (
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

    const project = await updateProjectByIdAndOwnerId(
      Number(req.params.id),
      req.body.name,
      user.id,
    );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (project.kind === "duplicate_name") {
      res.status(409).json({
        error: "This workspace already has a project with a similar name",
      });
      return;
    }

    res.status(200).json(project.project);
  } catch (err) {
    next(err);
  }
};

export const deleteProjectHandler = async (
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

    const deleted = await deleteProjectByIdAndOwnerId(
      Number(req.params.id),
      user.id,
    );

    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
