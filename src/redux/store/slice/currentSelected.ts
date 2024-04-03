import { createSlice } from "@reduxjs/toolkit";


interface InitialState {
    list: string[];
    area: number;
    somethingChange: boolean;
}

const init: InitialState = {
    list: [],
    area: 0,
    somethingChange:false,
}

export const currentSelected = createSlice({
    name: "currentSelected",
    initialState: init,
    reducers: {
        setSelectedList: (state, action) => {
            state.list = action.payload;
        },
        setAddList: (state, action) => {
            state.list.push(action.payload)
        },
        setToggleItem: (state, action) => {
            if (state.list.includes(action.payload)) {
                const filterArr = state.list.filter(e => e !== action.payload);
                state.list = filterArr;
            } else {
                state.list.push(action.payload);
            }
        },
        setClearList: (state) => {
            state.list = [];
        },
        setToggleArea: (state, action) => {
           
            state.area=action.payload;
            
        },
        setSomethingChange: (state,action) => {
            state.somethingChange = action.payload;
        },

    },
});



export const selectCurrentList = (state: { currentSelected: { list: string[], area: number ,somethingChange:boolean} }) => state.currentSelected;

export const { setSelectedList, setAddList, setToggleItem,setToggleArea,setClearList,setSomethingChange } = currentSelected.actions;  // 輸出action

export default currentSelected.reducer;