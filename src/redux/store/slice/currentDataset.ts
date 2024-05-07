import { createSlice } from "@reduxjs/toolkit";
import {PanelDatasetType,PanelTrainValType} from '../../../page/type';


interface InitialState {
    dataset: PanelDatasetType;
}

const init: InitialState = {
    dataset: {
        check:false,
        train:{
            PASS:[],
            NG:[],
            GOLDEN:[],
            DELETE:[]
        },
        val:{
            PASS:[],
            NG:[]
        }
    }
}

export const currentDataset = createSlice({
    name: "currentDataset",
    initialState: init,
    reducers: {
        setPanelDatasetThird: (state, action) => {
            state.dataset = action.payload;
        }, 
    },
});



export const selectCurrentDataset = (state: { currentDataset: { dataset: PanelDatasetType} }) => state.currentDataset;

export const { setPanelDatasetThird } = currentDataset.actions;  // 輸出action

export default currentDataset.reducer;