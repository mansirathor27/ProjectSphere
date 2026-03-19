import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import adminReducer from "./slices/adminSlice";
import notificationReducer from "./slices/notificationSlice";
import studentReducer from "./slices/studentSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    admin: adminReducer,
    notification: notificationReducer,
    student: studentReducer,

  },
});
