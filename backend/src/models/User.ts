import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IEducation {
  degree: string;
  college: string;
  fieldOfStudy?: string;
  startYear?: number;
  graduationYear?: number;
}

export interface ICertificate {
  _id?: mongoose.Types.ObjectId;
  name: string;
  organization?: string;
  yearEarned?: number;
  file?: string;
}

export interface ISocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: "recruiter";

  company?: string;

  contactNumber?: string;
  whatsappNumber?: string;

  experience?: string;
  professionalSummary?: string;

  profileImage?: string;

  education: IEducation[];

  skills: string[];

  hobbies: string[];

  socialMedia: ISocialMedia;

  certificates: ICertificate[];
}

const educationSchema =
  new Schema<IEducation>(
    {
      degree: {
        type: String,
        required: true,
        trim: true,
      },

      college: {
        type: String,
        required: true,
        trim: true,
      },

      fieldOfStudy: {
        type: String,
        trim: true,
      },

      startYear: {
        type: Number,
        min: 1900,
        max: 2100,
      },

      graduationYear: {
        type: Number,
        min: 1900,
        max: 2100,
      },
    },
    {
      _id: false,
    }
  );

const certificateSchema =
  new Schema<ICertificate>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      organization: {
        type: String,
        trim: true,
      },

      yearEarned: {
        type: Number,
        min: 1900,
        max: 2100,
      },

      file: {
        type: String,
        trim: true,
      },
    },
    {
      _id: true,
    }
  );

const socialMediaSchema =
  new Schema<ISocialMedia>(
    {
      facebook: {
        type: String,
        trim: true,
      },

      instagram: {
        type: String,
        trim: true,
      },

      linkedin: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["recruiter"],
      default: "recruiter",
    },

    company: {
      type: String,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      trim: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    professionalSummary: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      trim: true,
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    hobbies: {
      type: [String],
      default: [],
    },

    socialMedia: {
      type: socialMediaSchema,
      default: {},
    },

    certificates: {
      type: [certificateSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>(
  "User",
  userSchema
);

export default User;