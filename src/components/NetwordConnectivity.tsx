import { useEffect, useState, useRef } from "react";
import { Linking, NativeModules, Platform } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../shared/utils/routes";
import { useSelector } from "react-redux";
import { useAlert } from "../contexts/AlertContext";
const { LocationModule } = NativeModules;

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

  const openSettings = () => {
        
    // Open main device settings screen (not app info)
    if (Platform.OS === 'android') {
        let settingsOpened = false;
        
        // Method 1: Check if method exists and call it
        if (LocationModule && LocationModule.openSettings) {
            try {
                console.log('Method 1: Calling LocationModule.openSettings()');
                LocationModule.openSettings();
                settingsOpened = true;
            } catch (e) {
                console.log('Method 1 failed:', e);
            }
        }
        
        // Method 2: Try direct call (method might exist but not be enumerable)
        if (!settingsOpened && LocationModule) {
            try {
                console.log('Method 2: Trying direct call');
                (LocationModule as any).openSettings();
                settingsOpened = true;
            } catch (e) {
                console.log('Method 2 failed:', e);
            }
        }
        
        // Method 3: Try accessing via NativeModules directly
        if (!settingsOpened) {
            try {
                const modules = NativeModules;
                console.log('Available native modules:', Object.keys(modules));
                const locationMod = modules.LocationModule;
                if (locationMod && locationMod.openSettings) {
                    console.log('Method 3: Calling via NativeModules.LocationModule');
                    locationMod.openSettings();
                    settingsOpened = true;
                }
            } catch (e) {
                console.log('Method 3 failed:', e);
            }
        }
        
    } else {
        // iOS: Open main settings
        Linking.openURL('App-Prefs:root=General').catch(() => {
            // Fallback to WiFi settings
            Linking.openURL('App-Prefs:root=WIFI').catch((err) => {
                console.log("Failed to open settings:", err);
            });
        });
    }
};

  // Function to show the no-internet alert
  const showNoInternetAlert = () => {
    setIsNoInternetAlertVisible(true);
    showAlert({
      title: 'No Internet Connection',
      message: 'NARAAKUM PROVIDER is not available while you are offline.Please connect to the internet and try again.',  
      dismissable: false, // Prevent user from closing the alert
      onConfirm: () => {
        openSettings();
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
