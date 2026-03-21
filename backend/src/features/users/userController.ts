import { clerkClient } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../middleware/auth.js";
import { getUserByClerkId, upsertUser } from "./userQueries.js";

const resolveUserEmail = async (clerkUserId: string) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  return (
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    null
  );
};

export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuthContext(req);
    const email = await resolveUserEmail(auth.userId);

    if (!email) {
      res
        .status(400)
        .json({ error: "Authenticated user does not have an email address" });
      return;
    }

    const user = await upsertUser(auth.userId, email);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuthContext(req);
    const user = await getUserByClerkId(auth.userId);

    if (!user) {
      res
        .status(404)
        .json({ error: "User not found. Call POST /api/users/sync first." });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
