import { Announcement } from "../models/Announcement.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";

// Create Announcement (Admin Only)
export const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, message, type, expiresAt } = req.body;

  if (!title || !message) {
    return next(new ErrorHandler("Please provide title and message", 400));
  }

  const announcement = await Announcement.create({
    title,
    message,
    type,
    expiresAt,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Announcement broadcasted successfully",
    data: { announcement },
  });
});

// Get Active Announcements (All Users)
export const getActiveAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: { announcements },
  });
});

// Delete/Deactivate Announcement (Admin Only)
export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorHandler("Announcement not found", 404));
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    message: "Announcement removed",
  });
});
