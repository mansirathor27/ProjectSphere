import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import adminReducer from "./slices/adminSlice";
import notificationReducer from "./slices/notificationSlice";
import studentReducer from "./slices/studentSlice";
import projectReducer from "./slices/projectSlice";
import deadlineReducer from "./slices/deadlineSlice";
import teacherReducer from "./slices/teacherSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    admin: adminReducer,
    notification: notificationReducer,
    student: studentReducer,
    project: projectReducer,
    deadline: deadlineReducer,
    teacher: teacherReducer,
  },
});
