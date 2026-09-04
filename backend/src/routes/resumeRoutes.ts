import { Router } from "express";
import { generateResume } from "../controllers/resumeController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/generate",
  authMiddleware,
  generateResume
);

export default router;