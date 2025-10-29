import axiosInstance from '../axios/axiosConfig';

export const getServiceProviderByUserId = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProvidersByUserId`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider by user id failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderPreferences = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderPreferences`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider preferences failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const deleteServiceProviderPreference = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/DeleteServiceProviderPreference`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Delete service provider preference failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addUpdateServiceProviderPreference = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/AddUpdateServiceProviderPreferences`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Add service provider preference failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderPersonalProfileSummary = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderPersonalProfileSummary`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider personal profile summary failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderMedicalLicense = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderMedicalLicense`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider medical license failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};
// Export all profile related functions
export const profileService = {
    getServiceProviderByUserId,
    getServiceProviderPreferences,
    deleteServiceProviderPreference,
    addUpdateServiceProviderPreference,
    getServiceProviderPersonalProfileSummary,
    getServiceProviderMedicalLicense,
}; 