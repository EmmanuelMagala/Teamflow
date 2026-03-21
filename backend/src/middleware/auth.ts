import {
  clerkMiddleware,
  getAuth,
  type ExpressRequestWithAuth,
} from "@clerk/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export type AuthenticatedRequest = ExpressRequestWithAuth;

export const attachClerkAuth = clerkMiddleware();

export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

export const getAuthContext = (req: Request) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new Error("Authenticated request is missing a Clerk userId");
  }

  return auth;
};
