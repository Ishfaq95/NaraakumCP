import axiosInstance from '../axios/axiosConfig';

export const getNotificationsList = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetSystemNotification`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get notifications list failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const notificationsService = {
    getNotificationsList,
}