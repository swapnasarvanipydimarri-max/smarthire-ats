import { Request, Response } from "express";
import mongoose from "mongoose";
import Interview from "../models/Interview";
import Applicant from "../models/Applicant";
import Job from "../models/Job";

// ==========================================
// CREATE INTERVIEW
// ==========================================

export const createInterview = async (
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

    const {
      applicant,
      scheduledAt,
      interviewType,
      interviewer,
      status,
      feedback,
      notes,
    } = req.body;

    // Validate applicant ID
    if (
      !applicant ||
      !mongoose.Types.ObjectId.isValid(applicant)
    ) {
      res.status(400).json({
        message: "Valid applicant is required",
      });
      return;
    }

    // Validate date
    if (!scheduledAt) {
      res.status(400).json({
        message: "Interview date and time are required",
      });
      return;
    }

    // Validate interview type
    if (
      !["Video", "Phone", "In-Person"].includes(
        interviewType
      )
    ) {
      res.status(400).json({
        message: "Invalid interview type",
      });
      return;
    }

    // Find applicant
    const applicantRecord =
      await Applicant.findById(applicant).populate(
        "job"
      );

    if (!applicantRecord) {
      res.status(404).json({
        message: "Applicant not found",
      });
      return;
    }

    // Get applicant job
    const applicantJob =
      applicantRecord.job;

    if (!applicantJob) {
      res.status(400).json({
        message:
          "Applicant is not associated with a job",
      });
      return;
    }

    // Make sure the job belongs to logged-in recruiter
    const job = await Job.findOne({
      _id: applicantJob,
      recruiter: req.userId,
    });

    if (!job) {
      res.status(403).json({
        message:
          "You are not authorized to schedule an interview for this applicant",
      });
      return;
    }

    // Create interview
    const interview = await Interview.create({
      applicant: applicantRecord._id,
      job: job._id,
      recruiter: req.userId,
      scheduledAt: new Date(scheduledAt),
      interviewType,
      interviewer:
        interviewer?.trim() || "",
      status:
        status || "Scheduled",
      feedback:
        feedback?.trim() || "",
      notes:
        notes?.trim() || "",
    });

    // Automatically move applicant to Interview
    // when an interview is scheduled
    if (
      interview.status === "Scheduled" ||
      interview.status === "Rescheduled"
    ) {
      applicantRecord.status = "Interview";
      await applicantRecord.save();
    }

    const populatedInterview =
      await Interview.findById(
        interview._id
      )
        .populate({
          path: "applicant",
          select:
            "name email phone college status",
        })
        .populate({
          path: "job",
          select:
            "title location employmentType",
        });

    res.status(201).json({
      message: "Interview created successfully",
      interview: populatedInterview,
    });
  } catch (error) {
    console.error(
      "CREATE INTERVIEW ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating interview",
    });
  }
};

// ==========================================
// GET ALL INTERVIEWS
// ==========================================

export const getInterviews = async (
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

    const interviews = await Interview.find({
      recruiter: req.userId,
    })
      .populate({
        path: "applicant",
        select:
          "name email phone college status",
      })
      .populate({
        path: "job",
        select:
          "title location employmentType",
      })
      .sort({
        scheduledAt: 1,
      });

    res.status(200).json({
      interviews,
    });
  } catch (error) {
    console.error(
      "GET INTERVIEWS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading interviews",
    });
  }
};

// ==========================================
// GET SINGLE INTERVIEW
// ==========================================

export const getInterviewById = async (
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid interview ID",
      });
      return;
    }

    const interview =
      await Interview.findOne({
        _id: id,
        recruiter: req.userId,
      })
        .populate({
          path: "applicant",
          select:
            "name email phone college status",
        })
        .populate({
          path: "job",
          select:
            "title location employmentType",
        });

    if (!interview) {
      res.status(404).json({
        message: "Interview not found",
      });
      return;
    }

    res.status(200).json({
      interview,
    });
  } catch (error) {
    console.error(
      "GET INTERVIEW ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading interview",
    });
  }
};

// ==========================================
// UPDATE INTERVIEW
// ==========================================

export const updateInterview = async (
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid interview ID",
      });
      return;
    }

    const interview =
      await Interview.findOne({
        _id: id,
        recruiter: req.userId,
      });

    if (!interview) {
      res.status(404).json({
        message: "Interview not found",
      });
      return;
    }

    const {
      scheduledAt,
      interviewType,
      interviewer,
      status,
      feedback,
      notes,
    } = req.body;

    // Update scheduled date
    if (scheduledAt) {
      interview.scheduledAt =
        new Date(scheduledAt);
    }

    // Update interview type
    if (interviewType) {
      if (
        ![
          "Video",
          "Phone",
          "In-Person",
        ].includes(interviewType)
      ) {
        res.status(400).json({
          message:
            "Invalid interview type",
        });
        return;
      }

      interview.interviewType =
        interviewType;
    }

    // Update interviewer
    if (interviewer !== undefined) {
      interview.interviewer =
        interviewer.trim();
    }

    // Update status
    if (status) {
      if (
        ![
          "Scheduled",
          "Completed",
          "Cancelled",
          "Rescheduled",
        ].includes(status)
      ) {
        res.status(400).json({
          message:
            "Invalid interview status",
        });
        return;
      }

      interview.status = status;
    }

    // Update feedback
    if (feedback !== undefined) {
      interview.feedback =
        feedback.trim();
    }

    // Update notes
    if (notes !== undefined) {
      interview.notes =
        notes.trim();
    }

    await interview.save();

    // Update applicant status based on interview status
    const applicant =
      await Applicant.findById(
        interview.applicant
      );

    if (applicant) {
      if (
        interview.status === "Scheduled" ||
        interview.status === "Rescheduled"
      ) {
        applicant.status = "Interview";
      }

      if (
        interview.status === "Completed"
      ) {
        applicant.status = "Interview";
      }

      await applicant.save();
    }

    const updatedInterview =
      await Interview.findById(
        interview._id
      )
        .populate({
          path: "applicant",
          select:
            "name email phone college status",
        })
        .populate({
          path: "job",
          select:
            "title location employmentType",
        });

    res.status(200).json({
      message:
        "Interview updated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error(
      "UPDATE INTERVIEW ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating interview",
    });
  }
};

// ==========================================
// DELETE INTERVIEW
// ==========================================

export const deleteInterview = async (
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid interview ID",
      });
      return;
    }

    const interview =
      await Interview.findOneAndDelete({
        _id: id,
        recruiter: req.userId,
      });

    if (!interview) {
      res.status(404).json({
        message: "Interview not found",
      });
      return;
    }

    res.status(200).json({
      message:
        "Interview deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INTERVIEW ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting interview",
    });
  }
};