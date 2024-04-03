import { createSlice } from "@reduxjs/toolkit";
import { PathListType} from '../../../page/type';

interface InitialState {
    pathListFirst: string[];
    pathListSecond: string[];
    pathListThird: string[];
    pathList: PathListType[];
}

const init: InitialState = {
    pathListFirst: [],
    pathListSecond: [],
    pathListThird: [],
    pathList: [],
}

export const currentPathList = createSlice({
    name: "currentPathList",
    initialState: init,
    reducers: {
        setPathListFirst: (state, action) => {
            state.pathListFirst = action.payload;
        },
        setPathListSecond: (state, action) => {
            state.pathListSecond = action.payload;
        },
        setPathListThird: (state, action) => {
            state.pathListThird = action.payload;
        },
        setPathList: (state, action) => {
            state.pathList = action.payload;
        },
        setAddPathList: (state, action) => {
            state.pathList = [...state.pathList,action.payload];
        },
        setPathListFirstEmpty: (state) => {
            state.pathListFirst = [];
        },
        setPathListSecondEmpty: (state) => {
            state.pathListSecond = [];
        },
        setPathListEmpty: (state) => {
            state.pathList = [];
        },
    },
});



export const selectCurrentPathList = (state: { currentPathList: { pathListFirst: string[] , pathListSecond: string[], pathListThird:string[], pathList:PathListType[]} }) => state.currentPathList;

export const { setPathListFirst,setPathListSecond,setPathListThird,setPathList,setAddPathList,setPathListEmpty, setPathListFirstEmpty, setPathListSecondEmpty } = currentPathList.actions;  // 輸出action

export default currentPathList.reducer;