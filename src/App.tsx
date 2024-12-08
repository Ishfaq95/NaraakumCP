import { NavigationContainer } from '@react-navigation/native';
import { persistor, store } from './shared/redux/store';
import { navigationRef } from './shared/services/nav.service';
import React, { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import messaging from '@react-native-firebase/messaging';
import Routes from './routes/index';
import NotificationsCenter from './components/NotificationConfig';
import SplashScreen from 'react-native-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import queryClient from './Network/queryClient';
import Config from 'react-native-config';

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
    requestUserPermission();
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      // Permission granted
    }
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer ref={navigationRef}>
              <Routes />
              <NotificationsCenter />
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
