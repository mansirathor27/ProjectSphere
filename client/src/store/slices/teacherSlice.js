import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherDashboardStats",
   async (_, thunkAPI) =>{
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch dashboard stats")
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
   async (supervisorId, thunkAPI) =>{
    try {
      const res = await axiosInstance.get(`/teacher/requests?supervisor=${supervisorId}`);
      return res.data.data?.requests || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch requests")
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);

export const acceptRequest = createAsyncThunk(
  "acceptRequest",
   async (requestId, thunkAPI) =>{
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/accept`);
      toast.success(res.data.message || "Request accepted successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to accept requests")
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);

export const rejectRequest = createAsyncThunk(
  "rejectRequest",
   async (requestId, thunkAPI) =>{
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/reject`);
      toast.success(res.data.message || "Request rejected successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject requests")
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);

export const markComplete = createAsyncThunk(
  "markComplete",
   async (projectId, thunkAPI) =>{
    try {
      const res = await axiosInstance.post(`/teacher/mark-complete/${projectId}`);
      toast.success(res.data.message || "Marked completed");
      return {projectId};
    } catch (error) {
      toast.error(error.response.data.message || "Failed to mark complete")
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);

export const downloadTeacherFile = createAsyncThunk(
  "downloadTeacherFile",
  async ({ projectId, fileId, fileName }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ correct blob type
      const blob = new Blob([res.data], {
        type: res.data.type,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName); // 🔥 FIX

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Download failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);


export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) =>{
    try {
      const res = await axiosInstance.get(`/teacher/files`);
      return res.data?.data?.files || res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch teacher files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
)

export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload
      );

      toast.success(res.data.message || "Feedback posted");

      return {
        projectId,
        feedback:
          res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to post feedback"
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
);
export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
   async (_, thunkAPI) =>{
    try {
      const res = await axiosInstance.get(
        `/teacher/assigned-students`
      );
      
      return res.data.data?.students || res.data.data || res.data
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch assigned students");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
   }
);


const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },

  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssignedStudents.pending, (state)=>{
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action)=>{
      state.loading = false; 
      state.assignedStudents = action.payload?.students || action.payload || [];
    });
    builder.addCase(getAssignedStudents.rejected, (state, action)=>{
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });

    builder.addCase(addFeedback.pending, (state) => { state.loading = true; });
    builder.addCase(addFeedback.fulfilled, (state, action)=>{
      const {projectId, feedback} = action.payload;
      state.assignedStudents = state.assignedStudents.map((s)=>
      s.project?._id === projectId || s.project?.id === projectId ? {...s, feedback} : s);
      state.loading = false;
    });
    builder.addCase(addFeedback.rejected, (state) => { state.loading = false; });

    builder.addCase(markComplete.pending, (state) => { state.loading = true; });
    builder.addCase(markComplete.fulfilled, (state, action)=>{
      const {projectId} = action.payload;
      state.assignedStudents = state.assignedStudents.map((s)=>{
        if(s.project?._id == projectId || s.project?.id == projectId){
          return {
            ...s,
            project: {
              ...s.project,
              status: "completed",
            },
          };
        }
        return s;
      });
      state.loading = false;
    });
    builder.addCase(markComplete.rejected, (state) => { state.loading = false; });

    builder.addCase(getTeacherDashboardStats.pending, (state) => { state.loading = true; });
    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action)=>{
      state.dashboardStats = action.payload;
      state.loading = false;
    });
    builder.addCase(getTeacherDashboardStats.rejected, (state) => { state.loading = false; });

    builder.addCase(getFiles.pending, (state) => { state.loading = true; });
    builder.addCase(getFiles.fulfilled, (state, action)=>{
      state.files = action.payload?.files || action.payload || [];
      state.loading = false;
    });
    builder.addCase(getFiles.rejected, (state) => { state.loading = false; });

    builder.addCase(getTeacherRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTeacherRequests.fulfilled, (state, action)=>{
      state.list = action.payload?.requests || action.payload;
      state.loading = false;
    });
    builder.addCase(getTeacherRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch requests";
    });

    builder.addCase(acceptRequest.pending, (state) => { state.loading = true; });
    builder.addCase(acceptRequest.fulfilled, (state, action)=>{
      const updatedRequest = action.payload;
      state.list = state.list.map((r)=> 
        r._id === updatedRequest._id ? updatedRequest : r
      );
      state.loading = false;
    });
    builder.addCase(acceptRequest.rejected, (state) => { state.loading = false; });

    builder.addCase(rejectRequest.pending, (state) => { state.loading = true; });
    builder.addCase(rejectRequest.fulfilled, (state, action)=>{
      const rejectedRequest = action.payload;
      state.list = state.list.filter((r)=> 
        r._id !== rejectedRequest._id
      );
      state.loading = false;
    });
    builder.addCase(rejectRequest.rejected, (state) => { state.loading = false; });

    builder.addCase(downloadTeacherFile.pending, (state) => { state.loading = true; });
    builder.addCase(downloadTeacherFile.fulfilled, (state) => { state.loading = false; });
    builder.addCase(downloadTeacherFile.rejected, (state) => { state.loading = false; });
  },
});

export default teacherSlice.reducer;
