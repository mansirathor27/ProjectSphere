import express from 'express'
import multer from 'multer'
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { approveProject, rejectProject, assignSupervisor, createStudent, createTeacher, deleteStudent, deleteTeacher, getAllProjects, getAllUsers, getDashboardStats, updateStudent, updateTeacher, getAdminSupervisorRequests } from '../controllers/adminController.js';


const router = express.Router();

router.post("/create-student", isAuthenticated, isAuthorized("Admin"), createStudent);
router.put("/update-student/:id", isAuthenticated, isAuthorized("Admin"), updateStudent);
router.delete("/delete-student/:id", isAuthenticated, isAuthorized("Admin"), deleteStudent);

router.post("/create-teacher", isAuthenticated, isAuthorized("Admin"), createTeacher);
router.put("/update-teacher/:id", isAuthenticated, isAuthorized("Admin"), updateTeacher);
router.delete("/delete-teacher/:id", isAuthenticated, isAuthorized("Admin"), deleteTeacher);
router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.get("/projects", isAuthenticated, isAuthorized("Admin", "Teacher"), getAllProjects);
router.get("/fetch-dashboard-stats", isAuthenticated, isAuthorized("Admin"), getDashboardStats);
router.get("/assign-supervisor", isAuthenticated, isAuthorized("Admin"), assignSupervisor);
router.post("/assign-supervisor", isAuthenticated, isAuthorized("Admin"), assignSupervisor);
router.get("/supervisor-requests", isAuthenticated, isAuthorized("Admin"), getAdminSupervisorRequests);
router.put("/approve-project/:id", isAuthenticated, isAuthorized("Admin"), approveProject);
router.put("/reject-project/:id", isAuthenticated, isAuthorized("Admin"), rejectProject);

export default router;