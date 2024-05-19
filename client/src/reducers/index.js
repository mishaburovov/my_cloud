import {combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import fileReducer from "./fileReducer";
import uploadReducer from "./uploadReducer";
import appReducer from "./appReducer";


const rootReducer = combineReducers({
    user: userReducer,
    files: fileReducer,
    upload: uploadReducer,
    app: appReducer
})

export const store = configureStore({
    reducer: rootReducer, 
})