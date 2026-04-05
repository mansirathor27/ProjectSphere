import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getNotifications = createAsyncThunk("getNotifications", async (_, thunkAPI)=>{
  try {
    const res = await axiosInstance.get("/notification")
    return res.data?.data || res.data;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to fetch notifications");
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
export const markAsRead = createAsyncThunk("markAsRead", async (id, thunkAPI)=>{
  try {
    await axiosInstance.put(`/notification/${id}/read`);
    return id;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to fetch notifications");
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
export const markAllAsRead = createAsyncThunk("markAllAsRead", async (_, thunkAPI)=>{
  try {
    await axiosInstance.put(`/notification/read-all`);
    return true;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to fetch notifications");
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
export const deleteNotification = createAsyncThunk("deleteNotification", async (id, thunkAPI)=>{
  try {
    await axiosInstance.delete(`/notification/${id}/delete`);
    return id;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to fetch notifications");
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      // Check if it already exists (ID might be different if from different sources, but usually safe)
      if (state.list.some(n => n._id === action.payload._id)) return;
      
      state.list.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      if (action.payload.priority === "high") {
        state.highPriorityMessages += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getNotifications.fulfilled, (state, action)=>{
      state.list = action.payload?.notifications || action.payload || [];
      state.unreadCount = action.payload?.unreadOnly || 0;
      state.readCount = action.payload?.readOnly || 0;
      state.highPriorityMessages = action.payload?.highPriorityMessages || 0;
      state.thisWeekNotifications = action.payload?.thisWeekNotifications || 0;
      state.loading = false;
    });
    builder.addCase(getNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch notifications";
    });
    builder.addCase(markAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markAsRead.fulfilled, (state, action)=>{
      state.list = state.list.map((n)=>{
        if(n._id === action.payload && !n.isRead){
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.readCount = state.readCount + 1;
          return {...n, isRead: true};
        }
        return n;
      });
      state.loading = false;
    });
    builder.addCase(markAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to mark as read";
    });
    builder.addCase(markAllAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markAllAsRead.fulfilled, (state)=>{
      state.list = state.list.map((n)=>({...n, isRead: true}));
      state.readCount = state.list.length;
      state.unreadCount = 0;
      state.loading = false;
    });
    builder.addCase(markAllAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to mark all as read";
    });
    builder.addCase(deleteNotification.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteNotification.fulfilled, (state, action)=>{
      const removed = state.list.find((n)=> n._id === action.payload);
      state.list = state.list.filter((n)=> n._id !== action.payload);

      if(removed){
        if(!removed.isRead){
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        if(removed.isRead){
          state.readCount = Math.max(0, state.readCount - 1);
        }
        if(removed.priority === "high"){
          state.highPriorityMessages = Math.max(0, state.highPriorityMessages - 1);
        }
      }
      state.loading = false;
    });
    builder.addCase(deleteNotification.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete notification";
    });
  },
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
