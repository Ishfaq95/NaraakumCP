// Path: src/components/LocationService.ts
import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';

const { LocationModule } = NativeModules;
const eventEmitter = Platform.OS === 'android' && LocationModule ? new NativeEventEmitter(LocationModule) : null as unknown as NativeEventEmitter;

type NullableLocation = { latitude: number | null; longitude: number | null };

type Location = { latitude: number; longitude: number };

class LocationService {
  private location: NullableLocation = { latitude: null, longitude: null };
  private listeners: Array<(location: NullableLocation) => void> = [];

  constructor() {
    this.subscribeToLocationUpdates();
  }

  // Function to request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
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
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  // Start tracking
  async startTracking(): Promise<void> {
    const hasPermission = await this.requestLocationPermission();
    if (hasPermission && Platform.OS === 'android' && LocationModule) {
      LocationModule.startTracking();
    } else {
      // no-op on iOS (module not implemented)
    }
  }

  // Stop tracking
  stopTracking(): void {
    if (Platform.OS === 'android' && LocationModule) {
      LocationModule.stopTracking();
    }
  }

  // Subscribe to location updates
  private subscribeToLocationUpdates(): void {
    if (eventEmitter) {
      eventEmitter.addListener('locationUpdate', (event: Location) => {
        this.location = {
          latitude: event.latitude,
          longitude: event.longitude,
        };

        // Notify all listeners of the new location
        this.notifyListeners();
      });
    }
  }

  // Get the current location
  getLocation(): NullableLocation {
    return this.location;
  }

  // Register a listener for location updates
  onLocationUpdate(listener: (location: NullableLocation) => void): void {
    this.listeners.push(listener);
  }

  // Notify all registered listeners of location updates
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.location));
  }
}

export default new LocationService();