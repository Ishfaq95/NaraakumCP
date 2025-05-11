// apiService.ts

import { store } from "../shared/redux/store";
import { BaseURL } from "../shared/utils/constants";
export const getVideoSDKToken=async ()=>{
  const token = store.getState().root.user.token;
  const url=`${BaseURL}videosdk/get-token`;
 
  try {
    const response = await fetch(url, {
      method: 'GET', // or 'GET', 'PUT', 'DELETE' as needed
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add Bearer token to headers
        // Add any additional headers if needed
      },
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
}
