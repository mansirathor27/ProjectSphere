import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { getMessages } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:projectId", isAuthenticated, getMessages);

export default router;
