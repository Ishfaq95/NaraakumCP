import {Alert, AppRegistry, PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../shared/utils/routes';
import notifee, {
  AndroidImportance,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { getCurrentScreen } from '../utils/navigationUtils';
 
const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'com.naraakm.naraakumCP',
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

const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default', // 👈 Always use same ID
    name: 'Default Channel',
    sound: 'default', // optional
    importance: AndroidImportance.HIGH,
  });
};
 
const NotificationsCenter = () => {
  const navigation = useNavigation();

  useEffect(() => {
    createNotificationChannel();
    requestPermissions();
    setupForegroundHandler();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Notification permission:', permission);
    }
  };

  const setupForegroundHandler = () => {
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DELIVERED:
          if (detail?.notification?.data?.notificationFrom == 'reminder') {
            handleNavigationFromNotification(detail?.notification?.data);
          }
          break;
        case EventType.PRESS:
          if (detail?.notification?.data?.notificationFrom == 'reminder') {
            handleNavigationFromNotification(detail?.notification?.data);
          }
          break;
      }
    });
    return () => unsubscribe();
  };

  
 
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
        console.log('notification===>', notification);
        try {
          const data = notification?.data; // No need to stringify
 
          if (!data) {
            return;
          }

          const currentScreen = getCurrentScreen(navigation);
 
          // Ensure handleNavigationFromNotification is called with correct data
          if (data?.notificationFrom == 'reminder') {
            handleNavigationFromNotification(data);
          }else if(data?.notificationFrom == "JoinMeeting" && currentScreen != ROUTES.Meeting){
            navigation.navigate(ROUTES.preViewCall,{
              Data:data,
            })
          }
 
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        } catch (error) {}
      },
      popInitialNotification: true,
      requestPermissions: true,

      permissions:{
        alert:true,
        badge:true,
        sound:true
      }
    });
 
    // Handle the app opening from a background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('remoteMessage in open app', remoteMessage);
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
      console.log('remoteMessage', remoteMessage);

      const notificationFrom=parsedData?.data?.notificationFrom;
      const currentScreen = getCurrentScreen(navigation);

      if(notificationFrom == "JoinMeeting"){

        // navigation.navigate(ROUTES.preViewCall,{
        //   Data:parsedData?.data,
        // })
      }else{
        Alert.alert(title,body)
      }

      // if (Platform.OS === 'ios') {
      //   // This is the critical part that will show the notification banner
      //   PushNotificationIOS.addNotificationRequest({
      //     title: remoteMessage?.notification?.title,
      //     subtitle: '',
      //     body: remoteMessage?.notification?.body,
      //     userInfo: remoteMessage.data,
      //     repeats: false,
      //     threadId: 'thread-id',
      //     sound: 'default',
      //     badge: 1,
      //     repeatsComponent: {
      //       hour: false,
      //       minute: false,
      //       day: false,
      //       weekday: false,
      //       month: false,
      //       year: false,
      //     },
      //   });
      // } else {
      //   // Your existing Android code
      //   PushNotification.localNotification({
      //     channelId: 'com.naraakm.naraakumCP',
      //     title: remoteMessage.notification?.title,
      //     message: remoteMessage.notification?.body,
      //     playSound: true,
      //     soundName: 'default',
      //     data: remoteMessage.data,
      //   });
      // }
    });
 
    return unsubscribe;
  }, []);
 
  useEffect(() => {
    // Check if app was launched from a notification (when app was killed)
    PushNotification.popInitialNotification(notification => {
      if (notification) {
        if (notification?.data?.notificationFrom == 'reminder') {
          setTimeout(() => {
            handleNavigationFromNotification(notification.data);
          }, 1000);
        } else if(notification?.data?.notificationFrom == "JoinMeeting"){
          navigation.navigate(ROUTES.preViewCall,{
            Data:notification?.data,
          })
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