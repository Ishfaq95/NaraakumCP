import axiosInstance from '../axios/axiosConfig';

export const getClientsByServiceProvider = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetClientsByServiceProvider`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get clients by service provider failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProvidersFeedback = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProvidersFeedback`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service providers feedback failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

// Export all my clients related functions
export const myClientsService = {
    getClientsByServiceProvider,
    getServiceProvidersFeedback,
}; 