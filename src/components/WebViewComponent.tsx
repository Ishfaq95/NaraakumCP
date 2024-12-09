import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Platform, PermissionsAndroid } from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import { WebView } from 'react-native-webview';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import messaging from '@react-native-firebase/messaging';
import { useDispatch, useSelector } from 'react-redux';
import { setTopic, setUserInfo } from '../shared/redux/reducers/userReducer';
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
      const communicationKey = userinfo.CommunicationKey; 
      const UserId=userinfo.Id;
      webSocketService.connect(presence, communicationKey,UserId);
    }else{
      webSocketService.disconnect()
    }
  },[userinfo])

  const subsribeTopic = (Id: any) => {
    const topicName = `serviceprovider_${Id}`;
    if (topic) {
      if (topic != topicName) {
        messaging()
          .unsubscribeFromTopic(topic)
          .then(() => { })

        dispatch(setTopic(topicName))

        messaging()
          .subscribeToTopic(topicName)
          .then(() => { });
      }
    } else {
      dispatch(setTopic(topicName))
      messaging()
        .subscribeToTopic(topicName)
        .then(() => { });
    }
  }

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
      if (token) {
        logToReactNative('Sending token and user info');
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
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
  const getFileNameFromUrl = (url:any) => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    return parts.pop();
  };

  const handleMessage = async (event:any) => {
    const { url, userInfo, event: eventHandler,data,fileName,status } = JSON.parse(event.nativeEvent.data);

    if(eventHandler=='logout'){
      dispatch(setUserInfo(null))
      webSocketService.disconnect()
    }
    
    if (eventHandler == 'download') {
      
      let isPermissionGrandted = await getStoragePermission()
      if (isPermissionGrandted) {
        setLoading(true)
        let pdfUrl = data;
        let fileName = getFileNameFromUrl(pdfUrl)

        downloadFile(pdfUrl, fileName);

      } else {
        showAlert("Allow Media Access.", "Allow media access to download the file.")
      }

      return;
    }else if (eventHandler == 'downloadFromBase64') {
      let isPermissionGrandted = await getStoragePermission()
      if (isPermissionGrandted) {
        setLoading(true)
        downloadPDFFromBase64(data,fileName)

      } else {
        showAlert("Allow Media Access.", "Allow media access to download the file.")
      }
    }else if(eventHandler== 'statusChange'){
      
    }

    if (userInfo) {
      dispatch(setUserInfo(userInfo))
      setUserInformation(userInfo)
      subsribeTopic(userInfo.Id)
    }

    if (url && url.includes('OnlineSessionRoom')) {
      setCallConnected(true)
      // let urlComplete = `https://dvx.innotech-sa.com${url}`;
      // let urlComplete = `https://staging.innotech-sa.com${url}`;
      // let urlComplete = `https://nkapps.innotech-sa.com${url}`;
      let urlComplete = `https://naraakum.com${url}`;
      const redirectUrl = getDeepLink();
      try {
        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.openAuth(urlComplete, redirectUrl, {
            forceCloseOnRedirection: false,
            showInRecents: true,
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          });
          await sleep(800);
          setCurrentUrl(latestUrl)
          setReloadWebView(true)
          setTimeout(()=>{
            setReloadWebView(false)
          },100)
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

  const downloadFile = (url:any, fileName:any) => {
    const { config, fs } = RNFetchBlob;
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
        setLoading(false)
        Alert.alert('File downloaded successfully')
      })
      .catch(error => {
        setLoading(false)
        Alert.alert('File downloading error.')
      });
  };

  const getUniqueFilePath = async (filePath:any) => {
    const extension = filePath.substring(filePath.lastIndexOf('.'));
    const fileNameWithoutExtension = filePath.substring(0, filePath.lastIndexOf('.'));
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
    // const filePath = `${RNFetchBlob.fs.dirs.DocumentDir}/downloaded.pdf`;
    const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
    const uniqueFilePath = await getUniqueFilePath(filePath);

    RNFetchBlob.fs.writeFile(uniqueFilePath, base64Data, 'base64')
      .then(async () => {
        setLoading(false)
        Alert.alert('File downloaded successfully.')
        // await FileViewer.open(filePath);
      })
      .catch((error) => {
        setLoading(false)
        Alert.alert('File downloading error.')
      });
  };

  const showAlert = (title: any, body: any) => {
    Alert.alert(
      title,
      body,
    );
  };

  const getStoragePermission = async () => {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    ]);
    
    if (
      (granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED)
    ) {
      return true
    } else {
      return false
    }
  }

  const handleLoadError = (event:any) => {
    setLoading(false)
  };

  const onNavigationStateChange=(event:any)=>{
    const url = event.url;
    setLatestUrl(url)
  }

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {
        reloadWebView?
        <View style={styles.loader}>
          <LoaderKit
            style={{ width: 100, height: 100 }}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View> :
        <WebView
          source={{ uri: currentUrl }}
          useWebKit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          cacheEnabled={true}
          cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
          onLoadStart={() => {
            setLoading(true);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          thirdPartyCookiesEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          // originWhitelist={['*']}
          geolocationEnabled={true}
          javaScriptEnabledAndroid={true}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={handleMessage}
          onError={handleLoadError}
          setSupportMultipleWindows={true}
          userAgent={Platform.OS === 'android' ? 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'}
          // userAgent={Platform.OS === 'android' ? 'Chrome/18.0.1025.133 Mobile Safari/535.19' : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'}
          originWhitelist={["https://*", "http://*", "file://*", "sms://*"]}
          onNavigationStateChange={onNavigationStateChange}
          style={styles.webview}
        />
        }
      </View>
      {loading && (
        <View style={styles.loader}>
          <LoaderKit
            style={{ width: 100, height: 100 }}
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