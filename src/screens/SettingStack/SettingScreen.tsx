import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsMenu from '../../components/Profile/SettingsMenu';
import { useDispatch, useSelector } from 'react-redux';
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer';
import { ROUTES } from '../../shared/utils/routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import { globalTextStyles } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import Dropdown from '../../components/common/Dropdown';
import { settingService } from '../../services/api/settingService';
import FullScreenLoader from '../../components/FullScreenLoader';
import { tokenRefreshService } from '../../services/axios/tokenRefreshService';
import messaging from '@react-native-firebase/messaging';

const ReminderTimeUnit = [
  { label: 'Minutes', value: '6' },
  { label: 'Hours', value: '5' },
  { label: 'Days', value: '1' },
];

const ReminderMinutes = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '15', value: '15' },
  { label: '30', value: '30' },
  { label: '45', value: '45' },
];

const ReminderHours = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
];

const ReminderDays = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
];

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: any) => state.root.user.user);
  const [reminderSettingBottomSheetVisible, setReminderSettingBottomSheetVisible] = useState(false);
  const { topic } = useSelector((state: any) => state.root.user);
  const [reminderTimeUnit, setReminderTimeUnit] = useState<string>('6'); // Default to minutes
  const [reminderMinutesAndHours, setReminderMinutesAndHours] = useState<string>('5'); // Default value
  const [settingsMenuItems, setSettingsMenuItems] = useState([
    {
      id: 'promotions',
      title: 'Promotions & Discounts',
      icon: 'pricetag-outline',
      Image: require('../../assets/icons/PromotionIcon.png'),
      iconColor: '#00A19D',
      onPress: () => handleSettingsItemPress('promotions'),
    },
    {
      id: 'reminders',
      title: 'Reminders',
      icon: 'alarm-outline',
      iconColor: '#00A19D',
      onPress: () => handleSettingsItemPress('reminders'),
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'help-circle-outline',
      iconColor: '#00A19D',
      Image: require('../../assets/images/video.png'),
      onPress: () => handleSettingsItemPress('help'),
    },
    {
      id: 'delete',
      title: 'Delete My Account',
      icon: 'trash-outline',
      iconColor: '#FF3B30',
      Image: require('../../assets/images/delete.png'),
      onPress: () => handleSettingsItemPress('delete'),
    },
  ]);

  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NotificationListScreen as never);
  };

  const handleMessagesPress = () => {
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  const handleAlarmPress = () => {
    navigation.navigate(ROUTES.ReminderListScreen as never);
  };
  
  const handleSettingsItemPress = (itemId: string) => {
    if (itemId === 'promotions') {
      navigation.navigate(ROUTES.PromotionAndDiscount as never);
    } else if (itemId == 'reminders') {
      setReminderSettingBottomSheetVisible(true);
    } else if (itemId == 'help') {
      navigation.navigate(ROUTES.HelpScreen as never);
    } else if (itemId == 'delete') {
      navigation.navigate(ROUTES.DeleteAccountScreen as never);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getReminderSettingApi()
    }
  }, [isFocused]);

  const getReminderSettingApi = async () => {
    try {
      setLoading(true);
      const payload = {
        "UserloginInfoId": user.Id,
      }
      const response = await settingService.getReminderSetting(payload);

      if (response.ResponseStatus.STATUSCODE == 200 && response.ReminderSetting && response.ReminderSetting.length > 0) {
        const reminderValues = response.ReminderSetting[0];

        // Set values from API
        setReminderTimeUnit(reminderValues.CatTimeUnitId.toString());
        setReminderMinutesAndHours(reminderValues.TimeUnitDuration.toString());
        setIsDataLoaded(true);
      } else {
        // No API data, use defaults
        setDefaultValues();
        setIsDataLoaded(true);
      }
    } catch (error) {
      // API failed, use defaults
      setDefaultValues();
      setIsDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  const setDefaultValues = () => {
    setReminderTimeUnit('6'); // Default to minutes
    setReminderMinutesAndHours('5'); // Default to 5 minutes
  }
  
  const handleLogout = () => {
    if(topic){
      messaging()
        .unsubscribeFromTopic(topic)
        .then(() => { });
    }
    dispatch(setUser(null));
    dispatch(setTopic(null));
    // Reset token refresh service on logout to clear any queued requests
    tokenRefreshService.reset();
    // Implement logout functionality
    // Clear user session and navigate to login screen
  };

  // Get the appropriate data array based on selected time unit
  const getTimeData = (timeUnit: string) => {
    switch (timeUnit) {
      case '6': // Minutes
        return ReminderMinutes;
      case '5': // Hours
        return ReminderHours;
      case '1': // Days
        return ReminderDays;
      default:
        return ReminderMinutes;
    }
  };

  // Get default value based on selected time unit
  const getDefaultValue = (timeUnit: string) => {
    switch (timeUnit) {
      case '6': // Minutes
        return '5';
      case '5': // Hours
        return '1';
      case '1': // Days
        return '1';
      default:
        return '5';
    }
  };

  const updateReminderSettingApi = async () => {
    try {
      setLoading(true);
      const payload = {
        "UserloginInfoId": user.Id,
        "CatTimeUnitId": reminderTimeUnit,
        "TimeUnitDuration": reminderMinutesAndHours
      }

      const response = await settingService.updateReminderSetting(payload);
      if (response.ResponseStatus.STATUSCODE == 200) {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const onPressSaveReminderSetting = () => {
    updateReminderSettingApi();
    setReminderSettingBottomSheetVisible(false);
  }

  const onPressChangeReminderTimeUnit = (value: string | number) => {
    setReminderTimeUnit(value as string);
  }

  const onPressChangeReminderValue = (value: string | number) => {
    setReminderMinutesAndHours(value as string);
  }

  // Get current time data
  const currentTimeData = getTimeData(reminderTimeUnit);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="Settings"
        showNotification={true}
        notificationCount={0}
          showMessages={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onMessagesPress={handleMessagesPress}
        onAlarmPress={handleAlarmPress}
      />
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', padding: 16 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SettingsMenu 
            menuItems={settingsMenuItems}
            version="2.0"
            onLogout={handleLogout}
          />
        </ScrollView>
      </View>

      <CustomBottomSheet
        visible={reminderSettingBottomSheetVisible}
        onClose={() => setReminderSettingBottomSheetVisible(false)}
        // height="28%"
        maxHeight={ Platform.OS === 'ios' ? 280 : 220}
        showHandle={false}
        style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden' }}
      >
        <View style={{ flex: 1, backgroundColor: '#fff'}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',backgroundColor:'#E6F3F3',paddingVertical:10,paddingHorizontal:16,borderTopLeftRadius:10,borderTopRightRadius:10 }}>
            <Text style={{ ...globalTextStyles.buttonLarge, fontFamily: globalTextStyles.h3.fontFamily, color: '#000' }}>Reminder Settings</Text>
            <TouchableOpacity onPress={() => setReminderSettingBottomSheetVisible(false)}>
              <Icon name="close" size={20} color="#239EA0" />
            </TouchableOpacity>
          </View>
          <Text style={{ ...globalTextStyles.bodyMedium, fontFamily: globalTextStyles.h5.fontFamily, color: '#000',paddingHorizontal:16,marginTop:10 }}>Remind me before</Text>
          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,paddingHorizontal:16 }}>
            <View style={{ width: '48%' }}>
              <Dropdown
                data={currentTimeData}
                placeholder={getDefaultValue(reminderTimeUnit)}
                value={reminderMinutesAndHours}
                onChange={(value: string | number) => onPressChangeReminderValue(value)}
                containerStyle={{ height: 50 }}
                dropdownStyle={{ height: 50 }}
              />
            </View>
            <View style={{ width: '48%' }}>
              <Dropdown
                data={ReminderTimeUnit}
                containerStyle={{ height: 50 }}
                dropdownStyle={{ height: 50 }}
                value={reminderTimeUnit}
                onChange={(value: string | number) => onPressChangeReminderTimeUnit(value)}
              />
            </View>

          </View>

          <TouchableOpacity onPress={onPressSaveReminderSetting} style={{ backgroundColor: '#239EA0', padding: 10, borderRadius: 10, marginTop: 10,marginHorizontal:16 }}>
            <Text style={{ ...globalTextStyles.buttonLarge, color: '#fff', textAlign: 'center' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>

      {/* <FullScreenLoader visible={loading} /> */}
    </SafeAreaView>
  )
}

export default SettingScreen

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
});