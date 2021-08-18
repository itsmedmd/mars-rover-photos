import { createSlice } from "@reduxjs/toolkit";

export const pageLoadingSlice = createSlice({
  name: "page-loading",
  initialState: {
    value: true,
  },
  reducers: {
    activate: (state) => ({
      ...state,
      value: true,
    }),
    deactivate: (state) => ({
      ...state,
      value: false,
    }),
  },
});

export const { activate, deactivate } = pageLoadingSlice.actions;
export default pageLoadingSlice.reducer;
