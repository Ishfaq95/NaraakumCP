import { Alert, AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import PushNotification from 'react-native-push-notification';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {

    // Extract notification data
    const { title, body }:any = remoteMessage.notification;

    // Display the notification
    PushNotification.localNotification({
        channelId: "channel-id", // Channel ID for the notification
        title: title,
        message: body,
    });
});

const NotificationsCenter = () => {
    useEffect(() => {
        PushNotification.configure({
            onNotification: function (notification) {
                // process the notification
            },
            popInitialNotification: true,
            requestPermissions: true,
        });

        // Handle the app opening from a background state
     messaging().onNotificationOpenedApp(remoteMessage => {
        // Handle the notification data
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

            let notificationData = JSON.stringify(remoteMessage)
            let parsedData = JSON.parse(notificationData);

            let title = parsedData.notification.title;
            let body = parsedData.notification.body;

            Alert.alert(title, body);
        });

        return unsubscribe;
    }, []);

    return null;
};

export default NotificationsCenter;
