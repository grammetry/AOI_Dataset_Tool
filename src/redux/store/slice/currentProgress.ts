import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
    progressMessage: string;
    progressPercent: number;
    progressShow: boolean;
}

const init: InitialState = {
    progressMessage: '',
    progressPercent: 0,
    progressShow: false,
}

export const currentProgress = createSlice({
    name: "currentProgress",
    initialState: init,
    reducers: {
        setProgressMessage: (state, action) => {
            state.progressMessage = action.payload;
        },
        setProgressShow: (state, action) => {
            state.progressShow = action.payload;
        },
        setProgressPercent: (state, action) => {
            state.progressPercent  = action.payload;
        },
    },
});



export const selectCurrentProgress = (state: { currentProgress: { progressMessage: string ,progressShow:boolean, progressPercent:number } }) => state.currentProgress;

export const { setProgressMessage,setProgressShow,setProgressPercent } = currentProgress.actions;  // 輸出action

export default currentProgress.reducer;