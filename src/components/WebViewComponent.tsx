import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
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
import { getLocationPermission } from './LocationService';

const WebViewComponent = ({ uri }:any) => {
  const dispatch = useDispatch()
  const { topic,userinfo } = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(uri);
  const [userInformation, setUserInformation] = useState('')
  const [callConnected, setCallConnected] = useState(false)
  const [reloadWebView,setReloadWebView]=useState(false)
  const [latestUrl,setLatestUrl]=useState('')
  const webViewRef = useRef(null);
  const webSocketService = WebSocketService.getInstance();
  const sleep = (timeout: number) =>
    new Promise<void>(resolve => setTimeout(resolve, timeout));
  
  useEffect(()=>{
   
    if(userinfo){
      const presence = 1; 
      const communicationKey = userinfo.communicationKey; 
      const UserId=userinfo.id;
      webSocketService.connect(presence, communicationKey,UserId);
    }else{
      webSocketService.disconnect()
    }
  },[userinfo,userInformation])

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
    
    if(eventHandler=='logout'){
      dispatch(setUserInfo(null))
      webSocketService.disconnect()
    }
    if (eventHandler == 'download') {
      let isPermissionGrandted = await getStoragePermission();
      if (isPermissionGrandted) {
        setLoading(true);
        let pdfUrl = data;
        let fileName = getFileNameFromUrl(pdfUrl);
        if(Platform.OS === 'ios'){
          downloadFIleForIOS(pdfUrl, fileName);
        }else{
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

    if (url && url.includes('OnlineSessionRoom')) {
      // let urlComplete = `https://staging.innotech-sa.com${url}`;
      let urlComplete = `https://dvx.innotech-sa.com${url}`;
      // let urlComplete = `https://nkapps.innotech-sa.com${url}`;

      const redirectUrl = getDeepLink();

      console.log('urlCompleteurlComplete', urlComplete);
      try {
        if (await InAppBrowser.isAvailable()) {
          // const result = await InAppBrowser.open(urlComplete, {
          //   showTitle: true,
          //   toolbarColor: '#6200EE',
          //   enableDefaultShare: true,
          //   animations: {
          //     startEnter: 'slide_in_right',
          //     startExit: 'slide_out_left',
          //     endEnter: 'slide_in_left',
          //     endExit: 'slide_out_right',
          //   },
          // });
          const result = await InAppBrowser.open(urlComplete,  {
            forceCloseOnRedirection: false,
            showInRecents: true,
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            modalPresentationStyle:'overFullScreen',

            ephemeralWebSession: false,
            enableBarCollapsing: true,
            modalEnabled: true,
          });
          await sleep(800);
          setCurrentUrl(latestUrl);
          setReloadWebView(true);
          setTimeout(() => {
            setReloadWebView(false);
          }, 100);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open the in-app browser');
      }
    }
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
    const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
    const uniqueFilePath = await getUniqueFilePath(filePath);

    RNFetchBlob.fs
      .writeFile(uniqueFilePath, base64Data, 'base64')
      .then(async () => {
        setLoading(false);
        Alert.alert('File downloaded successfully.');
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
      console.log('All necessary permissions granted');
      return true;
    } else {
      console.log('Some permissions were denied');
      return false;
    }
  };

  const handleLoadError = (event: any) => {
    setLoading(false);
    Alert.alert('Something went wrong. Please try again.');
  };

  const onNavigationStateChange = (url: any) => {
    console.log('url.url==>', url.url);
    setLatestUrl(url.url);
  };

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
            userAgent={
              Platform.OS === 'android'
                ? 'Chrome/18.0.1025.133 Mobile Safari/535.19'
                : 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
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
