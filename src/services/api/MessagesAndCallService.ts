import axiosInstance from "../axios/axiosConfig";

export const getMessagesList = async (params: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            'chat/Getmessages',
            params
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Failed to fetch messages',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getVideoSDKToken = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('videosdk/get-token');
        return response.data;
    } catch (error: any) {
    }
};

export const getConversationList = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('chat/GetConversationBycareprovider', payload);
        return response.data;
    } catch (error: any) {
    }
};

export const messagesAndCallService = {
    getMessagesList,
    getVideoSDKToken,
    getConversationList
}; 