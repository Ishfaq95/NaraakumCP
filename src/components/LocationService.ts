import { PermissionsAndroid, Platform } from "react-native";

export const getLocationPermission=async ()=>{
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      ]);
       
      if (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      } else {
        return false;
      } 
    }
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
}
