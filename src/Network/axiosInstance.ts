import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { store } from '../shared/redux/store';
import { BaseURL } from '../shared/utils/constants';
import { tokenRefreshService } from '../services/axios/tokenRefreshService';
import { getMediaToken } from '../components/AppInitializer';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BaseURL,
  timeout: 10000,
});

// Note: This instance shares the same token refresh service
// The token refresh service will handle retries for both instances

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Check if the request should include an Authorization header
    if (config.headers && config.headers['Authorization-Required'] !== false) {
      const token = store.getState().root.user.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
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
    if (error.response && error.response.status === 401) {
      getMediaToken();
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Skip token refresh for token refresh endpoint itself
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

    return Promise.reject(error);
  }
);

export default axiosInstance;