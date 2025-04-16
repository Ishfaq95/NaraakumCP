// apiService.ts

import { store } from "../shared/redux/store";

export const GetOnTheWayTasks = async (UserProfileId:any) => {
  const token = store.getState().root.user.token;
  const url='https://hhcnode.innotech-sa.com/api/user/GetServiceProviderOnthewayTaskList'
  // const url='https://nk-pro-apis.innotech-sa.com/api/user/GetServiceProviderOnthewayTaskList';
  // const url='https://stghhcapis.innotech-sa.com/api/user/GetServiceProviderOnthewayTaskList';
  
  // const UserProfileId=store.getState().root.user.userinfo.Id;

  console.log('UserProfileId',UserProfileId)
  const data={
        "ServiceProviderUserLoginInfoId":UserProfileId
     }
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'GET', 'PUT', 'DELETE' as needed
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add Bearer token to headers
        // Add any additional headers if needed
      },
      body: JSON.stringify(data), // For POST or PUT requests
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