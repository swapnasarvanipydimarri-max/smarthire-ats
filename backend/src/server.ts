import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicantRoutes from "./routes/applicantRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import profileRoutes from "./routes/profileRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import applicantNoteRoutes from "./routes/applicantNoteRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigin =
  process.env.FRONTEND_URL ||
  "https://organic-chainsaw-7vg6rxp9qxx73qxg-5173.app.github.dev";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({
    message: "SmartHire API is running 🚀",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SmartHire API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/applicant-notes", applicantNoteRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SmartHire server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed ❌", error);
  }
};

startServer();