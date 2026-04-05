import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Fetch active announcements
export const getActiveAnnouncements = createAsyncThunk(
  "getActiveAnnouncements",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/announcements/active");
      return res.data.data.announcements;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// Broadcast an announcement (Admin)
export const broadcastAnnouncement = createAsyncThunk(
  "broadcastAnnouncement",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/announcements/broadcast", data);
      toast.success(res.data.message || "Announcement broadcasted!");
      return res.data.data.announcement;
    } catch (error) {
      toast.error(error.response?.data?.message || "Broadcast failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const announcementSlice = createSlice({
  name: "announcements",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getActiveAnnouncements.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getActiveAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(broadcastAnnouncement.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default announcementSlice.reducer;
