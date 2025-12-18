import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../../shared/redux/store';
import { BaseURL } from '../../shared/utils/constants';
import { tokenRefreshService } from './tokenRefreshService';

// Create base axios instance
const axiosInstance = axios.create({
    baseURL: BaseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Set the axios instance in token refresh service for proper retry handling
tokenRefreshService.setAxiosInstance(axiosInstance);

// Request interceptor for adding bearer token
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = store.getState().root.user.token;
        const user = store.getState().root.user.user;
        
        // Check if Authorization header is required (default: true)
        const authRequired = (config.headers as any)?.['Authorization-Required'] !== false;
        
        if (token && config.headers && authRequired) {
            config.headers.Authorization = `Bearer ${token}`;
            
            // Add additional headers if user exists
            if (user) {
                config.headers.Claim = user.Claim;
                config.headers.CatUserRoleId = user.CatUserRoleId;
                config.headers.UserloginInfoId = user.Id;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors and token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Handle timeout error
        if (error.code === 'ECONNABORTED') {
            return Promise.reject({ 
                message: 'Request timed out. Please check your internet connection.' 
            });
        }
        
        // Handle network error
        if (!error.response) {
            return Promise.reject({ 
                message: 'Network Error. Please check your internet connection.' 
            });
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response.status === 401) {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
            
            // Skip token refresh for token refresh endpoint itself to prevent infinite loop
            if (originalRequest.url?.includes('authValidator/token')) {
                return Promise.reject({
                    message: 'Token refresh failed. Please login again.',
                    status: 401
                });
            }

            // Skip token refresh if Authorization is not required
            if ((originalRequest.headers as any)?.['Authorization-Required'] === false) {
                return Promise.reject({
                    message: 'Unauthorized access.',
                    status: 401
                });
            }

            try {
                // Use token refresh service to handle 401 and retry, passing the axios instance
                return await tokenRefreshService.handle401Error(error, axiosInstance);
            } catch (refreshError: any) {
                // Token refresh failed
                return Promise.reject({
                    message: refreshError?.message || 'Token refresh failed. Please login again.',
                    status: 401
                });
            }
        }

        // Handle other error status codes
        if (error.response) {
            switch (error.response.status) {
                case 403:
                    return Promise.reject({
                        message: 'Access forbidden.',
                        status: 403
                    });
                default:
                    return Promise.reject({
                        message: (error.response.data as any)?.message || 'An error occurred.',
                        status: error.response.status
                    });
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance; 