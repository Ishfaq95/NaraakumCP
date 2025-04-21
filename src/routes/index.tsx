import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../shared/utils/routes';
import React from 'react';
import HomeScreen from '../screens/Home';
import AlarmScreen from '../screens/AlarmScreen';
import PreViewScreen from '../screens/VideoSDK/preViewScreen';
import VideoCallScreen from '../screens/VideoSDK/VideoCallScreen';
import meeting from '../screens/meeting';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.preViewCall} component={PreViewScreen} />
        <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
        <Stack.Screen name={ROUTES.AlarmScreen} component={AlarmScreen} />

        {/* <Stack.Screen name={ROUTES.preViewCall} component={PreViewScreen} /> */}
      
      <Stack.Screen name={ROUTES.VideoCallScreen} component={VideoCallScreen} />
      <Stack.Screen name={ROUTES.Meeting} component={meeting} />
      </Stack.Navigator>
    </>
  );
};

export default AuthStack;