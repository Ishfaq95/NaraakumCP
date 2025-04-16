import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../shared/utils/routes';
import React from 'react';
import HomeScreen from '../screens/Home';
import AlarmScreen from '../screens/AlarmScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
        <Stack.Screen name={ROUTES.AlarmScreen} component={AlarmScreen} />
      </Stack.Navigator>
    </>
  );
};

export default AuthStack;