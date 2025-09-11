import axios from 'axios';
import { store } from '../../shared/redux/store';
import { BaseURL } from '../../shared/utils/constants';

// Create base axios instance
const axiosInstance = axios.create({
    baseURL: BaseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding bearer token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().root.user.token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.code === 'ECONNABORTED') {
            // Handle timeout error
            return Promise.reject({ 
                message: 'Request timed out. Please check your internet connection.' 
            });
        }
        
        if (!error.response) {
            // Network error
            return Promise.reject({ 
                message: 'Network Error. Please check your internet connection.' 
            });
        }

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized error
                    return Promise.reject({
                        message: 'Unauthorized access. Please login again.',
                        status: 401
                    });
                case 403:
                    // Handle forbidden error
                    return Promise.reject({
                        message: 'Access forbidden.',
                        status: 403
                    });
                default:
                    return Promise.reject({
                        message: error.response.data?.message || 'An error occurred.',
                        status: error.response.status
                    });
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 