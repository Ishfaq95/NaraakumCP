import { useEffect, useState, useRef } from "react";
import { Linking, Platform } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../shared/utils/routes";
import { useSelector } from "react-redux";
import { useAlert } from "../contexts/AlertContext";
export const Connectivity = () => {
  const netInfo = useNetInfo();
  const [didMount, setDidMount] = useState(false);
  const [previousConnection, setPreviousConnection] = useState(false);
  const [isNoInternetAlertVisible, setIsNoInternetAlertVisible] = useState(false);
  const navigation=useNavigation()
  const user = useSelector((state: any) => state.root.user.user);
  const { showAlert, hideAlert } = useAlert();
  
  useEffect(() => {
    setDidMount(true);
  }, []);

  // Function to show the no-internet alert
  const showNoInternetAlert = () => {
    setIsNoInternetAlertVisible(true);
    showAlert({
      title: 'No Internet Connection',
      message: 'NARAAKUM PROVIDER is not available while you are offline.Please connect to the internet and try again.',  
      dismissable: false, // Prevent user from closing the alert
      onConfirm: () => {
        // Open device settings (not app settings) - alert will stay open
        if (Platform.OS === 'ios') {
          Linking.openURL('App-Prefs:root=WIFI').catch(() => {
            Linking.openSettings();
          });
        } else {
          // Android: Open device WiFi settings instead of app settings
          Linking.openURL('android.settings.WIFI_SETTINGS').catch(() => {
            // Fallback to general settings if WiFi settings can't be opened
            Linking.openURL('android.settings.SETTINGS').catch(() => {
              Linking.openSettings();
            });
          });
        }
        // Alert stays open because dismissable is false
      }
    });
  };

  useEffect(() => {
    if (didMount) {
      if (netInfo.isConnected !== previousConnection) {
        if (!netInfo.isConnected) {
          // Show alert when connection is lost
          if (!isNoInternetAlertVisible) {
            showNoInternetAlert();
          }
        } else {
          // Internet connection restored - close the alert
          if (isNoInternetAlertVisible) {
            setIsNoInternetAlertVisible(false);
            hideAlert();
          }
        }
        setPreviousConnection(netInfo.isConnected ?? false);
      }
    }
  }, [netInfo.isConnected, didMount, previousConnection, isNoInternetAlertVisible, hideAlert]);


  // render
  return null;
};
