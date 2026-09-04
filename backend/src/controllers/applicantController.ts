import { Request, Response } from "express";
import mongoose from "mongoose";

import Applicant from "../models/Applicant";
import Job from "../models/Job";

// ==========================================
// MATCH SCORE HELPER
// ==========================================

const calculateMatchScore = (
  applicantSkills: string[] = [],
  jobSkills: string[] = []
) => {
  const normalizedApplicantSkills =
    applicantSkills
      .map((skill) =>
        skill.toLowerCase().trim()
      )
      .filter(Boolean);

  const normalizedJobSkills =
    jobSkills
      .map((skill) =>
        skill.toLowerCase().trim()
      )
      .filter(Boolean);

  const matchingSkills =
    normalizedJobSkills.filter(
      (skill) =>
        normalizedApplicantSkills.includes(
          skill
        )
    );

  const missingSkills =
    normalizedJobSkills.filter(
      (skill) =>
        !normalizedApplicantSkills.includes(
          skill
        )
    );

  const matchScore =
    normalizedJobSkills.length === 0
      ? 0
      : Math.round(
          (matchingSkills.length /
            normalizedJobSkills.length) *
            100
        );

  return {
    matchScore,
    matchingSkills,
    missingSkills,
  };
};

// ==========================================
// CREATE APPLICANT
// ==========================================

export const createApplicant = async (
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
      name,
      email,
      phone,
      college,
      state,
      graduationYear,
      jobExpectation,
      skills,
      job,
      status,
    } = req.body;

    if (!name || !email || !job) {
      res.status(400).json({
        message:
          "Name, email and job are required",
      });
      return;
    }

    if (
      typeof job !== "string" ||
      !mongoose.Types.ObjectId.isValid(job)
    ) {
      res.status(400).json({
        message: "Invalid job ID",
      });
      return;
    }

    const existingJob = await Job.findOne({
      _id: job,
      recruiter: req.userId,
    });

    if (!existingJob) {
      res.status(404).json({
        message: "Job not found",
      });
      return;
    }

    // Parse skills sent from FormData
    let parsedSkills: string[] = [];

    if (
      skills !== undefined &&
      skills !== ""
    ) {
      try {
        const parsed = JSON.parse(skills);

        if (!Array.isArray(parsed)) {
          res.status(400).json({
            message: "Invalid skills format",
          });
          return;
        }

        parsedSkills = parsed
          .filter(
            (
              skill: unknown
            ): skill is string =>
              typeof skill === "string"
          )
          .map((skill: string) =>
            skill.trim()
          )
          .filter(Boolean);
      } catch {
        res.status(400).json({
          message: "Invalid skills format",
        });
        return;
      }
    }

    // Resume uploaded by Multer
    const resumePath = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : "";

    const applicant =
      await Applicant.create({
        name: name.trim(),
        email: email
          .trim()
          .toLowerCase(),
        phone:
          phone?.trim() || "",
        college:
          college?.trim() || "",
        state:
          state?.trim() || "",
        graduationYear:
          graduationYear !==
            undefined &&
          graduationYear !== ""
            ? Number(
                graduationYear
              )
            : undefined,
        jobExpectation:
          jobExpectation?.trim() ||
          "",
        skills: parsedSkills,
        resume: resumePath,
        job,
        status:
          status || "Applied",
      });

    res.status(201).json({
      message:
        "Applicant created successfully",
      applicant,
    });
  } catch (error) {
    console.error(
      "CREATE APPLICANT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating applicant",
    });
  }
};

// ==========================================
// GET ALL APPLICANTS
// ==========================================

export const getApplicants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message:
          "Authentication required",
      });
      return;
    }

    const recruiterJobs =
      await Job.find({
        recruiter: req.userId,
      }).select("_id");

    const jobIds =
      recruiterJobs.map(
        (job) => job._id
      );

    const applicants =
      await Applicant.find({
        job: {
          $in: jobIds,
        },
      })
        .populate({
          path: "job",
          select:
            "title location employmentType skills",
        })
        .sort({
          appliedAt: -1,
        });

    // Add match score to every applicant
    const applicantsWithMatchScore =
      applicants.map(
        (applicant) => {
          const job =
            applicant.job as unknown as {
              _id: mongoose.Types.ObjectId;
              title: string;
              location: string;
              employmentType: string;
              skills?: string[];
            } | null;

          const result =
            calculateMatchScore(
              applicant.skills || [],
              job?.skills || []
            );

          return {
            ...applicant.toObject(),
            matchScore:
              result.matchScore,
            matchingSkills:
              result.matchingSkills,
            missingSkills:
              result.missingSkills,
          };
        }
      );

    res.status(200).json({
      applicants:
        applicantsWithMatchScore,
    });
  } catch (error) {
    console.error(
      "GET APPLICANTS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching applicants",
    });
  }
};

// ==========================================
// GET SINGLE APPLICANT
// ==========================================

export const getApplicantById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message:
          "Authentication required",
      });
      return;
    }

    const applicantId =
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    if (
      !applicantId ||
      !mongoose.Types.ObjectId.isValid(
        applicantId
      )
    ) {
      res.status(400).json({
        message:
          "Invalid applicant ID",
      });
      return;
    }

    const applicant =
      await Applicant.findById(
        applicantId
      ).populate({
        path: "job",
        select:
          "title location employmentType recruiter skills",
      });

    if (!applicant) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    const applicantJob =
      applicant.job as {
        recruiter?: mongoose.Types.ObjectId;
      } | null;

    if (
      !applicantJob ||
      applicantJob.recruiter?.toString() !==
        req.userId
    ) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    // Calculate match score
    const job =
      applicant.job as {
        skills?: string[];
      } | null;

    const result =
      calculateMatchScore(
        applicant.skills || [],
        job?.skills || []
      );

    res.status(200).json({
      applicant,
      matchScore:
        result.matchScore,
      matchingSkills:
        result.matchingSkills,
      missingSkills:
        result.missingSkills,
    });
  } catch (error) {
    console.error(
      "GET APPLICANT BY ID ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching applicant",
    });
  }
};

// ==========================================
// UPDATE APPLICANT
// ==========================================

export const updateApplicant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message:
          "Authentication required",
      });
      return;
    }

    const applicantId =
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    if (
      !applicantId ||
      !mongoose.Types.ObjectId.isValid(
        applicantId
      )
    ) {
      res.status(400).json({
        message:
          "Invalid applicant ID",
      });
      return;
    }

    const {
      name,
      email,
      phone,
      college,
      state,
      graduationYear,
      jobExpectation,
      skills,
      status,
      job,
    } = req.body;

    const applicant =
      await Applicant.findById(
        applicantId
      ).populate({
        path: "job",
        select: "recruiter",
      });

    if (!applicant) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    const existingJob =
      applicant.job as {
        recruiter?: mongoose.Types.ObjectId;
      } | null;

    if (
      !existingJob ||
      existingJob.recruiter?.toString() !==
        req.userId
    ) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    if (name !== undefined) {
      applicant.name =
        name.trim();
    }

    if (email !== undefined) {
      applicant.email =
        email
          .trim()
          .toLowerCase();
    }

    if (phone !== undefined) {
      applicant.phone =
        phone.trim();
    }

    if (college !== undefined) {
      applicant.college =
        college.trim();
    }

    if (state !== undefined) {
      applicant.state =
        state.trim();
    }

    if (
      graduationYear !==
        undefined &&
      graduationYear !== ""
    ) {
      applicant.graduationYear =
        Number(
          graduationYear
        );
    }

    if (
      jobExpectation !==
      undefined
    ) {
      applicant.jobExpectation =
        jobExpectation.trim();
    }

    // Update skills
    if (
      skills !== undefined &&
      skills !== ""
    ) {
      try {
        const parsedSkills =
          JSON.parse(skills);

        if (
          !Array.isArray(
            parsedSkills
          )
        ) {
          res.status(400).json({
            message:
              "Invalid skills format",
          });
          return;
        }

        applicant.skills =
          parsedSkills
            .filter(
              (
                skill: unknown
              ): skill is string =>
                typeof skill ===
                "string"
            )
            .map(
              (skill: string) =>
                skill.trim()
            )
            .filter(Boolean);
      } catch {
        res.status(400).json({
          message:
            "Invalid skills format",
        });
        return;
      }
    }

    // Allow empty skills
    if (skills === "") {
      applicant.skills = [];
    }

    if (
      status &&
      [
        "Applied",
        "Screening",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired",
      ].includes(status)
    ) {
      applicant.status =
        status;
    }

    if (job !== undefined) {
      if (
        typeof job !== "string" ||
        !mongoose.Types.ObjectId.isValid(
          job
        )
      ) {
        res.status(400).json({
          message:
            "Invalid job ID",
        });
        return;
      }

      const newJob =
        await Job.findOne({
          _id: job,
          recruiter: req.userId,
        });

      if (!newJob) {
        res.status(404).json({
          message:
            "New job not found",
        });
        return;
      }

      applicant.job =
        newJob._id;
    }

    // Replace resume when a new file is uploaded
    if (req.file) {
      applicant.resume =
        `/uploads/resumes/${req.file.filename}`;
    }

    await applicant.save();

    const updatedApplicant =
      await Applicant.findById(
        applicantId
      ).populate({
        path: "job",
        select:
          "title location employmentType skills",
      });

    // Calculate score for updated applicant
    const updatedJob =
      updatedApplicant?.job as {
        skills?: string[];
      } | null;

    const result =
      calculateMatchScore(
        updatedApplicant?.skills ||
          [],
        updatedJob?.skills ||
          []
      );

    res.status(200).json({
      message:
        "Applicant updated successfully",
      applicant:
        updatedApplicant,
      matchScore:
        result.matchScore,
      matchingSkills:
        result.matchingSkills,
      missingSkills:
        result.missingSkills,
    });
  } catch (error) {
    console.error(
      "UPDATE APPLICANT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating applicant",
    });
  }
};

// ==========================================
// DELETE APPLICANT
// ==========================================

export const deleteApplicant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message:
          "Authentication required",
      });
      return;
    }

    const applicantId =
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    if (
      !applicantId ||
      !mongoose.Types.ObjectId.isValid(
        applicantId
      )
    ) {
      res.status(400).json({
        message:
          "Invalid applicant ID",
      });
      return;
    }

    const applicant =
      await Applicant.findById(
        applicantId
      ).populate({
        path: "job",
        select: "recruiter",
      });

    if (!applicant) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    const applicantJob =
      applicant.job as {
        recruiter?: mongoose.Types.ObjectId;
      } | null;

    if (
      !applicantJob ||
      applicantJob.recruiter?.toString() !==
        req.userId
    ) {
      res.status(404).json({
        message:
          "Applicant not found",
      });
      return;
    }

    await Applicant.findByIdAndDelete(
      applicantId
    );

    res.status(200).json({
      message:
        "Applicant deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE APPLICANT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting applicant",
    });
  }
};