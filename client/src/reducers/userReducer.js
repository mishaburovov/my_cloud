const SET_USER = "SET_USER";
const LOGOUT = "LOGOUT";
const defaultState = {
    currentUser: {},
    isAuth: false,
    roles: []
}

export default function userReducer(state = defaultState, action) {
    switch (action.type) {               
        case SET_USER:
            console.log(action.payload)
            return {
                ...state,                                                        
                currentUser: action.payload,                           
                isAuth: true,
                // roles: action.payload.roles  
                roles: action.payload ? action.payload.roles : []                 
            }
        case LOGOUT:
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return {
                ...state,
                currentUser: {},
                isAuth: false,
                roles: []
            }
        default:
            return state;
    }
}                     

export const setUser = user => ({ type: SET_USER, payload: user });
export const logout = () => ({ type: LOGOUT });