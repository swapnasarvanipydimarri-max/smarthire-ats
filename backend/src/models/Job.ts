import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  salary?: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  skills: string[];
  status: "Active" | "Closed";
  recruiter: mongoose.Types.ObjectId;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: String,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
      ],
      required: true,
    },

    // Skills required for this job
    // These will be used later for candidate matching.
    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    recruiter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;