import asyncHandler  from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js"
import * as projectService from "../services/projectService.js"
import * as notificationServices from "../services/notificationServices.js"
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";

export const createStudent = asyncHandler(async (req, res, next) =>{
    const {name , email , password,department } = req.body;
    if(!name || !email || !password || !department){
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const user = await userServices.createUser({
        name, email, password, department, role: "Student",
    });
    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: {user},
    });
});

export const updateStudent = asyncHandler(async (req, res, next)=>{
    const {id} = req.params;
    const updateData = {...req.body};
    delete updateData.role;

    const user = await userServices.updateUser(id, updateData);
    if(!user){
        return next(new ErrorHandler("Student not found",404));
    }
    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {user},
    });
});

export const deleteStudent = asyncHandler(async(req, res, next)=>{
    const {id} = req.params;
    const user = await userServices.getUserById(id);
    if(!user){
        return next(new ErrorHandler("Student not found", 404));
    }
    if(user.role !== "Student"){
        return next(new ErrorHandler("User is not a student", 400));
    }
    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
    });
});

export const createTeacher = asyncHandler(async (req, res, next) =>{
    const {name , email , password,department, maxStudents, experties } = req.body;
    if(!name || !email || !password || !department || !maxStudents || !experties){
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const user = await userServices.createUser({
        name, 
        email, 
        password, 
        department, 
        maxStudents, 
        experties: Array.isArray(experties) 
        ? experties 
        : typeof experties === "string" && experties.trim()!== "" 
        ? experties.split(",").map(s=> s.trim())
        : [],
        role: "Teacher",
    });
    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: {user},
    });
});

export const updateTeacher = asyncHandler(async (req, res, next)=>{
    const {id} = req.params;
    const updateData = {...req.body};
    delete updateData.role;

    const user = await userServices.updateUser(id, updateData);
    if(!user){
        return next(new ErrorHandler("Teacher not found",404));
    }
    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: {user},
    });
});


export const deleteTeacher = asyncHandler(async(req, res, next)=>{
    const {id} = req.params;
    const user = await userServices.getUserById(id);
    if(!user){
        return next(new ErrorHandler("Teacher not found", 404));
    }
    if(user.role !== "Teacher"){
        return next(new ErrorHandler("User is not a teacher", 400));
    }
    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
    });
});


export const getAllUsers = asyncHandler(async (req, res, next) =>{
    const users = await userServices.getAllUsers();
    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: { users },
    });
});


export const getAllProjects = asyncHandler(async(req, res, next) => {
    let projects;
    if (req.user.role === "Teacher") {
        projects = await Project.find({ supervisor: req.user._id })
            .populate("students", "name email department")
            .populate("supervisor", "name email");
    } else {
        projects = await projectService.getAllProjects();
    }

    res.json({
        success: true,
        message: "Projects fetched successfully",
        data: {projects},
    });
});

export const getDashboardStats = asyncHandler(async(req, res, next) => {
    const [ totalStudents, 
            totalTeachers, 
            totalProjects, 
            pendingRequests, 
            completedProjects, 
            pendingProjects] = await Promise.all([
                User.countDocuments({ role: "Student"}), 
                User.countDocuments({role: "Teacher"}),
                Project.countDocuments(),
                SupervisorRequest.countDocuments({status: "pending"}),
                Project.countDocuments({status: "completed"}),
                Project.countDocuments({status: "pending"}),
            ]); 
            res.status(200).json({
                success: true,
                message: "Admin dashboard stats fetched",
                data: {
                    stats: {
                        totalStudents, 
                        totalTeachers, 
                        totalProjects, 
                        pendingRequests, 
                        completedProjects, 
                        pendingProjects,
                    },
                },
        });
});

export const assignSupervisor = asyncHandler(async(req, res, next)=>{
    const { studentId, supervisorId, projectId } = req.body;
    if(!studentId || !supervisorId){
        return next(new ErrorHandler("Student ID and Supervisor ID are required", 400));
    }

    let project;
    if (projectId) {
        project = await Project.findById(projectId).populate("students", "name email");
    } else {
        project = await Project.findOne({ students: studentId }).populate("students", "name email");
    }

    if(!project){
        return next(new ErrorHandler("Project not found.", 404));
    }
    if(project.supervisor !== null){
        return next(new ErrorHandler("Supervisor already assigned", 400));
    }
    
    if(project.status !== "approved"){
        return next(new ErrorHandler("Project must be approved before assigning a supervisor.", 400));
    }

    const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher" });
    if (!supervisor) {
        return next(new ErrorHandler("Supervisor not found", 404));
    }

    // Check capacity for the whole group
    if (supervisor.assignedStudents.length + project.students.length > supervisor.maxStudents) {
        return next(new ErrorHandler(`Supervisor only has ${supervisor.maxStudents - supervisor.assignedStudents.length} slots left, but this group has ${project.students.length} students.`, 400));
    }

    // Assign to all students in project
    for (const studentRef of project.students) {
        const sId = studentRef._id || studentRef;
        await User.findByIdAndUpdate(sId, { supervisor: supervisorId });
        supervisor.assignedStudents.push(sId);
        
        await notificationServices.notifyUser(sId, `You have been assigned a supervisor: ${supervisor.name}`,
            "approval",
            "/student/supervisor",
            "low"
        );
    }
    
    project.supervisor = supervisorId;
    await project.save();
    await supervisor.save();

    await notificationServices.notifyUser(supervisorId, `The group project "${project.title}" has been officially assigned to you for FYP supervision.` ,
        "general",
        "/teacher/assigned-students",
        "low"
     );

     res.status(200).json({
        success: true,
        message: "Supervisor assigned successfully to the entire group",
        data: { project, supervisor },
     });
});

export const getAdminSupervisorRequests = asyncHandler(async (req, res, next) => {
    const requests = await SupervisorRequest.find()
        .populate("student", "name email department")
        .populate("supervisor", "name email department")
        .populate("project", "title status")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: { requests },
    });
});

export const approveProject = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(
        id,
        { status: "approved" },
        { new: true, runValidators: true }
    );
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Project approved successfully",
        data: { project },
    });
});

export const rejectProject = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(
        id,
        { status: "rejected" },
        { new: true, runValidators: true }
    );
    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Project rejected successfully",
        data: { project },
    });
});

