import { NextFunction, Request, Response } from "express";
import { getCurrentAppUser } from "../users/currentUser.js";
import { getUserByEmail } from "../users/userQueries.js";
import {
  getWorkspaceMembersForUser,
  inviteWorkspaceMember,
  removeWorkspaceMember,
} from "./memberQueries.js";

export const getWorkspaceMembersHandler = async (
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

    const members = await getWorkspaceMembersForUser(
      Number(req.params.workspaceId),
      user.id,
    );

    if (!members) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
};

export const inviteWorkspaceMemberHandler = async (
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

    const invitedUser = await getUserByEmail(req.body.email);

    if (!invitedUser) {
      res.status(404).json({
        error: "No TeamFlow user found for that email",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    const result = await inviteWorkspaceMember(
      Number(req.params.workspaceId),
      user.id,
      invitedUser.id,
    );

    if (result.kind === "workspace_not_found") {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (result.kind === "already_member") {
      res.status(409).json({
        error: "That user is already a member of this workspace",
        code: "ALREADY_MEMBER",
      });
      return;
    }

    res.status(201).json({
      ...result.member,
      email: invitedUser.email,
    });
  } catch (err) {
    next(err);
  }
};

export const removeWorkspaceMemberHandler = async (
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

    const result = await removeWorkspaceMember(
      Number(req.params.workspaceId),
      user.id,
      Number(req.params.userId),
    );

    if (result.kind === "workspace_not_found") {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (result.kind === "member_not_found") {
      res.status(404).json({ error: "Workspace member not found" });
      return;
    }

    if (result.kind === "cannot_remove_owner") {
      res.status(400).json({
        error: "The workspace owner cannot be removed",
        code: "CANNOT_REMOVE_OWNER",
      });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
