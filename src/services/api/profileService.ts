import { MediaBaseURL } from '../../shared/utils/constants';
import axiosInstance from '../axios/axiosConfig';
import { store } from '../../shared/redux/store';

export const getServiceProviderByUserId = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProvidersByUserId`,
            credentials
        );
        return response.data;
    } catch (error: any) {
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
        throw {
            message: error?.response?.data?.message || 'Get service provider personal profile summary failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderPaymentProfileSummary = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderPaymentProfileSummary`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service provider payment profile summary failed',
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
        throw {
            message: error?.response?.data?.message || 'Get service provider medical license failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getUserInfoByUserId = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetUserInfobyUserId`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get user info by user id failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getNationalities = async () => {
    try {
        const response = await axiosInstance.get(
            `patients/GetAllNationalities`,
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get nationalities failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderPaymentDetails = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderPaymentDetail`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service provider payment details failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getServiceProviderContractSigning = async (credentials: any) => {

    try {
        const response = await axiosInstance.post(
            `user/GetServiceProviderContract`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service provider contract signing failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const uploadFile = async (file: any, user: any) => {
    try {
      let url = `${MediaBaseURL}common/upload`;
      let ResourceCategoryId = '2';

      let fileType = file.name.split('.').pop();
      if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
      else if (
        fileType == 'jpg' ||
        fileType == 'jpeg' ||
        fileType == 'gif' ||
        fileType == 'png' ||
        fileType == 'JPG' ||
        fileType == 'JPEG' ||
        fileType == 'GIF' ||
        fileType == 'PNG'
      )
        ResourceCategoryId = '1';

      const formData = new FormData();
      // Create file object that matches backend expectations
      const fileData = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', fileData);
      formData.append('UserType', user.CatUserTypeId);
      formData.append('Id', user.Id);
      formData.append('ResourceCategory', ResourceCategoryId);
      formData.append('ResourceType', '6');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${store.getState().root.user.mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      return responseData;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  };

export const addServiceProviderContract = async (credentials: any) => {

    try {
        const response: any = await axiosInstance.post(
            `user/AddServiceProviderContract`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw new Error(error instanceof Error ? error.message : 'Add service provider contract failed');
    }
}

export const getServiceProviderRoleAndSpecialty = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProviderRoleandSpecialty`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw new Error(error instanceof Error ? error.message : 'Get service provider role and specialty failed');
    }
}

export const assignRoleAndSpecialty = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/AssignRoleSpecialtyToServiceProvider`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw new Error(error instanceof Error ? error.message : 'Assign role and specialty failed');
    }
}

export const getSpecialties = async () => {
    try {
        const response = await axiosInstance.get(
            `catalogue/GetAllSpecialties`,
        );
        return response.data;
    }
    catch (error: any) {
        throw new Error(error instanceof Error ? error.message : 'Get specialties failed');
    }
}

export const addUpdateServiceProviderMedicalLicense = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/AddServiceProviderMedicalLicense`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        console.log('error', error)
        throw {
            message: error?.response?.data?.message || 'Add/Update medical license failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
}

export const deleteServiceProviderMedicalLicense = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `user/DeleteMedicalLicense`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Delete medical license failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
}

export const getServiceProviderHolidays = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProviderHolidays`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service provider holidays failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
}

export const getServiceProviderAvailability = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `organization/GetServiceProviderAvailability`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Get service provider availability failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
}

export const updateServiceProviderPersonalProfile = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/UpdateRegisteredPatientProfile`,
            credentials
        );
        return response.data;
    }
    catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Update service provider personal profile failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
}

export const userUpdatedPhone = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/PhoneVerification', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating phone:', error);
        throw error;    
    }
};

export const verifyUserUpdatedData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/VerifyRegisteredUser', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error verifying user updated data:', error);
        throw error;    
    }
};

// Export all profile related functions
export const profileService = {
    getServiceProviderByUserId,
    getServiceProviderPreferences,
    deleteServiceProviderPreference,
    addUpdateServiceProviderPreference,
    getServiceProviderPersonalProfileSummary,
    getServiceProviderPaymentProfileSummary,
    getServiceProviderMedicalLicense,
    getUserInfoByUserId,
    getNationalities,
    getServiceProviderPaymentDetails,
    getServiceProviderContractSigning,
    uploadFile,
    addServiceProviderContract,
    getServiceProviderRoleAndSpecialty,
    assignRoleAndSpecialty,
    getSpecialties,
    addUpdateServiceProviderMedicalLicense,
    deleteServiceProviderMedicalLicense,
    getServiceProviderHolidays,
    getServiceProviderAvailability,
    updateServiceProviderPersonalProfile,
    userUpdatedPhone,
    verifyUserUpdatedData,
}; 