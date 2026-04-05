import express from "express";
import multer from "multer";
import { forgotPassword, getUser, login, logout, registerUser, resetPassword, updateProfile } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", login); 
router.get("/me",isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/update-profile", isAuthenticated, updateProfile);

export default router;