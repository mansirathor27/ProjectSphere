import * as projectService from "../services/projectService.js";
import * as fileServices from "../services/fileServices.js";

import asyncHandler from "../middlewares/asyncHandler.js"
import ErrorHandler from "../middlewares/error.js";


export const downloadFile = asyncHandler(async(req, res, next) =>{
    const { projectId, fileId} = req.params;
    const user = req.user;
    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));

    const userRole = (user.role || "").toLowerCase();
    const userId = user._id.toString() || user.id;
    const hasAccess = userRole === "admin" || 
    project.student._id.toString() === userId || 
    (project.supervisor && project.supervisor._id.toString()=== userId);

    if(!hasAccess){
        return next(new ErrorHandler("Not authorized to download files from this project", 403));
    }
    const file = project.files.id(fileId);
    if(!file) return next(new ErrorHandler("File not found", 404));

    fileServices.streamDownload(file.fileUrl, res, file.originalName);
});

export const getProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    res.status(200).json({
        success: true,
        data: { project },
    });
});

export const updateGroupName = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { groupName } = req.body;
    const userId = req.user._id.toString();

    const project = await projectService.getProjectById(projectId);
    if (!project) return next(new ErrorHandler("Project not found", 404));

    // Only allow students assigned to this project or admin to update group name
    const isStudentInProject = project.students.some(s => s._id.toString() === userId);
    const isAdmin = req.user.role === "Admin";

    if (!isStudentInProject && !isAdmin) {
        return next(new ErrorHandler("Not authorized to update group name", 403));
    }

    const updatedProject = await projectService.updateGroupName(projectId, groupName);

    res.status(200).json({
        success: true,
        data: { project: updatedProject },
        message: "Group name updated successfully",
    });
});
