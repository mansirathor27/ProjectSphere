import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import {Deadline} from "../models/deadline.js";
import {Project} from "../models/project.js";
import { getProjectById } from "../services/projectService.js";

export const createDeadline = asyncHandler(async(req, res, next)=>{
    const {id} = req.params;
    const {name ,dueDate} = req.body;
    const project = await getProjectById(id);
    if(!project){
        return next(new ErrorHandler("Project not found", 404));
    }

    if(!name || !dueDate){
        return next(new ErrorHandler("Name and due date are required", 400));
    }
    const deadlineData = {
        name, 
        dueDate: new Date(dueDate),
        createdBy: req.user._id,
        project: project._id,
    };

    const deadline = await Deadline.create(deadlineData);
    await deadline.populate([{path: "createdBy", select: "name email"},
    ]);
    if(project){
        await Project.findByIdAndUpdate(
            project._id,
            {deadline: dueDate},
            {new: true, runValidators: true}
        );

        // Real-time emission
        try {
            const { getSocket } = await import("../socket.js");
            const io = getSocket();
            if (io) {
                // Notify students
                project.students.forEach(studentId => {
                    io.to(studentId.toString()).emit("project_updated", { projectId: project._id, deadline: dueDate });
                    io.to(studentId.toString()).emit("new_notification", { message: `New deadline set for ${project.title}: ${new Date(dueDate).toLocaleDateString()}` });
                });
                // Notify supervisor
                if (project.supervisor) {
                    io.to(project.supervisor.toString()).emit("project_updated", { projectId: project._id, deadline: dueDate });
                }
            }
        } catch (err) {
            console.error("Socket emission failed in createDeadline:", err);
        }
    }
    return res.status(201).json({
        success: true,
        message: "Deadline created successfully",
        data: {deadline},
    });
});