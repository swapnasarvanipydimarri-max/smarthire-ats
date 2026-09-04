import { Router, Request, Response, NextFunction } from "express";

import {
  addCertificate,
  deleteCertificate,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/profileController";

import authMiddleware from "../middleware/authMiddleware";
import certificateUpload from "../middleware/certificateUploadMiddleware";
import profileImageUpload from "../middleware/profileImageUploadMiddleware";

const router = Router();

router.use(authMiddleware);

// ==========================================
// CERTIFICATE UPLOAD
// ==========================================
router.post(
  "/certificates",
  certificateUpload.single("certificate"),
  (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error) {
      console.error(
        "CERTIFICATE UPLOAD ERROR:",
        error
      );

      res.status(400).json({
        message:
          error.message ||
          "Certificate upload failed",
      });
      return;
    }

    next();
  },
  addCertificate
);

// ==========================================
// DELETE CERTIFICATE
// ==========================================
router.delete(
  "/certificates/:id",
  deleteCertificate
);

// ==========================================
// PROFILE IMAGE UPLOAD
// ==========================================
router.post(
  "/profile-image",
  profileImageUpload.single("profileImage"),
  (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error) {
      console.error(
        "PROFILE IMAGE UPLOAD ERROR:",
        error
      );

      res.status(400).json({
        message:
          error.message ||
          "Profile image upload failed",
      });
      return;
    }

    next();
  },
  uploadProfileImage
);

// ==========================================
// DELETE PROFILE IMAGE
// ==========================================
router.delete(
  "/profile-image",
  deleteProfileImage
);

export default router;