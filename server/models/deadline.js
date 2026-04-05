import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema({
    name: {   // ✅ FIXED
        type: String,
        required: [true, "Deadline name/title is required"],
        trim: true,
        maxLength: [100, "Title cannot exceed 100 characters"],
    },

    dueDate: {   // ✅ ADDED
        type: Date,
        required: [true, "Due date is required"],
    },

    createdBy: {   // ✅ ADDED
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Created By is required"],
    },

    message: {
        type: String,
        trim: true,
        maxLength: [500, "Message cannot exceed 500 characters"],
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },

}, {
    timestamps: true,
});

// ✅ Correct index
deadlineSchema.index({dueDate: 1});
deadlineSchema.index({project: 1});
deadlineSchema.index({createdBy: 1});

export const Deadline =
mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);