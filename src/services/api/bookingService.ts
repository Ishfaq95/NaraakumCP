import axiosInstance from '../axios/axiosConfig';

export const categoriesList = [
    { Id: 10, Name: "Nursing Visit", Display: "HP", CatLinkingTypeId: "3", CatCategoryTypeId: "3" }, //New Request --payment received
    { Id: 32, Name: "Doctor Visit", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId: "2" },
    //{ Id: 33, Name: "Telemedicine", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId:"2"},
    { Id: 34, Name: "Physiotherapy", Display: "CP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 35, Name: "Laboratory Analysis", Display: "HP", CatLinkingTypeId: "3", CatCategoryTypeId: "1" },
    { Id: 36, Name: "Caregiver", Display: "CP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 41, Name: "Home dialysis", NameSLang: "غسيل الكلي المنزلي", Display: "HP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 42, Name: "Remote Consultation", NameSLang: "استشارة عن بعد ", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId: "4" },
]

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

export const getServiceProviderListByServiceByIds = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `offeredServices/GetServiceProviderListByServiceByIds`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting service provider list by service by ids:', error);
        throw error;
    }
};

export const getServiceProviderSchedulingAvailability = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProviderSchedulingAvailability`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting service provider scheduling availability:', error);
        throw error;
    }
};

export const getHospitalListByServices = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `offeredServices/GetHospitalListByServices`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting hospital list by services:', error);
        throw error;
    }
};

export const getOrganizationSchedulingAvailability = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetOrganizationSchedulingAvailability`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.error('Error getting organization scheduling availability:', error);
        throw error;
    }
};

export const getUserSavedAddresses = async (payload: any): Promise<any> => {
    
    try {
        const response = await axiosInstance.post('user/GetUserLocations', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

export const createOrderMainBeforePayment = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('/payment/CreateOrderMainBeforePayment', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error creating order main before payment:', error);
        throw error;
    }
};

// Export all my clients related functions
export const bookingService = {
    getOfferedServicesCategories,
    getOfferedServicesListByCategory,
    getAllSpecialties,
    getServiceProviderListByServiceByIds,
    getServiceProviderSchedulingAvailability,
    getHospitalListByServices,
    getOrganizationSchedulingAvailability,
    getUserSavedAddresses,
    createOrderMainBeforePayment,
}; 