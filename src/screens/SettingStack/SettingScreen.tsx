import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsMenu from '../../components/Profile/SettingsMenu';
import { useDispatch } from 'react-redux';
import { setUser } from '../../shared/redux/reducers/userReducer';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const [settingsMenuItems, setSettingsMenuItems] = useState([
    {
      id: 'promotions',
      title: 'Promotions & Discounts',
      icon: 'pricetag-outline',
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
      onPress: () => handleSettingsItemPress('help'),
    },
    {
      id: 'delete',
      title: 'Delete My Account',
      icon: 'trash-outline',
      iconColor: '#FF3B30',
      onPress: () => handleSettingsItemPress('delete'),
    },
  ]);

  const handleNotificationPress = () => {
    console.log('Notification pressed');
    // Navigate to notifications screen or show notifications
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    // Navigate to settings screen
  };

  const handleAlarmPress = () => {
    console.log('Alarm pressed');
    // Navigate to calendar/appointments screen
  };
  
  const handleSettingsItemPress = (itemId: string) => {
    console.log(`Settings item pressed: ${itemId}`);
    
    if (itemId === 'delete') {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account confirmed') }
        ]
      );
    }
  };
  
  const handleLogout = () => {
    console.log('Logout pressed');
    dispatch(setUser(null));
    // Implement logout functionality
    // Clear user session and navigate to login screen
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="Settings"
        showNotification={true}
        notificationCount={0}
        showSettings={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onSettingsPress={handleSettingsPress}
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
    </SafeAreaView>
  )
}

export default SettingScreen

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
});