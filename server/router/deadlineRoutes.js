import express from 'express'

import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { createDeadline } from '../controllers/deadlineController.js';
const router = express.Router();

router.post("/create-deadline/:id", isAuthenticated, isAuthorized("Admin"), createDeadline);



export default router;