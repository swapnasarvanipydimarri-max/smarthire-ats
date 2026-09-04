import { Request, Response } from "express";
import mongoose from "mongoose";
import Interview from "../models/Interview";

export const getNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const now = new Date();

    const next24Hours = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    const next7Days = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const interviews = await Interview.find({
      recruiter: userId,
      scheduledAt: {
        $gte: now,
        $lte: next7Days,
      },
      status: {
        $in: ["Scheduled", "Rescheduled"],
      },
    })
      .populate("applicant", "name email")
      .populate("job", "title")
      .sort({ scheduledAt: 1 });

    const notifications = interviews.map(
      (interview) => {
        const scheduledTime =
          new Date(
            interview.scheduledAt
          );

        let priority:
          | "High"
          | "Medium"
          | "Low" = "Low";

        let message =
          "Upcoming interview";

        if (
          scheduledTime <= next24Hours
        ) {
          priority = "High";
          message =
            "Interview is within the next 24 hours";
        } else if (
          scheduledTime <= next7Days
        ) {
          priority = "Medium";
          message =
            "Interview is coming up this week";
        }

        return {
          _id: interview._id,
          type: "Interview",
          priority,
          message,
          scheduledAt:
            interview.scheduledAt,
          applicant:
            interview.applicant,
          job: interview.job,
          interviewType:
            interview.interviewType,
          interviewer:
            interview.interviewer,
          status: interview.status,
        };
      }
    );

    return res.status(200).json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load notifications",
    });
  }
};