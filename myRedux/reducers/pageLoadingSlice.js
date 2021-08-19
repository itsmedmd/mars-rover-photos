import { createSlice } from "@reduxjs/toolkit";

export const pageLoadingSlice = createSlice({
  name: "page-loading",
  initialState: {
    value: 1,
  },
  reducers: {
    activate: (state) => {
      state.value += 1;
    },
    deactivate: (state) => {
      if (state.value > 0) {
        state.value -= 1;
      }
    },
  },
});

export const { activate, deactivate } = pageLoadingSlice.actions;
export default pageLoadingSlice.reducer;
