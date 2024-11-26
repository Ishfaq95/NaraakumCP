import WebViewComponent from '../components/WebViewComponent';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import useMutationHook from '../Network/useMutationHook';
import {useDispatch, useSelector} from 'react-redux';
import {setToken} from '../shared/redux/reducers/userReducer';
import {isTokenExpired} from '../shared/services/service';
import { store } from '../shared/redux/store';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {expiresAt,appVersionCode} = useSelector((state: any) => state.root.user);
  const [appState, setAppState] = useState(AppState.currentState);
  const {mutate, isSuccess, isError, data, isLoading} = useMutationHook(
    '/authValidator/token',
    'POST',
    true,
  );

  const {mutate:getVersionCodeFN, isSuccess:isSuccessVersionCode, isError:isErrorVersionCode, data:DataVersionCode, isLoading:isLoadingVersionCode} = useMutationHook(
    'utilities/GetGeneralSetting',
    'POST'
  );

  const GetTokenForAPI = () => {
    if (isTokenExpired(expiresAt)) {
      mutate({
        grant_type: '7a6b79797d65786e',
        apikey:
          '333b394f3c3f4c3d27484b3e4c273e3f383d27323d393c274f394f383c3a3e4e4f493b3b',
        platformId: '3b',
      });
    }else{
      AppversionAPICall()
    }
  };

  useEffect(()=>{
    if(appState=="active"){
      AppversionAPICall()
    }
  },[appState])
  
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            setAppState(nextAppState);
        };

        // Add event listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Clean up the event listener on unmount
        return () => {
            subscription.remove();
        };
    }, []);

    const AppversionAPICall=()=>{
      if(Platform.OS=='android'){
        getVersionCodeFN( {
          "GroupId": 14,
          "Title":"Android App Version-CP"
         })
       
      }else if(Platform.OS=='ios'){
        getVersionCodeFN({
          "GroupId": 14,
          "Title":"IOS App Version - Patient"
         })
      }
    }

  const compareVersions = (version1:any, version2:any) => {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
  
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0; // Default to 0 if undefined
      const num2 = v2[i] || 0;
  
      if (num1 > num2) return 1; // version1 is greater
      if (num1 < num2) return -1; // version2 is greater
    }
  
    return 0; // Both versions are equal
  };

  const RedirectURL=()=>{
    if(Platform.OS=="android"){
      Linking.openURL("https://play.google.com/store/apps/details?id=com.naraakum_cp")
    }else if(Platform.OS=='ios'){
      Linking.openURL("https://apps.apple.com/pk/app/naraakum-provider/id6738122851")
    }
  }

  const versionCompareFunction=()=>{
    const versionCode = DataVersionCode;
    const isApiSuccess=versionCode?.ResponseStatus?.STATUSCODE
    console.log('DataVersionCode',DataVersionCode?.AppVersion)
    if(isApiSuccess=="200"){
      const comparisonResult = compareVersions(DataVersionCode?.AppVersion, appVersionCode);
      if (comparisonResult > 0) {
        Alert.alert(
          "Update available", // Title
          "Please update to the latest version", // Message
          [
            { text: "OK", onPress: () => RedirectURL() } // Explicit OK button
          ]
        );
      }
    }
  }

  useEffect(() => {
    if (isSuccessVersionCode) {
      versionCompareFunction()
    }
    if (isErrorVersionCode) {
      console.log('version code error');
    }
  }, [isSuccessVersionCode, isErrorVersionCode]);

  useEffect(() => {
    GetTokenForAPI();
    requestCameraAndAudioPermission();
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to close the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const tokenData = JSON.stringify(data);
      console.log('tokenData', tokenData);
      const sessionToken = {
        token: data.access_token,
        expiresAt: data.expires,
      };
      dispatch(setToken(sessionToken));
      setTimeout(() => {
        AppversionAPICall()
      }, 100);
    }
    if (isError) {
      console.log('getting token error');
    }
  }, [isSuccess, isError]);

  async function requestCameraAndAudioPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);

      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_MEDIA_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the camera and mic');
      } else {
        console.log('Camera or mic permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <WebViewComponent uri="https://staging.innotech-sa.com/naraakum/Web/Web/Index" /> */}
      {/* <WebViewComponent uri="https://dvx.innotech-sa.com/HHC/web/Web/Index" /> */}
      <WebViewComponent uri="https://nkapps.innotech-sa.com/" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
