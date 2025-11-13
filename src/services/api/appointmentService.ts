import axiosInstance from '../axios/axiosConfig';

export const getServiceProviderMainSummary = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderMainSummary`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider main summary failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderUnAvailability = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderUnAvailability`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider unavailability failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getTaskbyServiceProviderId = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetTaskbyServiceProviderId`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get task by service provider id failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderCount = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderCount`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider count failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderSchedules = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderSchedules`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider schedules failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderDaySchedules = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderDaySchedules`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get service provider day schedules failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getTaskDetail = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetTaskDetail`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get task detail failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getVisitRecordList = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/GetVisitRecordList`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get visit record list failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getUserRatingForPatient = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetUserRatingForPatient`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Get user rating for patient failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addEditUserRating = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/AddEditUserRating`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Add user rating for patient failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const deleteUserRating = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/DeleteUserRating`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error',error)
        throw {
            message: error?.response?.data?.message || 'Delete user rating failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};
// Export all appointment related functions
export const appointmentService = {
    getServiceProviderMainSummary,
    getServiceProviderUnAvailability,
    getTaskbyServiceProviderId,
    getServiceProviderCount,
    getServiceProviderSchedules,
    getServiceProviderDaySchedules,
    getTaskDetail,
    getVisitRecordList,
    getUserRatingForPatient,
    addEditUserRating,
    deleteUserRating,
}; 