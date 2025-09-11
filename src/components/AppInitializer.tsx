import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform, Alert, BackHandler, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setMediaToken } from '../shared/redux/reducers/userReducer';
import { isTokenExpired } from '../shared/services/service';
import { crashlyticsService } from '../shared/services/crashlytics/crashlytics.service';
import useMutationHook from '../Network/useMutationHook';
import { MediaBaseURL } from '../shared/utils/constants';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const [appState, setAppState] = useState(AppState.currentState);
  const { expiresAt, appVersionCode } = useSelector((state: any) => state.root.user);

  // API hooks
  const { mutate, isSuccess, isError, data } = useMutationHook(
    '/authValidator/token',
    'POST',
    true,
  );

  const {
    mutate: getVersionCodeFN,
    isSuccess: isSuccessVersionCode,
    isError: isErrorVersionCode,
    data: DataVersionCode,
  } = useMutationHook('utilities/GetGeneralSetting', 'POST');

  // App state monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (appState === 'active') {
      AppversionAPICall();
    }
  }, [appState]);

  // Version check functions
  const AppversionAPICall = () => {
    getVersionCodeFN({
      GroupId: 14,
      Title: Platform.OS === 'android' ? 'Android App Version-Patient' : 'IOS App Version-Patient',
    });
  };

  const compareVersions = (version1: string, version2: string) => {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  };

  const RedirectURL = () => {
    const url = Platform.OS === 'android'
      ? 'https://play.google.com/store/apps/details?id=com.naraakum_patient'
      : 'https://apps.apple.com/pk/app/naraakum-%D9%86%D8%B1%D8%B9%D8%A7%D9%83%D9%85/id6738125287';
    Linking.openURL(url);
  };

  const versionCompareFunction = () => {
    const versionCode = DataVersionCode as any;
    if (versionCode?.ResponseStatus?.STATUSCODE === '200') {
      const comparisonResult = compareVersions(
        versionCode.AppVersion,
        appVersionCode,
      );
      if (comparisonResult > 0) {
        Alert.alert(
          'يوجد تحديث',
          'فضلاً حدث للإصدار الأخير',
          [{ text: 'OK', onPress: () => RedirectURL() }],
        );
      }
    }
  };

  // Token management
  const GetTokenForAPI = () => {
    if (isTokenExpired(expiresAt)) {
      mutate({
        grant_type: '7a6b79797d65786e',
        apikey: '333b394f3c3f4c3d27484b3e4c273e3f383d27323d393c274f394f383c3a3e4e4f493b3b',
        platformId: '3b',
      });
    } else {
      AppversionAPICall();
    }
  };

  const getMediaToken = async () => {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('apikey', '15F79088-0CE7-4274-9725-EB48CF58AD56');
      params.append('platformId', '1');

      const response = await fetch(`${MediaBaseURL}/authValidator/GetToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (data.status == '200') {
        dispatch(setMediaToken({
          token: data.access_token,
          expiresAt: data.expires,
        }));
      }
    } catch (error) {
      console.error('Error getting media token:', error);
    }
  };

  // Back handler
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to close the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Initial setup
  useEffect(() => {
    crashlyticsService.logMessage('App initializing');
    GetTokenForAPI();
    getMediaToken();
  }, []);

  // Handle API responses
  useEffect(() => {
    if (isSuccess && data) {
      const sessionToken = {
        token: (data as any).access_token,
        expiresAt: (data as any).expires,
      };
      
      dispatch(setToken(sessionToken));
      setTimeout(AppversionAPICall, 100);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isSuccessVersionCode) {
      versionCompareFunction();
    }
  }, [isSuccessVersionCode]);

  return null;
};

export default AppInitializer; 