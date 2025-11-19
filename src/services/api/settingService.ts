import axiosInstance from '../axios/axiosConfig';

export const getPromoCodeList = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `Organization/GetPromoCodeList`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get promo code list failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const updateReminderSetting = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('reminders/AddUpdateUserReminderSetting', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating setting:', error);
        throw error;
    }
};

export const getReminderSetting = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('reminders/GetUserReminderSetting', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting reminder setting:', error);
        throw error;
    }
};

export const addPromoCode = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('organization/AddUpdatePromocode', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error adding promo code:', error);
        throw error;
    }
};

export const deletePromoCode = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('organization/DeletePromocode', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting promo code:', error);
        throw error;
    }
};

// Export all my clients related functions
export const settingService = {
    getPromoCodeList,
    updateReminderSetting,
    getReminderSetting,
    addPromoCode,
    deletePromoCode,
}; 