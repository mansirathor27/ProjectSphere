import { Notification } from "../models/notification.js"
import { emitNotification } from "../socket.js";

export const createNotification = async(notificationData)=>{
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    return savedNotification;
};
export const notifyUser = async (
    userId,
    message,
    type = "general",
    link = null,
    priority = "low"
) => {
    if (Array.isArray(userId)) {
        const notifications = await Promise.all(
            userId.map((id) =>
                createNotification({
                    user: id,
                    message,
                    type,
                    link,
                    priority,
                })
            )
        );
        userId.forEach((id, index) => emitNotification(id, notifications[index]));
        return notifications;
    }

    const notification = await createNotification({
        user: userId,
        message,
        type,
        link,
        priority,
    });

    emitNotification(userId, notification);
    return notification;
};
export const markAsRead = async(notificationId, userId, role = "Student")=>{
    let query = {_id: notificationId, user: userId};
    
    // Admins can mark "request" type notifications as read even if not assigned to them specifically
    if (role === "Admin") {
        query = { _id: notificationId, type: "request" };
    }
    
    return await Notification.findOneAndUpdate(query, {isRead : true},
    {new: true}  
    );
};

export const markAllAsRead = async(userId)=>{
    return await Notification.updateMany({user: userId, isRead: false}, {isRead : true}
    );
};

export const deleteNotification = async(notificationId, userId, role = "Student")=>{
    let query = {_id: notificationId, user: userId};

    // Admins can delete "request" type notifications
    if (role === "Admin") {
        query = { _id: notificationId, type: "request" };
    }

    return await Notification.findOneAndDelete(query);
};