import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { store } from '../shared/redux/store';
import { BaseURL } from '../shared/utils/constants';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BaseURL, // Replace with your API base URL
  timeout: 10000, // Optional: specify timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Check if the request should include an Authorization header
    if (config.headers && config.headers['Authorization-Required'] !== false) {
      
      const token = store.getState().root.user.token; // Replace with your token retrieval logic
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Do something with request error
    console.log('Error==>',error)
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Any status codes that fall outside the range of 2xx cause this function to trigger

    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, logout user, etc.
      console.error('Unauthorized access - perhaps redirect to login?');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;