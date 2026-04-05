import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  createAnnouncement,
  getActiveAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

// Publicly available (but authenticated) route to fetch latest broadcast
router.get("/active", isAuthenticated, getActiveAnnouncements);

// Admin only routes for broadcasting and management
router.post("/broadcast", isAuthenticated, isAuthorized("Admin"), createAnnouncement);
router.delete("/:id", isAuthenticated, isAuthorized("Admin"), deleteAnnouncement);

export default router;
