import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/Home';
import AlarmScreen from '../screens/AlarmScreen';
import PreViewScreen from '../screens/VideoSDK/preViewScreen';
import VideoCallScreen from '../screens/VideoSDK/VideoCallScreen';
import meeting from '../screens/meeting';
import { ROUTES } from '../shared/utils/routes';
import WelcomeScreen from '../screens/AuthModule/WelcomeScreen';
import LoginScreen from '../screens/AuthModule/loginScreen';
import BottomTabs from './AppNavigator';
import SignUpScreen from '../screens/AuthModule/SignUpScreen';
import ConfirmPassword from '../screens/ForgotPassword/ConfirmPassword';
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword';
import ForgotOTP from '../screens/ForgotPassword/ForgotOTP';
import CalendarScreen from '../screens/AppointmentStack/CalendarScreen';
import PromotionAndDiscount from '../screens/SettingStack/PromotionAndDiscount';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const user = useSelector((state: any) => state.root.user.user);
  const signUpFlow = useSelector((state: any) => state.root.user.signUpFlow);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.welcomeScreen} component={WelcomeScreen} />
        <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SignUp} component={SignUpScreen} />
        <Stack.Screen name={ROUTES.ForgotPassword} component={ForgotPassword} />
        <Stack.Screen name={ROUTES.ForgotOTP} component={ForgotOTP} />
        <Stack.Screen name={ROUTES.ConfirmPassword} component={ConfirmPassword} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AppNavigator} component={BottomTabs} />
      <Stack.Screen name={ROUTES.CalendarScreen} component={CalendarScreen} />
      <Stack.Screen name={ROUTES.PromotionAndDiscount} component={PromotionAndDiscount} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
