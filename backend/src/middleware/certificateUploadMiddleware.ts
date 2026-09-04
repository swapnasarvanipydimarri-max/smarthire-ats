import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "certificates"
);

// Create folder automatically
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `certificate-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

// Allow PDF and common image formats
const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only PDF, JPG, JPEG and PNG certificate files are allowed."
    )
  );
};

const certificateUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default certificateUpload;