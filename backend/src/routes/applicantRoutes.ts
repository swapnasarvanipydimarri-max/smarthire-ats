import { Router } from "express";

import {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
} from "../controllers/applicantController";

import authMiddleware from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

// All applicant routes require login
router.use(authMiddleware);

// Create applicant + upload one PDF resume
router.post(
  "/",
  upload.single("resume"),
  createApplicant
);

router.get("/", getApplicants);

router.get("/:id", getApplicantById);

router.put(
  "/:id",
  upload.single("resume"),
  updateApplicant
);

router.delete("/:id", deleteApplicant);

export default router;