import { Request, Response } from "express";
import Job from "../models/Job";
import Applicant from "../models/Applicant";

export const getDashboardStats = async (
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

    // ==========================================
    // RECRUITER JOBS
    // ==========================================

    const jobs = await Job.find({
      recruiter: req.userId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const jobIds = await Job.find({
      recruiter: req.userId,
    }).distinct("_id");

    // ==========================================
    // BASIC COUNTS
    // ==========================================

    const [
      totalJobs,
      activeJobs,
      totalApplicants,
      appliedApplicants,
      screeningApplicants,
      shortlistedApplicants,
      interviewApplicants,
      rejectedApplicants,
      hiredApplicants,
    ] = await Promise.all([
      Job.countDocuments({
        recruiter: req.userId,
      }),

      Job.countDocuments({
        recruiter: req.userId,
        status: "Active",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Applied",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Screening",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Shortlisted",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Interview",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Rejected",
      }),

      Applicant.countDocuments({
        job: { $in: jobIds },
        status: "Hired",
      }),
    ]);

    // ==========================================
    // RATES
    // ==========================================

    const hiringRate =
      totalApplicants > 0
        ? Number(
            (
              (hiredApplicants / totalApplicants) *
              100
            ).toFixed(1)
          )
        : 0;

    const rejectionRate =
      totalApplicants > 0
        ? Number(
            (
              (rejectedApplicants / totalApplicants) *
              100
            ).toFixed(1)
          )
        : 0;

    const interviewRate =
      totalApplicants > 0
        ? Number(
            (
              (interviewApplicants / totalApplicants) *
              100
            ).toFixed(1)
          )
        : 0;

    const shortlistRate =
      totalApplicants > 0
        ? Number(
            (
              (shortlistedApplicants / totalApplicants) *
              100
            ).toFixed(1)
          )
        : 0;

    // ==========================================
    // APPLICANTS PER JOB
    // ==========================================

    const applicantsPerJobRaw =
      await Applicant.aggregate([
        {
          $match: {
            job: { $in: jobIds },
          },
        },
        {
          $group: {
            _id: "$job",
            applicantCount: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            applicantCount: -1,
          },
        },
      ]);

    const applicantJobIds =
      applicantsPerJobRaw.map(
        (item) => item._id
      );

    const applicantJobs =
      await Job.find({
        _id: { $in: applicantJobIds },
      }).select("title");

    const applicantsPerJob =
      applicantsPerJobRaw.map((item) => {
        const job = applicantJobs.find(
          (currentJob) =>
            currentJob._id.toString() ===
            item._id.toString()
        );

        return {
          jobId: item._id,
          jobTitle: job?.title || "Unknown Job",
          applicantCount: item.applicantCount,
        };
      });

    // ==========================================
    // RECENT APPLICANTS
    // ==========================================

    const recentApplicants =
      await Applicant.find({
        job: { $in: jobIds },
      })
        .populate({
          path: "job",
          select: "title",
        })
        .sort({ appliedAt: -1 })
        .limit(5);

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplicants,

        appliedApplicants,
        screeningApplicants,
        shortlistedApplicants,
        interviewApplicants,
        rejectedApplicants,
        hiredApplicants,

        hiringRate,
        rejectionRate,
        interviewRate,
        shortlistRate,
      },

      recruitmentFunnel: [
        {
          status: "Applied",
          count: appliedApplicants,
        },
        {
          status: "Screening",
          count: screeningApplicants,
        },
        {
          status: "Shortlisted",
          count: shortlistedApplicants,
        },
        {
          status: "Interview",
          count: interviewApplicants,
        },
        {
          status: "Hired",
          count: hiredApplicants,
        },
      ],

      applicantsPerJob,

      recentJobs: jobs,
      recentApplicants,
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD STATS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while loading dashboard",
    });
  }
};