import { configureStore } from "@reduxjs/toolkit";
import pageLoadingReducer from "./reducers/pageLoadingSlice";
import imageDataReducer from "./reducers/imageDataSlice";

export default configureStore({
  reducer: {
    pageLoading: pageLoadingReducer,
    imageData: imageDataReducer,
  },
});
