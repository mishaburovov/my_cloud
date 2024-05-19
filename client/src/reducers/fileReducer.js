const SET_FILES = "SET_FILES"
const SET_CURRENT_DIR = "SET_CURRENT_DIR"
const ADD_FILE = "ADD_FILE"
const SET_POPUP_DISPLAY = "SET_POPUP_DISPLAY"
const DELETE_FILE = 'DELETE_FILE';
const UPDATE_FILE = 'UPDATE_FILE';



const defaultState = {
    files: [],
    currentDir: null,
    popupDisplay: 'none',
  //  currentPath: [] 
}

export default function fileReducer(state = defaultState, action) {
    switch (action.type) {
        case SET_FILES: return {...state, files: action.payload}
        case SET_CURRENT_DIR: return {...state,
            currentDir: action.payload
           // currentPath: [...state.currentPath, action.payload]
            }
        case ADD_FILE: return {...state, files: [...state.files, action.payload]}
        case SET_POPUP_DISPLAY: return {...state, popupDisplay: action.payload}
        case DELETE_FILE: return {...state, files: [...state.files.filter(file => file._id != action.payload)]}
        case UPDATE_FILE: return { ...state, files: state.files.map((file) => file._id === action.payload._id ? action.payload : file), }

        default:
            return state
    }
}

export const setFiles = (files) => ({type: SET_FILES, payload: files})
export const setCurrentDir = (dir) => ({type: SET_CURRENT_DIR, payload: dir})
export const addFile = (file) => ({type: ADD_FILE, payload: file})
export const setPopupDisplay = (display) => ({type: SET_POPUP_DISPLAY, payload: display})
export const deleteFileAction = (fileId) => ({ type: DELETE_FILE, payload: fileId });
export const updateFile = (updatedFile) => ({ type: UPDATE_FILE, payload: updatedFile });
