import { Server } from "socket.io";
import { Message } from "./models/message.js";
import { Project } from "./models/project.js";

let io;
const connectedUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);

    // Register user when they join
    socket.on("register", async (userId) => {
      if (!userId) return;
      
      const userIdStr = userId.toString();
      socket.join(userIdStr);
      
      if (!connectedUsers.has(userIdStr)) {
        connectedUsers.set(userIdStr, new Set());
      }
      connectedUsers.get(userIdStr).add(socket.id);
      
      console.log(`User ${userIdStr} registered socket ${socket.id} and joined user room`);
      
      // Join project rooms
      try {
        const projects = await Project.find({
          $or: [
            { students: userId },
            { supervisor: userId }
          ]
        }).select("_id");
        
        projects.forEach(p => {
          socket.join(`project:${p._id.toString()}`);
          console.log(`User ${userIdStr} joined project room: project:${p._id}`);
        });
      } catch (err) {
        console.error("Error joining project rooms:", err);
      }
      
      // Broadcast online status
      io.emit("user_status", { userId: userIdStr, status: "online" });
      
      // Mark all pending messages as delivered
      Message.updateMany(
        { receiver: userId, status: "sent" },
        { status: "delivered" }
      ).then(() => {
        // Find all messages that were just marked as delivered and notify their senders
        Message.find({ receiver: userId, status: "delivered" }).then(msgs => {
            const senders = [...new Set(msgs.map(m => m.sender.toString()))];
            senders.forEach(sId => {
                const sSockets = connectedUsers.get(sId);
                if (sSockets) {
                    sSockets.forEach(sIdSocket => io.to(sIdSocket).emit("messages_delivered", { receiverId: userIdStr }));
                }
            });
        });
      });

      // Send the current list of online users to the newly connected user
      socket.emit("online_users", Array.from(connectedUsers.keys()));
    });

    // Handle typing events - now project-aware
    socket.on("typing", (data) => {
      const { projectId, senderId } = data;
      if (projectId) {
        // Broadcast to everyone in the project room except sender
        socket.to(`project:${projectId}`).emit("user_typing", { senderId, projectId });
      }
    });

    socket.on("stop_typing", (data) => {
      const { projectId, senderId } = data;
      if (projectId) {
        // Broadcast to everyone in the project room except sender
        socket.to(`project:${projectId}`).emit("user_stop_typing", { senderId, projectId });
      }
    });

    // Handle sending a message
    socket.on("send_message", async (data) => {
      try {
        const { sender, receiver, project, text } = data;

        // Save to DB (receiver is optional for group chats, but we keep it for 1-on-1 if provided)
        const newMessage = await Message.create({ sender, receiver, project, text, status: "sent" });
        // Populate sender info
        await newMessage.populate("sender", "name email");

        // Emit to project room (this handles everyone: sender's other tabs, receiver, and other students)
        io.to(`project:${project}`).emit("receive_message", newMessage);
        
        // Also emit 'message_sent' to sender specifically for UI confirmation if needed
        socket.emit("message_sent", newMessage);

      } catch (error) {
        console.error("Socket send_message error:", error);
      }
    });

    // Handle mark as read
    socket.on("mark_read", async (data) => {
      const { messageIds, senderId, projectId } = data;
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: "read" }
        );

        // Notify people in the project room that messages were read
        if (projectId) {
          io.to(`project:${projectId}`).emit("messages_read", { messageIds, projectId, readerId: data.readerId });
        }
      } catch (error) {
        console.error("Socket mark_read error:", error);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;
      for (const [userId, socketIds] of connectedUsers.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            disconnectedUserId = userId;
            connectedUsers.delete(userId);
          }
          break;
        }
      }
      
      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} fully disconnected`);
        io.emit("user_status", { userId: disconnectedUserId, status: "offline" });
      }
    });
  });

  return io;
};

export const getSocket = () => io;

export const emitNotification = (userId, notification) => {
  if (io && userId) {
    io.to(userId.toString()).emit("new_notification", notification);
  }
};
