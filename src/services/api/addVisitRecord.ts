import axiosInstance from '../axios/axiosConfig';

export const addVisitMain = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddVisitMain`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add visit main failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addEditVisitRecord = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientComplaint`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit visit record failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addEditVisitPatientHistory = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientHistory`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit visit patient history failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addEditVisitPatientVitalSigns = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientVitalSigns`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit visit patient vital signs failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getVisitPatientBodyAnatomy = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/GetVisitPatientBodyAnatomy`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get visit patient body anatomy failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const AddEditVisitPatientProceduresReferNotes = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientProceduresReferNotes`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit patient body anatomy failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const addEditVisitPatientLabXRay = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientLabXRay`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit visit patient lab x ray failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getAllFileTypes = async () => {
    try {
        const response = await axiosInstance.get(
            `catalogue/GetAllFileType`
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get all file types failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const deleteVisitPatientLabXRay = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/DeleteLabFile`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Delete visit patient lab x ray failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getOrderListAddedByServiceProvider = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/GetOrderListAddedByServiceProvider`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get order list added by service provider failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getAllDiagnosisSpecialty = async () => {
    try {
        const response = await axiosInstance.get(
            `visitRecord/GetAllDiagnosisSpecialty`
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get all diagnosis specialty failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getAllIcd10Codes = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/GetICD10CodeDiagnosis`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get all icd 10 codes failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};
export const addEditVisitPatientDiagnosis = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/AddEditVisitPatientDiagnosis`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Add edit visit patient diagnosis failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getOrderDetailAddedByServiceProvider = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `visitRecord/GetOrderDetailAddedByServiceProvider`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get order detail added by service provider failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};


// Export all appointment related functions
export const addVisitRecordService = {
    addVisitMain,
    addEditVisitRecord,
    addEditVisitPatientHistory,
    addEditVisitPatientVitalSigns,
    getVisitPatientBodyAnatomy,
    AddEditVisitPatientProceduresReferNotes,
    addEditVisitPatientLabXRay,
    getAllFileTypes,
    deleteVisitPatientLabXRay,
    getOrderListAddedByServiceProvider,
    getAllDiagnosisSpecialty,
    getAllIcd10Codes,
    addEditVisitPatientDiagnosis,
    getOrderDetailAddedByServiceProvider,
}; 