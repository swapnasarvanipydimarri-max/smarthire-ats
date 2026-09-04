import { Router } from "express";

import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from "../controllers/interviewController";

import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// All interview routes require authentication
router.use(authMiddleware);

// Create interview
router.post("/", createInterview);

// Get all interviews
router.get("/", getInterviews);

// Get single interview
router.get("/:id", getInterviewById);

// Update interview
router.put("/:id", updateInterview);

// Delete interview
router.delete("/:id", deleteInterview);

export default router;