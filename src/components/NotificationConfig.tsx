import {Alert, AppRegistry, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../shared/utils/routes';

const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'com.naraakm.naraakumPatient',
      channelName: 'Notifications',
      channelDescription: 'Notifications for naraakum Patient App',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    created => console.log(`Channel created: ${created}`),
  );
};

const NotificationsCenter = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // For iOS, we need to request permission to display notifications
    const requestUserPermission = async () => {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
        }
      }
    };

    requestUserPermission();

    if (Platform.OS === 'android') {
      createChannel();
    }
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        try {
          const data = notification?.data; // No need to stringify

          if (!data) {
            return;
          }

          // Ensure handleNavigationFromNotification is called with correct data
          if (data?.notificationFrom == 'reminder') {
            handleNavigationFromNotification(data);
          }

          notification.finish(PushNotificationIOS.FetchResult.NoData);
        } catch (error) {}
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Handle the app opening from a background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      // Handle the notification data
      if (Platform.OS === 'ios') {
        if (remoteMessage?.data?.notificationFrom == 'reminder') {
          handleNavigationFromNotification(remoteMessage.data);
        }
      }
    });

    // Handle the app opening from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // Handle the notification data
        }
      });

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      let notificationData = JSON.stringify(remoteMessage);
      let parsedData = JSON.parse(notificationData);
      let title = parsedData.notification?.title;
      let body = parsedData.notification?.body;
      console.log('remoteMessage', parsedData);
      Alert.alert(title, body);
      if (Platform.OS === 'ios') {
        // This is the critical part that will show the notification banner
        // PushNotificationIOS.addNotificationRequest({
        //   title: parsedData?.notification?.title,
        //   subtitle: '',
        //   body: parsedData?.notification?.body,
        //   userInfo: parsedData.data,
        //   repeats: false,
        //   threadId: 'thread-id',
        //   sound: 'default',
        //   badge: 1,
        //   repeatsComponent: {
        //     hour: false,
        //     minute: false,
        //     day: false,
        //     weekday: false,
        //     month: false,
        //     year: false,
        //   },
        // });
      } else {
        // Your existing Android code
        // PushNotification.localNotification({
        //   channelId: 'com.naraakm.naraakumPatient',
        //   title: parsedData.notification?.title,
        //   message: parsedData.notification?.body,
        //   playSound: true,
        //   soundName: 'default',
        //   data: parsedData.data,
        // });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Check if app was launched from a notification (when app was killed)
    PushNotification.popInitialNotification(notification => {
      if (notification) {
        console.log('notification?.data', notification);
        if (notification?.data?.notificationFrom == 'reminder') {
          setTimeout(() => {
            handleNavigationFromNotification(notification.data);
          }, 1000);
        }
      }
    });
  }, []);

  const handleNavigationFromNotification = data => {
    if (data) {
      navigation.navigate(ROUTES.AlarmScreen, {data: data});
    }
  };

  return null;
};

export default NotificationsCenter;
