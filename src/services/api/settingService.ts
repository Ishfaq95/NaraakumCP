import axiosInstance from '../axios/axiosConfig';

export const getPromoCodeList = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `Organization/GetPromoCodeList`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get promo code list failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

// Export all my clients related functions
export const settingService = {
    getPromoCodeList,
}; 