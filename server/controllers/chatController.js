import asyncHandler from "../middlewares/asyncHandler.js";
import { Message } from "../models/message.js";

export const getMessages = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  
  const messages = await Message.find({ project: projectId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: { messages },
  });
});
