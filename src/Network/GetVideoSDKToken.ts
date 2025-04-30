// apiService.ts

import { store } from "../shared/redux/store";

export const getVideoSDKToken=async ()=>{
  const token = store.getState().root.user.token;
  const url='https://hhcnode.innotech-sa.com/api/videosdk/get-token';
 
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

// export const GetOnTheWayTasks = async (UserProfileId:any) => {
//   const token = store.getState().root.user.token;
//   const url='https://stghhcapis.innotech-sa.com/api/user/GetServiceProviderOnthewayTaskList';
//   

//   console.log('UserProfileId',UserProfileId)
//   const data={
//         "ServiceProviderUserLoginInfoId":UserProfileId
//      }
//   try {
//     const response = await fetch(url, {
//       method: 'POST', // or 'GET', 'PUT', 'DELETE' as needed
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`, // Add Bearer token to headers
//         // Add any additional headers if needed
//       },
//       body: JSON.stringify(data), // For POST or PUT requests
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error('Error making API call:', error);
//     throw error;
//   }
// };
