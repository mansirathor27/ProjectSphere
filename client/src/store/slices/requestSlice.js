import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "request",
  initialState: {
    list: [],
    selected: null,
  },
  reducers: {},
  extraReducers: () => {},
});

export default requestSlice.reducer;
