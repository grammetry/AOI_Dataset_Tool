import { configureStore } from "@reduxjs/toolkit";
import currentSelectedReducer from "./slice/currentSelected";


export const store =  configureStore({
  reducer: {
    currentSelected: currentSelectedReducer,
  },
});