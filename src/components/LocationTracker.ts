import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';

const { LocationModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(LocationModule);

class LocationService {
  private location = { latitude: null, longitude: null };
  private listeners: Array<(location: { latitude: number; longitude: number }) => void> = [];

  constructor() {
    this.subscribeToLocationUpdates();
  }

  // Function to request location permissions (iOS will automatically handle permissions)
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS permissions are automatically handled
    }
  }

  // Start tracking
  async startTracking(): Promise<void> {
    const hasPermission = await this.requestLocationPermission();
    if (hasPermission) {
      LocationModule.startTracking();
    } else {
      console.log('Location permission denied');
    }
  }

  // Stop tracking
  stopTracking(): void {
    LocationModule.stopTracking();
  }

  // Subscribe to location updates
  private subscribeToLocationUpdates(): void {
    eventEmitter.addListener('locationUpdate', (event: { latitude: number; longitude: number }) => {
      this.location = {
        latitude: event.latitude,
        longitude: event.longitude,
      };

      // Notify all listeners of the new location
      this.notifyListeners();
    });
  }

  // Get the current location
  getLocation(): { latitude: number | null; longitude: number | null } {
    return this.location;
  }

  // Register a listener for location updates
  onLocationUpdate(listener: (location: { latitude: number; longitude: number }) => void): void {
    this.listeners.push(listener);
  }

  // Notify all registered listeners of location updates
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.location));
  }
}

export default new LocationService();