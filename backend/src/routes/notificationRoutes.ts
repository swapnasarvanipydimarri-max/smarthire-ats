import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getNotifications,
} from "../controllers/notificationController";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  getNotifications
);

export default router;