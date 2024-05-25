import axiosInstance from '../axios';
import { setUser } from '../reducers/userReducer';

// export const registration = async (email, password) => {
//     try {
//         const response = await axiosInstance.post('/registration', {
//             email,
//             password
//         });
//         // alert(response.data.message);
//         alert(response.data.message);
//     } catch (e) {
//         console.error(e);
//         alert(e.response.data.message);
//     }
// };

export const registration = async (email, password) => {
    try {
        const response = await axiosInstance.post('/registration', {
            email,
            password
        });
        // alert(response.data.message);
        alert("Пользователь зарегистрирован");
        window.location.href = '/login';  // Перенаправление на страницу логина
    } catch (e) {
        console.error(e);
        alert(e.response.data.message);
    }
};

export const login = (email, password) => {
    return async dispatch => {
        try {
            const response = await axiosInstance.post('/login', {
                email,
                password
            });
            console.log("Ответ сервера при авторизации:", response.data);
            console.log("login", response.data)
            dispatch(setUser(response.data.user));
            localStorage.setItem('token', response.data.accessToken);
    
            console.log(localStorage.getItem('token')); // Вывод значения accessToken из localStorage
            console.error(e);
            alert(e.response.data.message);
        }catch(e){

        }
    }
}

export const refreshToken = async () => {
    try {
        
        const response = await axiosInstance.get('/refresh');
        localStorage.setItem('token', response.data.accessToken);
        
        return response.data.accessToken;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const auth = () => {
    return async dispatch => {
        console.log(dispatch)
        try {
            const response = await axiosInstance.get('/auth')
            console.log(response)

            if(response?.status === 200){
                console.log(response.data)
                dispatch(setUser(response.data));
            }
        } catch (e) {
            console.error(e);
            alert(e.response.data.message);
            
        }
    }
}
