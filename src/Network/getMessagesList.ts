// apiService.ts
import axios from 'axios';
import { store } from "../shared/redux/store";
import { BaseURL } from '../shared/utils/constants';

export const getMessagesList = async (payload: object) => {
  const token = store.getState().root.user.token;
  const url = `${BaseURL}chat/Getmessages`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error making API call:', error);
    // Optional: You can throw the actual response error for further handling
  }
}
