import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ROUTES } from '../shared/utils/routes';
import { useNetInfo } from "@react-native-community/netinfo";
import LoaderKit from 'react-native-loader-kit';
import { globalTextStyles } from '../styles/globalStyles';
import { useSelector } from 'react-redux';

const NetworkErrorScreen = ({ navigation }: any) => {
  const netInfo = useNetInfo();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: any) => state.root.user.user);
  const onRetry = () => {
    console.log("user",netInfo.isConnected)
    if (!netInfo.isConnected) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 100);
    } else {
      if (user) {
        navigation.navigate(ROUTES.AppNavigator, {
          screen: ROUTES.AppointmentsStack,
          params: {
            screen: ROUTES.AppointmentListScreen,
          }
        });
      } else {
        navigation.navigate(ROUTES.Login)
      }
    }

  }

  console.log("loading",loading)

  return (
    <View style={styles.container}>

      <Text style={styles.errorText}>Something went wrong.</Text>
      <Text style={styles.errorText}>Please try again.</Text>
      <Button title="Retry" onPress={onRetry} />
      {/* {loading && (
        <View style={styles.loader}>
          <LoaderKit
            style={{ width: 100, height: 100 }}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  errorText: {
    ...globalTextStyles.h4,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
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

export default NetworkErrorScreen;
