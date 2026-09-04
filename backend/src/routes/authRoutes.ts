import { Router } from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController";

import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get(
  "/me",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

router.delete(
  "/account",
  authMiddleware,
  deleteAccount
);

export default router;