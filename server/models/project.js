import mongoose from 'mongoose'
const feedbackSchema = new mongoose.Schema({
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["positive", "negative", "general"],
            default: "general",
        },
        title: {
            type: String, 
            required: true,
        },
        message: {
            type: String,
            required: true,
            maxLength: [1000, "Feedback message cannot be more than 1000 characters"],
        },
    } , {
        timeStamps: true,
    }     
);
const projectSchema = new mongoose.Schema({
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "At least one student is required"],
        }
    ],
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    title: {
        type: String,
        required: [true, "Project Title is required"],
        trim: true,
        maxLength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Project Description is required"],
        trim: true,
        maxLength: [2000, "Description cannot be more than 2000 characters"],
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected", "completed"],
    },
    files: [
        {
            fileType: {
                type: String,
                required: true,
            },
            fileUrl: {
                type: String,
                required: true,
            },
            originalName: {
                type: String,
                required: true,
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    feedback: [feedbackSchema],

    deadline: {
        type: Date,
    },
    milestones: [
        {
            title: { type: String, required: true },
            description: { type: String },
            status: { type: String, enum: ["pending", "completed"], default: "pending" },
            completedAt: { type: Date },
        }
    ],
    tags: [
        {
            type: String,
            trim: true,
        }
    ],
    groupName: {
        type: String,
        trim: true,
        maxLength: [100, "Group Name cannot be more than 100 characters"],
    },
}, {
    timestamps: true,
});

// Indexing for better query performance
projectSchema.index({students: 1});
projectSchema.index({supervisor: 1});
projectSchema.index({status: 1});


export const Project = 
mongoose.models.Project || mongoose.model("Project", projectSchema);
