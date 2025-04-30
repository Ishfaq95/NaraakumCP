import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Linking,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {WebView} from 'react-native-webview';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import messaging from '@react-native-firebase/messaging';
import {useDispatch, useSelector} from 'react-redux';
import {setTopic, setUserInfo} from '../shared/redux/reducers/userReducer';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import WebSocketService from './WebSocketService';
import {getLocationPermission} from './LocationService';
import useMutationHook from '../Network/useMutationHook';
import PushNotification from 'react-native-push-notification';
import {ROUTES} from '../shared/utils/routes';
import {useNavigation} from '@react-navigation/native';
const WebViewComponent = ({uri}: any) => {
  const dispatch = useDispatch();
  const {topic, userinfo} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(uri);
  const [userInformation, setUserInformation] = useState('');
  const [callConnected, setCallConnected] = useState(false);
  const [reloadWebView, setReloadWebView] = useState(false);
  const [latestUrl, setLatestUrl] = useState('');
  const webViewRef = useRef(null);
  const webSocketService = WebSocketService.getInstance();
  const navigation = useNavigation();
  const sleep = (timeout: number) =>
    new Promise<void>(resolve => setTimeout(resolve, timeout));

  const {
    mutate: getSystemNotificationFN,
    isSuccess: isSuccessSystemNotification,
    isError: isErrorSystemNotifiction,
    data: SystemNotificationList,
    isLoading: isLoadingSystemNotification,
  } = useMutationHook('reminders/GetSystemReminderList', 'POST');

  useEffect(() => {
    if (isSuccessSystemNotification) {
      PushNotification.cancelAllLocalNotifications();
      scheduleNotification(SystemNotificationList?.ReminderList);
    }
    if (isErrorSystemNotifiction) {
    }
  }, [isSuccessSystemNotification, isErrorSystemNotifiction]);

  const scheduleNotification = (notificationList: any) => {
    notificationList.map((item: any, index: any) => {
      const data = item;
      // Convert UTC date string to local Date object
      const localDate = new Date(data.ReminderDate); // Date object auto-adjusts to local timezone

      // Optional: skip past dates
      if (localDate <= new Date()) {
        console.log(`Skipping past notification with id: ${data.Id}`);
        return;
      }

      const reminderObj = {
        ...item,
        notificationFrom: 'reminder',
      };

      PushNotification.localNotificationSchedule({
        id: data.Id,
        title: data.Subject,
        message: data.NotificationBody,
        date: localDate,
        // date: new Date(Date.now() + 60 * 1000),
        playSound: true,
        soundName: 'default',
        userInfo: reminderObj,
        allowWhileIdle: true, // important for background
      });
    });

    // PushNotification.getScheduledLocalNotifications(notifs => {
    //   console.log('Currently Scheduled Notifications:', notifs.length);
    // });
  };

  useEffect(() => {
    if (userinfo) {
      getSystemNotificationFN({
        UserloginInfo: userinfo.id,
      });
    }
  }, [userinfo]);

  useEffect(() => {
    if (userinfo) {
      const presence = 1;
      const communicationKey = userinfo.communicationKey;
      const UserId = userinfo.id;
      webSocketService.connect(presence, communicationKey, UserId);
    } else {
      webSocketService.disconnect();
    }
  }, [userinfo, userInformation]);

  const subsribeTopic = (Id: any) => {
    const topicName = `serviceprovider_${Id}`;
    if (topic) {
      if (topic != topicName) {
        messaging()
          .unsubscribeFromTopic(topic)
          .then(() => {});

        dispatch(setTopic(topicName));

        messaging()
          .subscribeToTopic(topicName)
          .then(() => {});
      }
    } else {
      dispatch(setTopic(topicName));
      messaging()
        .subscribeToTopic(topicName)
        .then(() => {});
    }
  };

  const INJECTED_JAVASCRIPT = `
  (function() {
    function logToReactNative(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ log: message }));
    }

    // Function to send token and user info to React Native app
    function sendTokenAndUserInfoToReactNativeApp() {
      var token = NK.Common.webAPIAccessToken;
      var userInfo = NK.Common.getLoggedInUser();
      var data = { token: token };
      if (userInfo) {
        data.userInfo = userInfo;
      }
       window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }

    // Overwrite window.open to send the full URL and query params to React Native app
    window.open = function(url) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ url: url}));
    };

    // Call the function to send token and user info immediately
    sendTokenAndUserInfoToReactNativeApp();
  })();
  true;
`;
  const getFileNameFromUrl = (url: any) => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    return parts.pop();
  };

  const handleMessage = async (event: any) => {
    const {
      url,
      event: eventHandler,
      data,
      fileName,
    } = JSON.parse(event.nativeEvent.data);

    if (eventHandler == 'logout') {
      dispatch(setUserInfo(null));
      webSocketService.disconnect();
    }

    console.log('eventHandler', eventHandler);
    if (eventHandler == 'joinMeeting') {
      navigation.navigate(ROUTES.preViewCall, {Data: data});
    } else if (eventHandler == 'download') {
      let isPermissionGrandted = await getStoragePermission();
      if (isPermissionGrandted) {
        setLoading(true);
        let pdfUrl = data;
        let fileName = getFileNameFromUrl(pdfUrl);
        if (Platform.OS === 'ios') {
          downloadFIleForIOS(pdfUrl, fileName);
        } else {
          downloadFile(pdfUrl, fileName);
        }
      } else {
        showAlert(
          'Allow Media Access.',
          'Allow media access to download the file.',
        );
      }

      return;
    } else if (eventHandler == 'downloadFromBase64') {
      let isPermissionGrandted = await getStoragePermission();
      if (isPermissionGrandted) {
        setLoading(true);
        downloadPDFFromBase64(data, fileName);
      } else {
        showAlert(
          'Allow Media Access.',
          'Allow media access to download the file.',
        );
      }
    } else if (eventHandler == 'userLoggedIn') {
      const userInfo = data;
      setUserInformation(userInfo);
      subsribeTopic(userInfo.id);
      dispatch(setUserInfo(userInfo));
      // getReminderListFromApi()
    }

    // if (url && url.includes('OnlineSessionRoom')) {
    //   // let urlComplete = `https://staging.innotech-sa.com${url}`;
    //   let urlComplete = `https://dvx.innotech-sa.com${url}`;
    //   // let urlComplete = `https://nkapps.innotech-sa.com${url}`;

    //   // let urlComplete = `https://naraakum.com${url}`;

    //   const redirectUrl = getDeepLink();

    //   try {
    //     if (await InAppBrowser.isAvailable()) {
    //       // const result = await InAppBrowser.open(urlComplete, {
    //       //   showTitle: true,
    //       //   toolbarColor: '#6200EE',
    //       //   enableDefaultShare: true,
    //       //   animations: {
    //       //     startEnter: 'slide_in_right',
    //       //     startExit: 'slide_out_left',
    //       //     endEnter: 'slide_in_left',
    //       //     endExit: 'slide_out_right',
    //       //   },
    //       // });
    //       const result = await InAppBrowser.open(urlComplete, {
    //         forceCloseOnRedirection: false,
    //         showInRecents: true,
    //         showTitle: true,
    //         enableUrlBarHiding: true,
    //         enableDefaultShare: false,
    //         modalPresentationStyle: 'overFullScreen',

    //         ephemeralWebSession: false,
    //         enableBarCollapsing: true,
    //         modalEnabled: true,
    //       });
    //       await sleep(800);
    //       setCurrentUrl(latestUrl);
    //       setReloadWebView(true);
    //       setTimeout(() => {
    //         setReloadWebView(false);
    //       }, 100);
    //     }
    //   } catch (error) {
    //     Alert.alert('Error', 'Failed to open the in-app browser');
    //   }
    // }
  };

  const getDeepLink = (path = '') => {
    const scheme = 'naraakum-cp';
    const prefix =
      Platform.OS === 'android' ? `${scheme}://redirectCP/` : `${scheme}://`;
    return prefix + path;
  };

  const downloadFIleForIOS = (url: any, fileName: any) => {
    const {config, fs} = RNFetchBlob;
    const DocumentDir = fs.dirs.DocumentDir; // Use DocumentDir for iOS
    const filePath = `${DocumentDir}/${fileName}`; // Set the file path to DocumentDir for iOS

    // Use config to set the download path and file handling
    config({
      fileCache: true,
      path: filePath, // Use the correct file path
    })
      .fetch('GET', url)
      .then(res => {
        setLoading(false);
        Alert.alert(
          'File downloaded successfully',
          'The file is saved to your device.',
        );

        // Optional: Preview the document after downloading
        RNFetchBlob.ios.previewDocument(filePath); // Preview the downloaded document on iOS
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const downloadFile = (url: any, fileName: any) => {
    const {config, fs} = RNFetchBlob;
    const DownloadDir = fs.dirs.DownloadDir;
    // Create a path where the file will be saved
    const filePath = `${DownloadDir}/${fileName}`;

    // Use config to set the download path and mime type
    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: filePath,
      },
    })
      .fetch('GET', url)
      .then(res => {
        setLoading(false);
        Alert.alert('File downloaded successfully');
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const getUniqueFilePath = async (filePath: any) => {
    const extension = filePath.substring(filePath.lastIndexOf('.'));
    const fileNameWithoutExtension = filePath.substring(
      0,
      filePath.lastIndexOf('.'),
    );
    let uniqueFilePath = filePath;
    let counter = 1;

    while (await RNFetchBlob.fs.exists(uniqueFilePath)) {
      uniqueFilePath = `${fileNameWithoutExtension}(${counter})${extension}`;
      counter++;
    }

    return uniqueFilePath;
  };

  const downloadPDFFromBase64 = async (base64: string, fileName: any) => {
    const base64String = base64;
    const base64Data = base64String.split(',')[1]; // Remove data URL prefix if present
    let filePath = null;

    if (Platform.OS == 'ios') {
      filePath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}.pdf`;
    } else {
      filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
    }
    const uniqueFilePath = await getUniqueFilePath(filePath);

    RNFetchBlob.fs
      .writeFile(uniqueFilePath, base64Data, 'base64')
      .then(async () => {
        setLoading(false);
        Alert.alert('File downloaded successfully.');

        if (Platform.OS === 'ios') {
          RNFetchBlob.ios.previewDocument(uniqueFilePath);
        }
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const showAlert = (title: any, body: any) => {
    Alert.alert(title, body);
  };

  const getStoragePermission = async () => {
    if (Platform.OS === 'ios') {
      return requestiOSPermissions();
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      if (
        (granted['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_VIDEO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED) ||
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  const requestiOSPermissions = async () => {
    const photoLibraryPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    const mediaLibraryPermission = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);

    if (
      photoLibraryPermission === RESULTS.GRANTED &&
      mediaLibraryPermission === RESULTS.GRANTED
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleLoadError = (event: any) => {
    setLoading(false);
    Alert.alert('Something went wrong. Please try again.', '', [
      {text: 'OK', onPress: () => handleLoadStart()},
    ]);
  };

  const handleLoadStart = () => {
    setReloadWebView(true);
    setTimeout(() => {
      setReloadWebView(false);
    }, 100);
  };

  // const onNavigationStateChange = (url: any) => {
  //   console.log("isNonSocialMediaUrl(url.url)",isNonSocialMediaUrl(url.url))
  //   if (isNonSocialMediaUrl(url.url)) {
  //     setLatestUrl(url.url);
  //   } else {
  //     setLoading(false);
  //   }
  // };

  // const isNonSocialMediaUrl = (url: string): boolean => {

  //   const socialMediaDomains = [
  //     'youtube.com',
  //     'youtu.be',
  //     'x.com',
  //     'facebook.com',
  //     'twitter.com',
  //     'instagram.com',
  //     'tiktok.com',
  //     'linkedin.com',
  //     'snapchat.com',
  //     'pinterest.com',
  //     'reddit.com',
  //   ];

  //   const lowerCaseUrl = url.toLowerCase();
  //   console.log('lowerCaseUrl', lowerCaseUrl);
  //   if(lowerCaseUrl.includes('www.facebook.com') || lowerCaseUrl.includes('fb://') ) {
  //     Linking.openURL(lowerCaseUrl);
  //     return false;
  //   }else{
  //     const match = lowerCaseUrl.match(/https?:\/\/(www\.)?([^\/]+)/);
  //     const domain = match ? match[2] : null;
  //   // Check if the extracted domain matches any social media domain
  //     return !socialMediaDomains.some(socialDomain =>
  //       domain?.includes(socialDomain),
  //     );
  //   }

  // };

  const isNonSocialMediaUrl = (url: string): boolean => {
    const socialMediaDomains = [
      'youtube.com',
      'youtu.be',
      'x.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'linkedin.com',
      'snapchat.com',
      'pinterest.com',
      'reddit.com',
    ];

    const lowerCaseUrl = url.toLowerCase();

    // Comprehensive check for Facebook-related URLs
    const isFacebookUrl =
      lowerCaseUrl.includes('facebook.com') ||
      lowerCaseUrl.includes('fb.com') ||
      lowerCaseUrl.includes('fb://');

    if (isFacebookUrl) {
      // Attempt to open the URL outside the app
      Linking.canOpenURL(lowerCaseUrl).then(supported => {
        if (supported) {
          Linking.openURL(lowerCaseUrl).catch(err =>
            console.error('Error opening Facebook URL', err),
          );
        }
      });
      return false;
    }

    // Check other social media domains
    const match = lowerCaseUrl.match(/https?:\/\/(www\.)?([^\/]+)/);
    const domain = match ? match[2] : null;

    return !socialMediaDomains.some(socialDomain =>
      domain?.includes(socialDomain),
    );
  };

  const onNavigationStateChange = (navState: any) => {
    const {url} = navState;

    // Prevent navigation for Facebook URLs
    if (url.toLowerCase().includes('facebook.com')) {
      // Reset to previous URL to prevent WebView navigation
      setCurrentUrl(latestUrl);

      // Open in external browser
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url).catch(err =>
            console.error('Error opening Facebook URL', err),
          );
        }
      });

      return false;
    }

    // For non-Facebook social media URLs
    if (isNonSocialMediaUrl(url)) {
      setLatestUrl(url);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState == 'inactive') {
        setLoading(false);
      }
    };

    // Add event listener
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Clean up the event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {reloadWebView ? (
          <View style={styles.loader}>
            <LoaderKit
              style={{width: 100, height: 100}}
              name={'BallSpinFadeLoader'}
              color={'green'}
            />
          </View>
        ) : (
          <WebView
            source={{uri: currentUrl}}
            onShouldStartLoadWithRequest={request => {
              const {url} = request;

              // Prevent loading Facebook URLs in WebView
              if (url.toLowerCase().includes('facebook.com')) {
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url).catch(err =>
                      console.error('Error opening Facebook URL', err),
                    );
                  }
                });
                return false;
              }

              return true;
            }}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
            onLoadStart={() => {
              setLoading(true);
            }}
            onLoadEnd={() => {
              setLoading(false);
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            // originWhitelist={['*']}
            setSupportMultipleWindows={true}
            userAgent={
              Platform.OS === 'android'
                ? 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
                : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'
            }
            // originWhitelist={["https://*", "http://*", "file://*", "sms://*"]}
            originWhitelist={['*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
            onMessage={handleMessage}
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        )}
      </View>
      {loading && (
        <View style={styles.loader}>
          <LoaderKit
            style={{width: 100, height: 100}}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
});

export default WebViewComponent;
