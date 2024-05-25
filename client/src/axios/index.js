import axios from 'axios';
import { refreshToken as refreshTokenAction } from '../action/user';

const API_URL = `http://localhost:5000/api`;
// const API_URL = `${location.origin}/api`;
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерсептор для добавления токенов в каждый запрос
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Интерсептор для обработки ошибок и обновления токена
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(error)
        if (error.response.status === 401 && error.response.config.url !== "/refresh") {
            refreshTokenAction()
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;