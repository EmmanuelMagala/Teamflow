import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createTaskHandler,
  deleteTaskHandler,
  getTasks,
  reorderTasksHandler,
  updateTaskHandler,
} from "./taskController.js";

const router = Router();

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const validateDueDateNotPast = (value: unknown) => {
  if (typeof value !== "string") {
    return true;
  }

  if (value.slice(0, 10) < getTodayDate()) {
    throw new Error("Due date cannot be in the past");
  }

  return true;
};

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
  body("due_date")
    .optional({ values: "null" })
    .isISO8601()
    .bail()
    .custom(validateDueDateNotPast),
  validate,
  createTaskHandler,
);

router.put(
  "/reorder",
  requireAuth,
  body("project_id").isInt({ min: 1 }),
  body("columns").custom((value) => {
    const statuses = ["todo", "in_progress", "done"];

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("columns must be an object keyed by task status");
    }

    for (const status of statuses) {
      const entry = value[status];

      if (!Array.isArray(entry)) {
        throw new Error(`columns.${status} must be an array`);
      }

      if (
        entry.some((taskId) => !Number.isInteger(taskId) || Number(taskId) < 1)
      ) {
        throw new Error(`columns.${status} must only include task ids`);
      }
    }

    return true;
  }),
  validate,
  reorderTasksHandler,
);

router.patch(
  "/:id",
  requireAuth,
  param("id").isInt({ min: 1 }),
  body("title").optional().trim().isLength({ min: 1, max: 255 }),
  body("description").optional({ values: "null" }).isString(),
  body("status").optional().isIn(["todo", "in_progress", "done"]),
  body("assigned_user_id").optional({ values: "null" }).isInt({ min: 1 }),
  body("due_date")
    .optional({ values: "null" })
    .isISO8601()
    .bail()
    .custom(validateDueDateNotPast),
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
