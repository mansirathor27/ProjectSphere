import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  text: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["sent", "delivered", "read"], 
    default: "sent" 
  },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
