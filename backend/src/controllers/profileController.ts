import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import User from "../models/User";

// ==========================================
// ADD CERTIFICATE
// ==========================================
export const addCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const {
      name,
      organization,
      yearEarned,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        message: "Certificate name is required",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "Please upload a certificate file",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    user.certificates.push({
      name: name.trim(),

      organization:
        typeof organization === "string"
          ? organization.trim()
          : "",

      yearEarned:
        yearEarned !== undefined &&
        yearEarned !== ""
          ? Number(yearEarned)
          : undefined,

      file: `/uploads/certificates/${req.file.filename}`,
    });

    await user.save();

    const updatedUser = await User.findById(
      req.userId
    ).select("-password");

    res.status(201).json({
      message:
        "Certificate uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "ADD CERTIFICATE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while uploading certificate",
    });
  }
};

// ==========================================
// DELETE CERTIFICATE
// ==========================================
export const deleteCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const certificateId = Array.isArray(
      req.params.id
    )
      ? req.params.id[0]
      : req.params.id;

    if (!certificateId) {
      res.status(400).json({
        message: "Certificate ID is required",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const certificateIndex =
      user.certificates.findIndex(
        (certificate) =>
          certificate._id?.toString() ===
          certificateId
      );

    if (certificateIndex === -1) {
      res.status(404).json({
        message: "Certificate not found",
      });
      return;
    }

    const certificate =
      user.certificates[certificateIndex];

    // Delete physical certificate file
    if (certificate.file) {
      const filePath = path.join(
        process.cwd(),
        certificate.file.replace(
          /^\/uploads\//,
          "uploads/"
        )
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.certificates.splice(
      certificateIndex,
      1
    );

    await user.save();

    const updatedUser = await User.findById(
      req.userId
    ).select("-password");

    res.status(200).json({
      message:
        "Certificate deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "DELETE CERTIFICATE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting certificate",
    });
  }
};

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================
export const uploadProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "Please select a profile image",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Delete previous profile image
    if (user.profileImage) {
      const oldFilePath = path.join(
        process.cwd(),
        user.profileImage.replace(
          /^\/uploads\//,
          "uploads/"
        )
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    user.profileImage = `/uploads/profile/${req.file.filename}`;

    await user.save();

    const updatedUser = await User.findById(
      req.userId
    ).select("-password");

    res.status(200).json({
      message:
        "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "UPLOAD PROFILE IMAGE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while uploading profile picture",
    });
  }
};

// ==========================================
// DELETE PROFILE IMAGE
// ==========================================
export const deleteProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Delete physical profile image
    if (user.profileImage) {
      const filePath = path.join(
        process.cwd(),
        user.profileImage.replace(
          /^\/uploads\//,
          "uploads/"
        )
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.profileImage = "";

    await user.save();

    const updatedUser = await User.findById(
      req.userId
    ).select("-password");

    res.status(200).json({
      message:
        "Profile picture removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "DELETE PROFILE IMAGE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while removing profile picture",
    });
  }
};