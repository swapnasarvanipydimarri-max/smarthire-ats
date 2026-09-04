import { Request, Response } from "express";
import Job from "../models/Job";

// CREATE JOB
export const createJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      location,
      salary,
      employmentType,
      skills,
    } = req.body;

    // Make sure the recruiter is authenticated
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Required fields
    if (
      !title ||
      !description ||
      !location ||
      !employmentType
    ) {
      res.status(400).json({
        message:
          "Title, description, location and employment type are required",
      });
      return;
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      salary: salary?.trim() || "",
      employmentType,
      skills: Array.isArray(skills) ? skills : [],
      recruiter: req.userId,
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

    res.status(500).json({
      message: "Server error while creating job",
    });
  }
};

// GET ALL JOBS
export const getJobs = async (
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

    const jobs = await Job.find({
      recruiter: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      jobs,
    });
  } catch (error) {
    console.error("GET JOBS ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
};

// GET SINGLE JOB
export const getJobById = async (
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

    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.userId,
    });

    if (!job) {
      res.status(404).json({
        message: "Job not found",
      });
      return;
    }

    res.status(200).json({
      job,
    });
  } catch (error) {
    console.error("GET JOB BY ID ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching job",
    });
  }
};

// UPDATE JOB
export const updateJob = async (
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
      title,
      description,
      location,
      salary,
      employmentType,
      skills,
      status,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !employmentType
    ) {
      res.status(400).json({
        message:
          "Title, description, location and employment type are required",
      });
      return;
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        recruiter: req.userId,
      },
      {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        salary: salary?.trim() || "",
        employmentType,
        skills: Array.isArray(skills) ? skills : [],
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      res.status(404).json({
        message: "Job not found",
      });
      return;
    }

    res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);

    res.status(500).json({
      message: "Server error while updating job",
    });
  }
};

// DELETE JOB
export const deleteJob = async (
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

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.userId,
    });

    if (!job) {
      res.status(404).json({
        message: "Job not found",
      });
      return;
    }

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);

    res.status(500).json({
      message: "Server error while deleting job",
    });
  }
};