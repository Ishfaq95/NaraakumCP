import {PermissionsAndroid, Platform, AppState} from 'react-native';
// import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';
import BackgroundTimer from 'react-native-background-timer';
import Geolocation from 'react-native-geolocation-service';
// import BackgroundFetch from 'react-native-background-fetch';
import {GetOnTheWayTasks} from '../Network/GetOnTheWayAPI';
// const WEBSOCKET_URL = 'wss://nodedev01.innotech-sa.com:6223/';
// const WEBSOCKET_URL = 'wss://nodedev01.innotech-sa.com:8112/';
const WEBSOCKET_URL = 'wss://nk-pro-presense.innotech-sa.com:8202/';
import LocationService from './LocationTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ContinousBaseGesture} from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture';
import BackgroundGeolocation from 'react-native-background-geolocation';

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private locationInterval: number | null = null;
  private appState: string = AppState.currentState;
  private locationUpdateInfo = {};
  private watchId: number | null = null;
  private taskList: any[] = [];
  private userId: any = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async connect(
    presence: number,
    communicationKey: string,
    userId: any,
  ): Promise<void> {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      const deviceId = await this.getDeviceId();
      const url = `${WEBSOCKET_URL}connectionMode=${presence}&deviceId=${deviceId}&communicationKey=${communicationKey}`;
      console.log('url', url);
      this.socket = new WebSocket(url);
      this.userId = userId;
      this.socket.onopen = async () => {
        this.isConnected = true;
        await this.handleOnTheWayTasks(); // Check tasks initially after connection
      };

      this.socket.onmessage = async event => {
        const socketEvent = JSON.parse(event.data);

        if (socketEvent.Command === 67 || socketEvent.Command === 68) {
          await this.handleOnTheWayTasks(); // Call API and handle tracking on Command 67 or 68
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;

        setTimeout(async () => {
          const persistedState = await AsyncStorage.getItem('persist:root');
          if (persistedState) {
            const parsedState = JSON.parse(persistedState);
            const rootState = JSON.parse(parsedState.user);
            const {CommunicationKey, Id} = rootState.userinfo;
            this.connect(presence, communicationKey, Id);
          }
        }, 5000); // Attempt to reconnect
      };

      this.socket.onerror = error => {
        console.error('WebSocket error:', error.message);
      };
    }
  }

  private async handleOnTheWayTasks(): Promise<void> {
    this.taskList = [];
    try {
      if (this.userId) {
        const result = await GetOnTheWayTasks(this.userId);

        if (result.ResponseStatus.STATUSCODE == 200) {
          this.taskList = result.Tasks || []; // Save the result to taskList
        } else {
          this.taskList = []; // Save the result to taskList
        }

        if (this.taskList.length > 0) {
          this.startLocationUpdates();
        } else {
          this.stopLocationUpdates();
        }
      }
    } catch (error) {
      console.error('Error fetching on the way tasks:', error);
    }
  }

  private async getDeviceId() {
    const id = await DeviceInfo.getUniqueId();
    return id;
  }

  private handleAppStateChange(nextAppState: string) {
    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground');
      // this.connect(); // Reconnect if needed
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background');
    }
    this.appState = nextAppState;
  }

  public async getLocationAndSend(): Promise<void> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return;
      }
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Request background location permission if needed
        const bggranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'We need access to your location in the background.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (bggranted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('permission not granted');
          return;
        }
      } else {
      }

      console.log('i am here for location');

      // Start tracking
      LocationService.startTracking();

      // Register a listener for location updates
      LocationService.onLocationUpdate(location => {
        console.log('location==>', location);
        const {latitude, longitude} = location;
        this.sendLocation(latitude, longitude);
      });
    } else {
      console.log('i am here for location');
      BackgroundGeolocation.start(() => {
        console.log('- Tracking started');
      });

      BackgroundGeolocation.onLocation(
        location => {
          
          const {latitude, longitude} = location.coords;
          this.sendLocation(latitude, longitude);
          // Handle location updates
        },
        error => {
          console.error('[location] ERROR -', error);
        },
      );

      BackgroundGeolocation.onActivityChange(activity => {
        console.log('[activitychange] - ', activity);
        // Handle activity change if needed
      });
    }
  }

  private sendLocation(latitude: number, longitude: number): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const locationData = JSON.stringify({latitude, longitude});
      const UserId = this.taskList[0].ServiceProviderUserLoginInfoId;

      let data = {
        ConnectionMode: 1,
        Command: 66,
        Message: locationData,
        latlong: this.taskList,
        FromUser: {Id: UserId},
      };

      console.log('data==>', data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.log('WebSocket is not connected');
    }
  }

  public startLocationUpdates(): void {
    this.getLocationAndSend();
  }

  private stopLocationUpdates(): void {
    if (Platform.OS === 'android') {
      LocationService.stopTracking();
    } else {
      BackgroundGeolocation.stop(() => {
        console.log('- Tracking stopped');
      });
    }

    if (this.locationInterval) {
      BackgroundTimer.clearInterval(this.locationInterval);
      this.locationInterval = null;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId); // Stop watching the location
      Geolocation.stopObserving();
      this.watchId = null; // Clear the watchId reference
      console.log('Location updates stopped.');
    }
  }

  public disconnect(): void {
    this.stopLocationUpdates();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService;
