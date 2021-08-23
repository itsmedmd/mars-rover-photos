import { createSlice } from "@reduxjs/toolkit";

export const imageDataSlice = createSlice({
  name: "image-data",
  initialState: {
    images: [],
  },
  reducers: {
    setImages: (state, action) => [...state.images, action.payload],
  },
});

export const { setImages } = imageDataSlice.actions;
export default imageDataSlice.reducer;
