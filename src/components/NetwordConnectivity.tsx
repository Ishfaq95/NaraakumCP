import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../shared/utils/routes";
import { useSelector } from "react-redux";

export const Connectivity = () => {
  const netInfo = useNetInfo();
  const [didMount, setDidMount] = useState(false);
  const [previousConnection, setPreviousConnection] = useState(false);
  const navigation = useNavigation()
  const user = useSelector((state: any) => state.root.user.user);
  useEffect(() => {
    setDidMount(true);
  }, []);

  useEffect(() => {
    if (didMount) {
      if (netInfo.isConnected !== previousConnection) {
        if (!netInfo.isConnected) {

          navigation.navigate(ROUTES.NetworkError)

        } else {
          if (user) {
            navigation.navigate(ROUTES.AppNavigator, {
              screen: ROUTES.AppointmentsStack,
              params: {
                screen: ROUTES.AppointmentListScreen,
              }
            });
          } else {
            navigation.navigate(ROUTES.welcomeScreen as never)
          }
        }
        setPreviousConnection(netInfo.isConnected);
      }
    }
  }, [netInfo.isConnected, didMount, previousConnection]);

  // render
  return null;
};
