import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { downloadFile, getProject, updateGroupName } from '../controllers/projectController.js';

const router = express.Router();

router.get("/:projectId", isAuthenticated, getProject);
router.put("/:projectId/group-name", isAuthenticated, updateGroupName);
router.get("/:projectId/files/:fileId/download", isAuthenticated, downloadFile);

export default router;