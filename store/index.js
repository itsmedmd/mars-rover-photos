import { configureStore } from "@reduxjs/toolkit";
import pageLoadingReducer from "./reducers/pageLoadingSlice";

export default configureStore({
  reducer: {
    pageLoading: pageLoadingReducer,
  },
});
