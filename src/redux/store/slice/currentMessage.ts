import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
    message: string;
    show: boolean;
}

const init: InitialState = {
    message: '',
    show: false
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
    },
});



export const selectCurrentMessage = (state: { currentMessage: { message: string ,show:boolean} }) => state.currentMessage;

export const { setMessage,setShow } = currentMessage.actions;  // 輸出action

export default currentMessage.reducer;