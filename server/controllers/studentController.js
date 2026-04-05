import asyncHandler  from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";

import * as projectService from "../services/projectService.js"
import * as requestServices from "../services/requestServices.js"
import * as notificationServices from "../services/notificationServices.js"
import * as fileServices from "../services/fileServices.js"
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import { sendEmail } from "../services/emailService.js";
import { generateRequestSentTemplate } from "../utils/emailTemplates.js";

export const getStudentProject = asyncHandler(async (req,res,next) => {
    const studentId = req.user._id;
    const project = await projectService.getProjectByStudent(studentId);
    if(!project){
        return res.status(200).json({
            success: true,
            data: {project: null},
            message: "No project found for this student",
        });
    }
    return res.status(200).json({
        success: true,
        data: {project},
    });
});

export const submitProposal = asyncHandler(async(req, res, next)=>{
    const {title, description, groupMembers = [], tags = []} = req.body;
    const studentId = req.user._id;

    const existingProject = await projectService.getProjectByStudent(studentId);

    if(existingProject && existingProject.status !== "rejected"){
        return next(new ErrorHandler(
            "You already have an active project. You can only submit a new proposal if the previous project is rejected.",
            400)
        );
    }

    if(existingProject && existingProject.status === "rejected"){
        await Project.findByIdAndDelete(existingProject._id);
    }

    // Include self and group members
    const studentIds = [studentId, ...groupMembers];

    const projectData = {
        students: studentIds,
        title,
        description,
        tags: Array.isArray(tags) ? tags : [],
    };

    const project = await projectService.createProject(projectData);

    // Update all participating students
    await User.updateMany(
        { _id: { $in: studentIds } },
        { project: project._id }
    );

    res.status(200).json({
        success: true,
        data: {project},
        message: "Project proposal submitted successfully",
    });
});

export const searchStudents = asyncHandler(async (req, res, next) => {
    const { query } = req.query;
    if (!query) {
        return res.status(200).json({ success: true, data: { students: [] } });
    }

    const students = await User.find({
        role: "Student",
        _id: { $ne: req.user._id }, // Exclude self
        $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
        ]
    }).select("name email department").limit(10);

    res.status(200).json({
        success: true,
        data: { students }
    });
});

export const uploadFiles = asyncHandler(async(req, res, next)=>{
    const {projectId} = req.params;
    const studentId = req.user._id;
    const project = await projectService.getProjectById(projectId);
    if (
  !project ||
  !project.students.some(
    (s) => s._id.toString() === studentId.toString()
  )
) {
  return next(new ErrorHandler("Not authorized to upload files to this project.", 403));
}
    if(!req.files || req.files.length === 0){
        return next(new ErrorHandler("No files uploaded", 400));
    }
    const updatedProject = await projectService.addFilesToProject(projectId, req.files);
    res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {project: updatedProject},
    });
});


export const getAvailableSupervisors = asyncHandler(async(req, res, next)=>{
    const supervisors = await User.find({role: "Teacher"})
    .select("name email department experties")
    .lean();
    res.status(200).json({
        success: true,
        data: {supervisors},
        message: "Available supervisors fetched successfully",
    });
});

export const getSupervisor = asyncHandler(async(req, res, next) => {
    const studentId = req.user._id;
    const student = await User.findById(studentId).populate(
        "supervisor",
        "name email department experties"
    );
    if(!student.supervisor){
        return res.status(200).json({
            success: true,
            data: {supervisor: null},
            message: "No supervisor assigned yet",
        });
    }
    res.status(200).json({
        success: true,
        data: {supervisor: student.supervisor},
    });
});

export const requestSupervisor = asyncHandler(async(req, res, next)=>{
    const {teacherId, message} = req.body;

    const studentId = req.user._id;
    const student = await User.findById(studentId);
    const project = await Project.findOne({ student: studentId })
  .sort({ createdAt: -1 });
  console.log("FOUND PROJECT:", project);
    if(student.supervisor){
        return next(new ErrorHandler("You already have a supervisor assigned.", 400));
    }
    const supervisor = await User.findById(teacherId);
    if(!supervisor || supervisor.role !== "Teacher"){
        return next(new ErrorHandler("Invalid supervisor selected.",400));
    }
    if(supervisor.maxStudents === supervisor.assignedStudents?.length){
        return next(new ErrorHandler("Selected supervisor has reached maximum student capacity", 400));
    }

    const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
    project: project?._id   // ⭐ THIS LINE FIXES EVERYTHING
};
    
    const request = await requestServices.createRequest(requestData);
    console.log("SAVED REQUEST:", request);
    await notificationServices.notifyUser(
        teacherId,
        `${student.name} has requested ${supervisor.name} to be their supervisor.`,
        "request",
        "/teacher/pending-requests", "medium"
    ); 

    try {
        const message = generateRequestSentTemplate(student.name, project?.title || "Project Proposal");
        await sendEmail({
            to: supervisor.email,
            subject: "FYP SYSTEM - 📩 New Supervisor Request",
            message
        });
    } catch (error) {
        console.error("Failed to send supervisor request email:", error);
    }

    res.status(200).json({
        success: true,
        data: {request},
        message: "Supervisor request submitted successfully.",
    })
});

export const getDashboardStats = asyncHandler(async(req, res, next)=>{
    const studentId = req.user._id;
    const project = await Project.findOne({students: studentId})
    .sort({createdAt: -1})
    .populate('supervisor', 'name')
    .populate('students', 'name')
    .lean();

    const now = new Date();
    const upcomingDeadlines = await Project.find({
        students: studentId, 
        deadline: {$gte: now},
    }).select("title description").sort({deadline: 1})
    .limit(3)
    .lean();

    const topNotifications = await Notification.find({user: studentId})
    
    .sort({createdAt: -1})
    .limit(1)
    .populate('user', 'name')
    .lean();

    const feedbackNotifications = project?.feedback && project?.feedback.length > 0 ? project.feedback.
    sort((a,b) => new Date (b.createdAt) - new Date(a.createdAt))
    .slice(0,2) : [];
    
    const supervisorName = project?.supervisor?.name || null;
    res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfully",
        data: {
            project,
            upcomingDeadlines,
            topNotifications,
            feedbackNotifications,
            supervisorName
        }
    })
});

export const getFeedback = asyncHandler(async(req, res, next) => {
    const {projectId} = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);

    if (
  !project ||
  !project.students.some(
    (s) => s._id.toString() === studentId.toString()
  )
) {
  return next(new ErrorHandler("Not authorized to access feedback for this project.", 403));
}
    const sortedFeedback = project.feedback.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(
        (f)=> ({
            _id: f._id,
            title: f.title,
            message: f.message,
            type: f.type,
            createdAt: f.createdAt || new Date(),
            supervisorName: f.supervisorId?.name,
            supervisorEmail: f.supervisorId?.email,
        })
    )
    res.status(200).json({
        success: true,
        data: {feedback : sortedFeedback}
    });
});

export const downloadFile = asyncHandler(async(req, res, next) =>{
    const { projectId, fileId} = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
    if (
  !project.students.some(
    (s) => s._id.toString() === studentId.toString()
  )
) {
  return next(new ErrorHandler("Not authorized to download file", 403));
}
    const file = project.files.id(fileId);
    if(!file) return next(new ErrorHandler("File not found", 404));

    fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
