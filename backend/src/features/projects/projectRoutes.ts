import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjects,
  updateProjectHandler,
} from "./projectController.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  query("workspaceId").isInt({ min: 1 }),
  validate,
  getProjects,
);
router.post(
  "/",
  requireAuth,
  body("name").trim().isLength({ min: 1, max: 255 }),
  body("workspace_id").isInt({ min: 1 }),
  validate,
  createProjectHandler,
);
router.patch(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  body("name").trim().isLength({ min: 1, max: 255 }),
  validate,
  updateProjectHandler,
);
router.delete(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  validate,
  deleteProjectHandler,
);

export default router;
