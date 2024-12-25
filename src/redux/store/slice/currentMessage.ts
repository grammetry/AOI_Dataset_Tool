import { createSlice } from "@reduxjs/toolkit";
import { set } from "lodash";

interface InitialState {
    message: string;
    show: boolean;
    currentTaoModelName: string;
    currentTaoModelId: string;
    currentExportId: string;
    currentTab: string;
    currentTaoEvaluateId:string;
    currentTaoInferenceId:string;
    currentTaoExportId:string;
}

const init: InitialState = {
    message: '',
    show: false,
    currentTaoModelName: '',
    currentTaoModelId: '',
    currentExportId: '',
    currentTab: 'current',
    currentTaoEvaluateId:'',
    currentTaoInferenceId:'',
    currentTaoExportId:'',
}

export const currentMessage = createSlice({
    name: "currentMessage",
    initialState: init,
    reducers: {
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setShow: (state, action) => {
            state.show = action.payload;
        },
        setCurrentTaoModelName: (state, action) => {
            state.currentTaoModelName = action.payload;   
        },
        setCurrentTaoModelId: (state, action) => {
            state.currentTaoModelId = action.payload;   
        },
        setCurrentExportId: (state, action) => {
            state.currentExportId = action.payload;
        },
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload;
        },
        setCurrentTaoEvaluateId: (state, action) => {
            state.currentTaoEvaluateId = action.payload;   
        },
        setCurrentTaoInferenceId: (state, action) => {
            state.currentTaoInferenceId = action.payload;   
        },
        setCurrentTaoExportId: (state, action) => {
            state.currentTaoExportId = action.payload;   
        },
    },
});

export const selectCurrentMessage = (state: { currentMessage: { message: string ,show:boolean, currentTaoModelId:string,currentTaoEvaluateId:string,currentTaoInferenceId:string,currentTaoExportId:string} }) => state.currentMessage;

export const { setMessage,setShow,setCurrentTaoModelId,setCurrentTaoModelName,setCurrentExportId,setCurrentTab,setCurrentTaoEvaluateId,setCurrentTaoInferenceId,setCurrentTaoExportId } = currentMessage.actions;  // 輸出action

export default currentMessage.reducer;