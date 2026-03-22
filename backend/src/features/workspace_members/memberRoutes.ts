import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  getWorkspaceMembersHandler,
  inviteWorkspaceMemberHandler,
  removeWorkspaceMemberHandler,
} from "./memberController.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  requireAuth,
  param("workspaceId").isInt({ min: 1 }),
  validate,
  getWorkspaceMembersHandler,
);

router.post(
  "/invite",
  requireAuth,
  param("workspaceId").isInt({ min: 1 }),
  body("email").trim().isEmail(),
  validate,
  inviteWorkspaceMemberHandler,
);

router.delete(
  "/:userId",
  requireAuth,
  param("workspaceId").isInt({ min: 1 }),
  param("userId").isInt({ min: 1 }),
  validate,
  removeWorkspaceMemberHandler,
);

export default router;
