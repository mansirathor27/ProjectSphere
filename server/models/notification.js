import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Deadline name/title is required"],
        trim: true,
        maxLength: [100, "Deadline message cannot be more than 100 characters"],
    },

    dueDate: {
        type: Date,
        required: [true, "Due date is required"],
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Created By is required"],
    },

    Project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    }, 
    
}, {
    timestamps: true,
});

// Indexing for better query performance
notificationSchema.index({dueDate: 1});
notificationSchema.index({project: 1});
notificationSchema.index({createdBy: 1});

export const Notification = 
mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
