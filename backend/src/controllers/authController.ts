import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

// ===============================
// REGISTER
// ===============================
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("REGISTER CONTROLLER HIT");

  try {
    const { name, email, password, company } = req.body;

    console.log("REGISTER DATA RECEIVED:", {
      name,
      email,
      company,
      passwordProvided: Boolean(password),
    });

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    console.log("EXISTING USER:", Boolean(existingUser));

    if (existingUser) {
      res.status(409).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("PASSWORD HASHED");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      company: company?.trim(),
      role: "recruiter",
    });

    console.log("USER CREATED:", user._id.toString());

    const token = generateToken(user._id.toString());

    console.log("TOKEN CREATED");

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });

    console.log("REGISTER COMPLETED");
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("LOGIN CONTROLLER HIT");

  try {
    const { email, password } = req.body;

    console.log("LOGIN DATA RECEIVED:", {
      email,
      passwordProvided: Boolean(password),
    });

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("LOOKING FOR USER");

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("USER FOUND:", Boolean(user));

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    console.log("CHECKING PASSWORD");

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD VALID:", isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken(user._id.toString());

    console.log("LOGIN TOKEN CREATED");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
      },
    });

    console.log("LOGIN COMPLETED");
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ===============================
// GET CURRENT USER PROFILE
// ===============================
export const getProfile = async (
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

    const user = await User.findById(req.userId).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error while loading profile",
    });
  }
};

// ===============================
// UPDATE PROFILE
// ===============================
export const updateProfile = async (
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
      email,
      contactNumber,
      whatsappNumber,
      role,
      company,
      experience,
      professionalSummary,
      education,
      skills,
      hobbies,
      socialMedia,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Name
    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({
          message: "Name cannot be empty",
        });
        return;
      }

      user.name = name.trim();
    }

    // Email
    if (email !== undefined) {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.userId },
      });

      if (existingUser) {
        res.status(409).json({
          message: "Email is already in use",
        });
        return;
      }

      user.email = normalizedEmail;
    }

    // Personal information
    if (contactNumber !== undefined) {
      user.contactNumber = contactNumber.trim();
    }

    if (whatsappNumber !== undefined) {
      user.whatsappNumber = whatsappNumber.trim();
    }

    if (role !== undefined) {
      user.role = "recruiter";
    }

    if (company !== undefined) {
      user.company = company.trim();
    }

    if (experience !== undefined) {
      user.experience = experience.trim();
    }

    if (professionalSummary !== undefined) {
      user.professionalSummary =
        professionalSummary.trim();
    }

    // Education
    if (education !== undefined) {
      if (!Array.isArray(education)) {
        res.status(400).json({
          message: "Education must be an array",
        });
        return;
      }

      user.education = education;
    }

    // Skills
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        res.status(400).json({
          message: "Skills must be an array",
        });
        return;
      }

      user.skills = skills
        .filter(
          (skill): skill is string =>
            typeof skill === "string"
        )
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    // Hobbies
    if (hobbies !== undefined) {
      if (!Array.isArray(hobbies)) {
        res.status(400).json({
          message: "Hobbies must be an array",
        });
        return;
      }

      user.hobbies = hobbies
        .filter(
          (hobby): hobby is string =>
            typeof hobby === "string"
        )
        .map((hobby) => hobby.trim())
        .filter(Boolean);
    }

    // Social media
    if (socialMedia !== undefined) {
      user.socialMedia = {
        facebook:
          typeof socialMedia.facebook === "string"
            ? socialMedia.facebook.trim()
            : "",
        instagram:
          typeof socialMedia.instagram === "string"
            ? socialMedia.instagram.trim()
            : "",
        linkedin:
          typeof socialMedia.linkedin === "string"
            ? socialMedia.linkedin.trim()
            : "",
      };
    }

    await user.save();

    const updatedUser = await User.findById(
      req.userId
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = async (
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
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      res.status(400).json({
        message:
          "Current password, new password and confirmation are required",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        message: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        message:
          "New password must be at least 6 characters",
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

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordValid) {
      res.status(401).json({
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while changing password",
    });
  }
};

// ===============================
// DELETE ACCOUNT
// ===============================
export const deleteAccount = async (
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
      password,
      confirmation,
    } = req.body;

    if (!password) {
      res.status(400).json({
        message:
          "Password is required to delete the account",
      });
      return;
    }

    if (confirmation !== "DELETE") {
      res.status(400).json({
        message:
          'Please type "DELETE" to confirm account deletion',
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

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      res.status(401).json({
        message: "Incorrect password",
      });
      return;
    }

    await User.findByIdAndDelete(req.userId);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ACCOUNT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting account",
    });
  }
};