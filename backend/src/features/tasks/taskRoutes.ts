import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createTaskHandler,
  deleteTaskHandler,
  getTasks,
  updateTaskHandler,
} from "./taskController.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  query("projectId").isInt({ min: 1 }),
  validate,
  getTasks,
);

router.post(
  "/",
  requireAuth,
  body("title").trim().isLength({ min: 1, max: 255 }),
  body("project_id").isInt({ min: 1 }),
  body("description").optional({ values: "null" }).isString(),
  body("assigned_user_id").optional({ values: "null" }).isInt({ min: 1 }),
  body("due_date").optional({ values: "null" }).isISO8601(),
  validate,
  createTaskHandler,
);

router.patch(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  body("title").optional().trim().isLength({ min: 1, max: 255 }),
  body("description").optional({ values: "null" }).isString(),
  body("status").optional().isIn(["todo", "in_progress", "done"]),
  body("assigned_user_id").optional({ values: "null" }).isInt({ min: 1 }),
  body("due_date").optional({ values: "null" }).isISO8601(),
  validate,
  updateTaskHandler,
);

router.delete(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  validate,
  deleteTaskHandler,
);

export default router;
