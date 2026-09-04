import multer from "multer";
import path from "path";
import fs from "fs";

// Create the upload directory if it doesn't exist
const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "resumes"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `resume-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

// Only allow PDF files
const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    extension === ".pdf" &&
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF resume files are allowed."
      )
    );
  }
};

// Maximum file size: 5 MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;