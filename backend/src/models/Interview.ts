import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IInterview extends Document {
  applicant: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;

  scheduledAt: Date;

  interviewType:
    | "Video"
    | "Phone"
    | "In-Person";

  interviewer?: string;

  status:
    | "Scheduled"
    | "Completed"
    | "Cancelled"
    | "Rescheduled";

  feedback?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema =
  new Schema<IInterview>(
    {
      applicant: {
        type: Schema.Types.ObjectId,
        ref: "Applicant",
        required: true,
      },

      job: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true,
      },

      recruiter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      scheduledAt: {
        type: Date,
        required: true,
      },

      interviewType: {
        type: String,
        enum: [
          "Video",
          "Phone",
          "In-Person",
        ],
        required: true,
      },

      interviewer: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Scheduled",
          "Completed",
          "Cancelled",
          "Rescheduled",
        ],
        default: "Scheduled",
      },

      feedback: {
        type: String,
        trim: true,
      },

      notes: {
        type: String,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IInterview>(
  "Interview",
  interviewSchema
);