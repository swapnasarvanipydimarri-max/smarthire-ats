import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IApplicantNote
  extends Document {
  applicant: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicantNoteSchema =
  new Schema<IApplicantNote>(
    {
      applicant: {
        type: Schema.Types.ObjectId,
        ref: "Applicant",
        required: true,
      },

      recruiter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      note: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IApplicantNote>(
  "ApplicantNote",
  applicantNoteSchema
);