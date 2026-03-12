import express from 'express'
import multer from 'multer'
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { createStudent, createTeacher, deleteStudent, deleteTeacher, getAllUsers, updateStudent, updateTeacher } from '../controllers/adminController.js';


const router = express.Router();

router.post("/create-student", isAuthenticated, isAuthorized("Admin"), createStudent);
router.put("/update-student/:id", isAuthenticated, isAuthorized("Admin"), updateStudent);
router.delete("/delete-student/:id", isAuthenticated, isAuthorized("Admin"), deleteStudent);

router.post("/create-teacher", isAuthenticated, isAuthorized("Admin"), createTeacher);
router.put("/update-teacher/:id", isAuthenticated, isAuthorized("Admin"), updateTeacher);
router.delete("/delete-teacher/:id", isAuthenticated, isAuthorized("Admin"), deleteTeacher);
router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);

export default router;