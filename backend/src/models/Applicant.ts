import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IApplicant extends Document {
  name: string;
  email: string;
  phone?: string;

  college?: string;
  state?: string;
  graduationYear?: number;
  jobExpectation?: string;

  // Skills of the applicant
  skills: string[];

  resume?: string;

  job: mongoose.Types.ObjectId;

  status:
    | "Applied"
    | "Screening"
    | "Shortlisted"
    | "Interview"
    | "Rejected"
    | "Hired";

  appliedAt: Date;
}

const applicantSchema =
  new Schema<IApplicant>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      college: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      graduationYear: {
        type: Number,
        min: 1900,
        max: 2100,
      },

      jobExpectation: {
        type: String,
        trim: true,
      },

      // Applicant skills
      skills: {
        type: [String],
        default: [],
      },

      resume: {
        type: String,
        trim: true,
      },

      job: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "Applied",
          "Screening",
          "Shortlisted",
          "Interview",
          "Rejected",
          "Hired",
        ],
        default: "Applied",
      },

      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

const Applicant =
  mongoose.model<IApplicant>(
    "Applicant",
    applicantSchema
  );

export default Applicant;