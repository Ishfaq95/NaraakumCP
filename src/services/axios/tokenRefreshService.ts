import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from 'axios';
import { store } from '../../shared/redux/store';
import { setToken } from '../../shared/redux/reducers/userReducer';
import { BaseURL } from '../../shared/utils/constants';
import qs from 'qs';

// Token refresh configuration
const TOKEN_REFRESH_CONFIG = {
    grant_type: '7a6b79797d65786e',
    apikey: '333b394f3c3f4c3d27484b3e4c273e3f383d27323d393c274f394f383c3a3e4e4f493b3b',
    platformId: '3b',
};

// Request queue to store failed requests
interface QueuedRequest {
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
    axiosInstance: AxiosInstance;
}

class TokenRefreshService {
    private isRefreshing = false;
    private failedQueue: QueuedRequest[] = [];
    private refreshPromise: Promise<string> | null = null;
    private axiosInstance: AxiosInstance | null = null;

    /**
     * Set the axios instance to use for retrying requests
     */
    setAxiosInstance(instance: AxiosInstance) {
        this.axiosInstance = instance;
    }

    /**
     * Refresh the authentication token
     */
    private async refreshToken(): Promise<string> {
        try {
            // Use form-urlencoded format for token refresh (matching the existing implementation)
            const formattedData = qs.stringify(TOKEN_REFRESH_CONFIG);

            const response = await axios.post(`${BaseURL}authValidator/token`, formattedData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization-Required': false, // Don't require auth for token refresh
                },
            });

            if (response.data && response.data.access_token) {
                const newToken = response.data.access_token;
                const expiresAt = response.data.expires;

                // Update token in Redux store
                store.dispatch(setToken({
                    token: newToken,
                    expiresAt: expiresAt,
                }));

                return newToken;
            } else {
                throw new Error('Invalid token response');
            }
        } catch (error: any) {
            // If token refresh fails, clear the queue and reject all requests
            this.processQueue(null, error);
            throw error;
        }
    }

    /**
     * Process all queued requests with new token or reject them
     */
    private processQueue(token: string | null, error: any = null) {
        const queue = [...this.failedQueue]; // Copy queue to avoid issues during iteration
        this.failedQueue = []; // Clear the queue first

        queue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else if (token) {
                // Update the request config with new token
                if (prom.config.headers) {
                    prom.config.headers.Authorization = `Bearer ${token}`;
                    
                    // Also update user headers if they exist
                    const user = store.getState().root.user.user;
                    if (user) {
                        prom.config.headers.Claim = user.Claim;
                        prom.config.headers.CatUserRoleId = user.CatUserRoleId;
                        prom.config.headers.UserloginInfoId = user.Id;
                    }
                }
                
                // Retry the request with updated config using the same axios instance that made the original request
                prom.axiosInstance.request(prom.config)
                    .then((response) => prom.resolve(response))
                    .catch((err) => prom.reject(err));
            }
        });
    }

    /**
     * Add a failed request to the queue
     */
    private addToQueue(config: AxiosRequestConfig, axiosInstance: AxiosInstance): Promise<any> {
        return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config, axiosInstance });
        });
    }

    /**
     * Handle 401 error by refreshing token and retrying requests
     */
    async handle401Error(error: AxiosError, axiosInstance?: AxiosInstance): Promise<any> {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const instanceToUse = axiosInstance || this.axiosInstance || axios;

        // Prevent infinite loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // If we're already refreshing, add this request to the queue
        if (this.isRefreshing) {
            return this.addToQueue(originalRequest, instanceToUse as AxiosInstance);
        }

        // Mark that we're refreshing
        this.isRefreshing = true;
        originalRequest._retry = true;

        try {
            // Refresh the token
            if (!this.refreshPromise) {
                this.refreshPromise = this.refreshToken();
            }

            const newToken = await this.refreshPromise;

            // Process all queued requests with the new token
            this.processQueue(newToken);

            // Update the original request with new token
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                // Also update user headers if they exist
                const user = store.getState().root.user.user;
                if (user) {
                    originalRequest.headers.Claim = user.Claim;
                    originalRequest.headers.CatUserRoleId = user.CatUserRoleId;
                    originalRequest.headers.UserloginInfoId = user.Id;
                }
            }

            // Retry the original request using the same axios instance
            this.isRefreshing = false;
            this.refreshPromise = null;
            return instanceToUse.request(originalRequest);
        } catch (refreshError) {
            // Token refresh failed
            this.isRefreshing = false;
            this.refreshPromise = null;
            this.processQueue(null, refreshError);
            return Promise.reject(refreshError);
        }
    }

    /**
     * Reset the service (useful for logout)
     */
    reset() {
        this.isRefreshing = false;
        this.failedQueue = [];
        this.refreshPromise = null;
    }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();

