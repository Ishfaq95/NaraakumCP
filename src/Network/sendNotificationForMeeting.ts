import {BaseURL} from '../shared/utils/constants';
import {store} from '../shared/redux/store';

export const SendNotificationForMeeting = async (ReciverId: any, data: any) => {
  const token = store.getState().root.user.token;
  const url = `${BaseURL}chat/FCMtojoinMeeting`;

  const dataObj = {
    ReciverId: ReciverId,
    data: data,
  };
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'GET', 'PUT', 'DELETE' as needed
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Add Bearer token to headers
        // Add any additional headers if needed
      },
      body: JSON.stringify(dataObj), // For POST or PUT requests
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
};
