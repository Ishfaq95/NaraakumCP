import axiosInstance from '../axios/axiosConfig';

export const getOfferedServicesCategories = async () => {
    try {
        const response = await axiosInstance.get(
            `offeredServices/GetOfferedServicesCategories`,
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting offered services categories:', error);
        throw error;
    }
};

export const getAllSpecialties = async () => {
    try {
        const response = await axiosInstance.get(
            `catalogue/GetAllSpecialties`,
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting all specialties:', error);
        throw error;
    }
};

export const getOfferedServicesListByCategory = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `offeredServices/GetOfferedServicesListByCategory`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting offered services list by category:', error);
        throw error;
    }
};

// Export all my clients related functions
export const bookingService = {
    getOfferedServicesCategories,
    getOfferedServicesListByCategory,
    getAllSpecialties,
}; 