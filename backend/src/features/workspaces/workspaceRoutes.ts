import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createWorkspaceHandler,
  deleteWorkspaceHandler,
  getWorkspaces,
} from "./workspaceController.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);
router.post(
  "/",
  requireAuth,
  body("name").trim().isLength({ min: 1, max: 255 }),
  validate,
  createWorkspaceHandler,
);
router.delete(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  validate,
  deleteWorkspaceHandler,
);

export default router;
