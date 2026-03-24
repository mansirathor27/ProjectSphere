import asyncHandler  from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectService from "../services/projectService.js"
import * as requestServices from "../services/requestServices.js"
import * as notificationServices from "../services/notificationServices.js"
import * as fileServices from "../services/fileServices.js"
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import {sendEmail} from "../services/emailService.js"
import { generateRequestAcceptedTemplate, generateRequestRejectedTemplate } from "../utils/emailTemplates.js";

export const getTeacherDashboardStats = asyncHandler(async(req, res, next)=>{
    const teacherId = req.user._id;
    const totalPendingRequests = await SupervisorRequest.countDocuments({
        supervisor: teacherId,
        status: "pending",
    });
    const completedProjects = await Project.countDocuments({
        supervisor: teacherId,
        status: "completed",
    });
    const assignedStudents = await User.countDocuments({
    supervisor: teacherId,
});
    const recentNotifications = await Notification.find({
        user: teacherId,
    }).sort({createdAt: -1})
    .limit(5);
    const dashboardStats= {
        totalPendingRequests, 
        completedProjects,
        assignedStudents,
        recentNotifications,
    };

    res.status(200).json({
        success: true,
        message: "Dashboard Stats for teacher fetched successfully",
        data: {dashboardStats},
    });
});

export const getRequests = asyncHandler(async(req,res, next)=>{
    const { supervisor } = req.query;

    const filters = {};
    if (supervisor) filters.supervisor = supervisor;

    // ✅ get total count (you can keep this)
    const total = await SupervisorRequest.countDocuments(filters);

    // ✅ fetch requests with populated project
    const populatedRequests = await SupervisorRequest.find(filters)
        .populate({
            // `SupervisorRequest` contains a `student` ref, and the student's `project`
            // is where the project title/status actually lives in your current DB.
            path: "student",
            select: "name email project",
            populate: { path: "project", select: "title status supervisor" },
        })
        .populate("supervisor")
        // Keep this as well in case you later start storing project on the request itself.
        .populate("project", "title status supervisor")
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        message: "Requests fetched successfully",
        data: {
            requests: populatedRequests,
            total,
        },
    });
}); 

export const acceptRequest = asyncHandler(async(req,res, next)=>{
    const {requestId} = req.params;
    const teacherId = req.user._id;
    const request = await requestServices.acceptRequest(requestId, teacherId);
    if(!request) return next(new ErrorHandler("Requets not found", 404));
    await notificationServices.notifyUser(
        request.student._id,
        `Your supervisor request has been accepted by ${req.user.name}`,
        "approval",
        "/students/status",
        "low"
    );

    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestAcceptedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail, 
        subject: "FYP SYSTEM - ✅ Your Supervisor Request has been accepted",
        message
    });
    res.status(200).json({
        success: true,
        message : "Request accepted successfully",
        data: {request},
    });
});

export const rejectRequest = asyncHandler(async(req,res, next)=>{
    const {requestId} = req.params;
    const teacherId = req.user._id;

    const request = await requestServices.rejectRequest(requestId, teacherId);
    if(!request) return next(new ErrorHandler("Requets not found", 404));
    await notificationServices.notifyUser(
        request.student._id,
        `Your supervisor request has been rejected by ${req.user.name}`,
        "rejection",
        "/students/status",
        "high"
    );

    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestRejectedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail, 
        subject: "FYP SYSTEM - ❌ Your Supervisor Request has been rejected",
        message
    });
    res.status(200).json({
        success: true,
        message : "Request rejected successfully",
        data: {request},
    });
});

export const getAssignedStudents = asyncHandler(async(req, res, next)=>{
    const teacherId = req.user._id;

    const students = await User.find({ supervisor: teacherId })
        .populate({
            path: "project",
            select: "title status updatedAt",
        })
        .sort({ createdAt: -1 })
        .lean();

    const total = await User.countDocuments({ supervisor: teacherId });

    res.status(200).json({
        success: true,
        data: {
            students,
            total,
        },
    });
});

export const markComplete = asyncHandler(async(req, res, next)=>{
    const {projectId} = req.params; 
    const teacherId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
        if(project.supervisor._id.toString() !== teacherId.toString()){
        return next(new ErrorHandler("Not authorized to mark complete",403));
    }

    const updatedProject = await projectService.markComplete(projectId);

    await notificationServices.notifyUser(
        project.student._id,
        `Your project has been marked as completed by your supervisor (${req.user.name})`,
        "general",
        "/students/status",
        "low"
    );

    res.status(200).json({
        success: true,
        data: {
            project: updatedProject,
        },
        message: "Project marked as completed",
    });
});


export const addFeedback = asyncHandler(async(req, res, next)=>{
    const {projectId} = req.params;
    const teacherId = req.user._id;
    const {message, title, type} = req.body;

    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
    if(project.supervisor._id.toString() !== teacherId.toString()){
        return next(new ErrorHandler("Not authorized to mark complete",403));
    }
    if(!message || !title) return next(new ErrorHandler
        ("Feedback title and message are required", 400)
    );

    const {project: updatedProject, latestFeedback} = await projectService.addFeedback(projectId, teacherId, message, title, type);
    await notificationServices.notifyUser(
        project.student._id,
        `New feedback from your supervisor (${req.user.name})`,
        "feedback",
        "/students/",
        type === "positive" ? "low" : type === "negative" ? "high" : "low"
    );
    res.status(200).json({
        success: true,
        message: "Feedback posted successfully",
        data: {project: updatedProject, feedback: latestFeedback},
    })

});


export const getFiles = asyncHandler(async(req, res,next)=>{
    const teacherId = req.user._id;
    const projects = await projectService.getProjectBySupervisor(teacherId);

    const allFiles = projects.flatMap((project)=>
    project.files.map((file)=>({
        ...file.toObject(),
        projectId: project._id,
        projectTitle: project.title,
        studentName: project.student.name,
        studentEmail: project.student.email,
    })));
    res.status(200).json({
        success: true,
        message: "File fetched successfully",
        data: {
            files: allFiles,
        },
    });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project) return next(new ErrorHandler("Project not found", 404));


    if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(new ErrorHandler("Not authorized to download file", 403));
  }

  const file = project.files.find(
    (f) => f._id.toString() === fileId
  );

  if (!file) return next(new ErrorHandler("File not found", 404));
  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});