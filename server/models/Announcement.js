import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      maxLength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "danger"],
      default: "info",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire announcements if expiresAt is set
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Announcement = mongoose.model("Announcement", announcementSchema);
