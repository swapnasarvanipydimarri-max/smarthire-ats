import { Request, Response } from "express";
import mongoose from "mongoose";
import ApplicantNote from "../models/ApplicantNote";
import Applicant from "../models/Applicant";
import Job from "../models/Job";

// ==========================================
// CREATE APPLICANT NOTE
// ==========================================

export const createApplicantNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { applicant, note } = req.body;

    // Validate applicant ID
    if (
      !applicant ||
      !mongoose.Types.ObjectId.isValid(
        applicant
      )
    ) {
      res.status(400).json({
        message: "Valid applicant is required",
      });
      return;
    }

    // Validate note
    if (
      !note ||
      typeof note !== "string" ||
      !note.trim()
    ) {
      res.status(400).json({
        message: "Note is required",
      });
      return;
    }

    // Find applicant
    const applicantRecord =
      await Applicant.findById(applicant);

    if (!applicantRecord) {
      res.status(404).json({
        message: "Applicant not found",
      });
      return;
    }

    // Make sure applicant belongs to a job
    const applicantJobId =
      applicantRecord.job;

    if (!applicantJobId) {
      res.status(400).json({
        message:
          "Applicant is not associated with a job",
      });
      return;
    }

    // Make sure the job belongs to the recruiter
    const job = await Job.findOne({
      _id: applicantJobId,
      recruiter: req.userId,
    });

    if (!job) {
      res.status(403).json({
        message:
          "You are not authorized to add notes for this applicant",
      });
      return;
    }

    // Create note
    const applicantNote =
      await ApplicantNote.create({
        applicant: applicantRecord._id,
        recruiter: req.userId,
        note: note.trim(),
      });

    const populatedNote =
      await ApplicantNote.findById(
        applicantNote._id
      ).populate({
        path: "applicant",
        select:
          "name email phone college status",
      });

    res.status(201).json({
      message: "Applicant note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error(
      "CREATE APPLICANT NOTE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating applicant note",
    });
  }
};

// ==========================================
// GET NOTES FOR APPLICANT
// ==========================================

export const getApplicantNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { applicantId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        String(applicantId)
      )
    ) {
      res.status(400).json({
        message: "Invalid applicant ID",
      });
      return;
    }

    const applicant =
      await Applicant.findById(
        String(applicantId)
      );

    if (!applicant) {
      res.status(404).json({
        message: "Applicant not found",
      });
      return;
    }

    // Make sure applicant belongs to recruiter
    const applicantJobId =
      applicant.job;

    if (!applicantJobId) {
      res.status(400).json({
        message:
          "Applicant is not associated with a job",
      });
      return;
    }

    const job = await Job.findOne({
      _id: applicantJobId,
      recruiter: req.userId,
    });

    if (!job) {
      res.status(403).json({
        message:
          "You are not authorized to view notes for this applicant",
      });
      return;
    }

    const notes =
      await ApplicantNote.find({
        applicant: String(applicantId),
        recruiter: req.userId,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      notes,
    });
  } catch (error) {
    console.error(
      "GET APPLICANT NOTES ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading applicant notes",
    });
  }
};

// ==========================================
// GET SINGLE NOTE
// ==========================================

export const getApplicantNoteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        message: "Invalid note ID",
      });
      return;
    }

    const note =
      await ApplicantNote.findOne({
        _id: id,
        recruiter: req.userId,
      }).populate({
        path: "applicant",
        select:
          "name email phone college status",
      });

    if (!note) {
      res.status(404).json({
        message: "Applicant note not found",
      });
      return;
    }

    res.status(200).json({
      note,
    });
  } catch (error) {
    console.error(
      "GET APPLICANT NOTE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading applicant note",
    });
  }
};

// ==========================================
// UPDATE NOTE
// ==========================================

export const updateApplicantNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        message: "Invalid note ID",
      });
      return;
    }

    const { note } = req.body;

    if (
      !note ||
      typeof note !== "string" ||
      !note.trim()
    ) {
      res.status(400).json({
        message: "Note is required",
      });
      return;
    }

    const existingNote =
      await ApplicantNote.findOne({
        _id: id,
        recruiter: req.userId,
      });

    if (!existingNote) {
      res.status(404).json({
        message: "Applicant note not found",
      });
      return;
    }

    existingNote.note = note.trim();

    await existingNote.save();

    const updatedNote =
      await ApplicantNote.findById(
        existingNote._id
      ).populate({
        path: "applicant",
        select:
          "name email phone college status",
      });

    res.status(200).json({
      message:
        "Applicant note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error(
      "UPDATE APPLICANT NOTE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating applicant note",
    });
  }
};

// ==========================================
// DELETE NOTE
// ==========================================

export const deleteApplicantNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        message: "Invalid note ID",
      });
      return;
    }

    const note =
      await ApplicantNote.findOneAndDelete({
        _id: id,
        recruiter: req.userId,
      });

    if (!note) {
      res.status(404).json({
        message: "Applicant note not found",
      });
      return;
    }

    res.status(200).json({
      message:
        "Applicant note deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE APPLICANT NOTE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting applicant note",
    });
  }
};