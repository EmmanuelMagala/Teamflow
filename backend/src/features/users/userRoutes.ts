import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getCurrentUser, syncUser } from "./userController.js";

const router = Router();

router.post("/sync", requireAuth, syncUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;
