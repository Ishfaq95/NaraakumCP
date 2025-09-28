import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileManagementGrid from '../../components/Profile/ProfileManagementGrid';

const MyProfileScreen = () => {
  const [profileOptions, setProfileOptions] = useState([
    {
      id: 'service',
      title: 'Service Profile',
      icon: 'medical-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('service'),
    },
    {
      id: 'personal',
      title: 'Personal Profile',
      icon: 'person-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('personal'),
    },
    {
      id: 'payment',
      title: 'Payment Profile',
      icon: 'wallet-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('payment'),
    },
    {
      id: 'clients',
      title: 'Clients Profile',
      icon: 'people-outline',
      iconColor: '#00A19D',
      isComplete: true,
      onPress: () => handleProfileOptionPress('clients'),
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

  const handleProfileOptionPress = (optionId: string) => {
    console.log(`Profile option pressed: ${optionId}`);
    // Navigate to the respective profile section
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="My Profile"
        showNotification={true}
        notificationCount={0}
        showSettings={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onSettingsPress={handleSettingsPress}
        onAlarmPress={handleAlarmPress}
      />
      <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
        <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
        <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -80 }}>
          {/* Profile Header */}
          <ProfileHeader
            name="Hamza Syed"
            gender="Male"
            rating={0}
            reviewCount={0}
            isActive={true}
            completionPercentage={0}
          />
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
            {/* Profile Management Grid */}
            <ProfileManagementGrid options={profileOptions} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default MyProfileScreen

const styles = StyleSheet.create({
  scrollContainer: {
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});