import DeviceInfo from 'react-native-device-info';
import { Dimensions, Platform } from 'react-native';

/**
 * Check if the device is a tablet using react-native-device-info
 * This is the most accurate method as it checks the device model
 */
export const isTablet = (): boolean => {
  return DeviceInfo.isTablet();
};

/**
 * Alternative method: Check if device is tablet based on screen dimensions
 * This is a fallback method that works without device-info
 * Typically, tablets have width >= 600 (Android) or >= 768 (iOS)
 */
export const isTabletByDimensions = (): boolean => {
  const { width } = Dimensions.get('window');
  const isTabletSize = width >= (Platform.OS === 'ios' ? 768 : 600);
  return isTabletSize;
};

/**
 * Get device type (phone or tablet)
 */
export const getDeviceType = (): 'phone' | 'tablet' => {
  return isTablet() ? 'tablet' : 'phone';
};

