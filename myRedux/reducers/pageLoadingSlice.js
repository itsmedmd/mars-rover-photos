import { createSlice } from "@reduxjs/toolkit";

export const pageLoadingSlice = createSlice({
  name: "page-loading",
  initialState: {
    value: false,
  },
  reducers: {
    activate: (state) => {
      console.log("activating!");
      state.value = true;
    },
    deactivate: (state) => {
      console.log("DEactivating!");
      state.value = false;
    },
  },
});

export const { activate, deactivate } = pageLoadingSlice.actions;
export default pageLoadingSlice.reducer;
