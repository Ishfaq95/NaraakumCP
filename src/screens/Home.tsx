import WebViewComponent from '../components/WebViewComponent';
import React, {useEffect} from 'react';
import {
  Alert,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import useMutationHook from '../Network/useMutationHook';
import {useDispatch, useSelector} from 'react-redux';
import {setToken} from '../shared/redux/reducers/userReducer';
import {isTokenExpired} from '../shared/services/service';
import { store } from '../shared/redux/store';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {expiresAt} = useSelector((state: any) => state.root.user);
  const {mutate, isSuccess, isError, data, isLoading} = useMutationHook(
    '/authValidator/token',
    'POST',
    true,
  );

  const GetTokenForAPI = () => {
    if (isTokenExpired(expiresAt)) {
      mutate({
        grant_type: '7a6b79797d65786e',
        apikey:
          '333b394f3c3f4c3d27484b3e4c273e3f383d27323d393c274f394f383c3a3e4e4f493b3b',
        platformId: '3b',
      });
    }
  };
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
      <WebViewComponent uri="https://dev2.innotech-sa.com/HHC/web/Web/Index" />
      {/* <WebViewComponent uri="https://nkapps.innotech-sa.com/" /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
