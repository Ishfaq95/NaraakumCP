import React from "react";
import { TouchableOpacity, View, Image, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from '@react-navigation/native'; // Add this import
import { ROUTES } from "../shared/utils/routes";
import { useTranslation } from "react-i18next";
import { globalTextStyles } from "../styles/globalStyles";
import AppointmentListScreen from "../screens/AppointmentStack/AppointmentListScreen";
import MyClientsScreen from "../screens/MyClientsStack/MyClientsScreen";
import MyProfileScreen from "../screens/MyProfileStack/MyProfileScreen";
import SettingScreen from "../screens/SettingStack/SettingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type RenderTabIconProps = {
  routeName: string;
  isFocused: boolean;
};

function RenderTabIcon({ routeName, isFocused }: RenderTabIconProps) {
  switch (routeName) {
    case ROUTES.AppointmentsStack:
      return isFocused ? <Image resizeMode="contain" source={require('../assets/icons/appointmentsSelected.png')} style={{width: 24, height: 24}} /> : <Image resizeMode="contain" source={require('../assets/images/appointmentNotSelected.png')} style={{width: 24, height: 24}} />;
    case ROUTES.MyClientsStack:
      return (
        <View style={{ position: 'relative' }}>
          {isFocused ? <Image resizeMode="contain" source={require('../assets/images/myclientSelected.png')} style={{width: 24, height: 24}} /> : <Image resizeMode="contain" source={require('../assets/icons/myClientsUnSelected.png')} style={{width: 24, height: 24}} />}
         
        </View>
      );
    case ROUTES.MyProfileStack:
      return isFocused ? <Image resizeMode="contain" source={require('../assets/images/profileSelected.png')} style={{width: 24, height: 24}} /> : <Image resizeMode="contain" source={require('../assets/icons/profileUnSelected.png')} style={{width: 24, height: 24}} />;
    case ROUTES.SettingsStack:
      return isFocused ? <Image resizeMode="contain" source={require('../assets/images/settingSelected.png')} style={{width: 24, height: 24}} /> : <Image resizeMode="contain" source={require('../assets/icons/settingUnSelected.png')} style={{width: 24, height: 24}} />;
    default:
      return <></>;
  }
}

const RenderTabText = ({ routeName, isFocused }: RenderTabIconProps) => {
  const { t } = useTranslation();
  switch (routeName) {
    case ROUTES.AppointmentsStack:
      return (
        <Text
          numberOfLines={1}
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{"Appointments"}</Text>
      );
    case ROUTES.MyClientsStack:
      return (
        <Text
          numberOfLines={1}
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{"My Clients"}</Text>
      );
    case ROUTES.MyProfileStack:
      return (
        <Text
          numberOfLines={1}
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{"My Profile"}</Text>
      );
    case ROUTES.SettingsStack:
      return (
        <Text
        numberOfLines={1}
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{"Settings"}</Text>
      );
    default:
      return <></>;
  }
}

type CustomTabbarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

// Helper function to get the initial screen name for each stack
const getInitialScreenName = (routeName: string) => {
  switch (routeName) {
    case ROUTES.AppointmentsStack:
      return ROUTES.AppointmentListScreen;
    case ROUTES.MyClientsStack:
      return ROUTES.MyClientsScreen;
    case ROUTES.MyProfileStack:
      return ROUTES.MyProfileScreen;
    case ROUTES.SettingsStack:
        return ROUTES.SettingScreen;
    default:
      return null;
  }
};

function CustomTabbar({ state, descriptors, navigation }: CustomTabbarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ backgroundColor: "#ffffff", paddingBottom: insets.bottom }}>
      <View style={[{
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
      }]}>
        {state.routes.map(
          (route: { key: string | number; name: any }, index: any) => {
            const descriptor = descriptors[route.key];
            if (!descriptor) return null;
            const { options } = descriptor;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                // Get the initial screen name for this stack
                const initialScreenName = getInitialScreenName(route.name);
                
                if (initialScreenName) {
                  // Reset the stack to its initial screen
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: route.name,
                          state: {
                            routes: [{ name: initialScreenName }],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                } else {
                  // Fallback to normal navigation
                  navigation.navigate(route.name);
                }
              } else if (isFocused) {
                // If already focused, reset to initial screen
                const initialScreenName = getInitialScreenName(route.name);
                if (initialScreenName) {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: route.name,
                          state: {
                            routes: [{ name: initialScreenName }],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                }
              }
            }

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={1}
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                key={route.name}
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  },
                ]}
              >
                <>
                  <RenderTabIcon routeName={route.name} isFocused={isFocused} />
                  <RenderTabText routeName={route.name} isFocused={isFocused} />
                  <View
                    style={{
                      width: 10,
                      height: 2,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                    }}
                  ></View>
                </>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );
}

function AppointmentsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AppointmentListScreen} component={AppointmentListScreen} />
    </Stack.Navigator>
  );
}

function MyClientsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MyClientsScreen} component={MyClientsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MyProfileScreen} component={MyProfileScreen} />
    </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.SettingScreen} component={SettingScreen} />
    </Stack.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <CustomTabbar {...props} />}
      screenOptions={{
        headerShown: false,
        // You can remove unmountOnBlur if you want to preserve state but reset navigation
        // unmountOnBlur: true,
      }}
    >
      <Tab.Screen name={ROUTES.AppointmentsStack} component={AppointmentsStackNavigator} />
      <Tab.Screen name={ROUTES.MyClientsStack} component={MyClientsStackNavigator} />
      <Tab.Screen name={ROUTES.MyProfileStack} component={ProfileStackNavigator} />
      <Tab.Screen name={ROUTES.SettingsStack} component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}