import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";

import {
  createApplicantNote,
  getApplicantNotes,
  getApplicantNoteById,
  updateApplicantNote,
  deleteApplicantNote,
} from "../controllers/applicantNoteControllers";

const router = Router();

router.use(authMiddleware);

router.post("/", createApplicantNote);

router.get(
  "/applicant/:applicantId",
  getApplicantNotes
);

router.get("/:id", getApplicantNoteById);

router.put("/:id", updateApplicantNote);

router.delete("/:id", deleteApplicantNote);

export default router;