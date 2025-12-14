import axiosInstance from '../axios/axiosConfig';

export const getAllCities = async () => {
    try {
        const response = await axiosInstance.get(
            `catalogue/GetAllCities`,
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting all cities:', error);
        throw error;
    }
};

export const getSquareByCityId = async (payload: any) => {
    try {
        const response = await axiosInstance.post(`catalogue/GetSquareByCity`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting square by city id:', error);
        throw error;
    }
};

// Export all my clients related functions
export const commonAPIService = {
    getAllCities,
    getSquareByCityId
}; 