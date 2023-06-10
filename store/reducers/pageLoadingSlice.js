import { createSlice } from "@reduxjs/toolkit";

export const pageLoadingSlice = createSlice({
  name: "page-loading",
  initialState: {
    // This value is not true/false but an integer because multiple pages
    // of images might be loading at the same time - in that case the value
    // would be higher than 1
    value: 1,
  },
  reducers: {
    activate: (state) => {
      return {
        ...state,
        value: state.value + 1,
      };
    },
    deactivate: (state) => {
      return {
        ...state,
        value: state.value > 0 ? state.value - 1 : state.value,
      };
    },
  },
});

export const { activate, deactivate } = pageLoadingSlice.actions;
export default pageLoadingSlice.reducer;
