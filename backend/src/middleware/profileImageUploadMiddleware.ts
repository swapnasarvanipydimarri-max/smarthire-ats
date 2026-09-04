import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "profile"
);

// Create the folder automatically
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

    const filename = `profile-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, JPEG and PNG profile images are allowed."
    )
  );
};

const profileImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default profileImageUpload;