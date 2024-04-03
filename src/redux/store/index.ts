import { configureStore } from "@reduxjs/toolkit";
import currentSelectedReducer from "./slice/currentSelected";
import currentDatasetReducer from "./slice/currentDataset";
import currentMessageReducer from "./slice/currentMessage";
import currentPathListReducer from "./slice/currentPathList";
import currentProgressReducer from "./slice/currentProgress";


export const store = configureStore({
    reducer: {
        currentSelected: currentSelectedReducer,
        currentDataset: currentDatasetReducer,
        currentMessage: currentMessageReducer,
        currentPathList: currentPathListReducer,
        currentProgress: currentProgressReducer,
    },
});