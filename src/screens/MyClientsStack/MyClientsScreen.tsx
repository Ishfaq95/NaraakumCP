import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClientsList from './components/ClientsList';
import ClientsFeedback from './components/ClientsFeedback';

const MyClientsScreen = () => {
  
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

  const [activeTab, setActiveTab] = useState<'list' | 'feedback'>('list');

  const renderTabs = () => (
    <>
      {/* Row 1: two full-width buttons */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.fullTabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Clients List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fullTabButton, activeTab === 'feedback' && styles.tabButtonActive]}
          onPress={() => setActiveTab('feedback')}
        >
          <Text style={[styles.tabText, activeTab === 'feedback' && styles.tabTextActive]}>Clients Feedback</Text>
        </TouchableOpacity>
      </View>

      
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="My Clients"
        showNotification={true}
        notificationCount={0}
        showSettings={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onSettingsPress={handleSettingsPress}
        onAlarmPress={handleAlarmPress}
      />
      <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
        {renderTabs()}
        <View style={{ flex: 1, padding: 12 }}>
          {activeTab === 'list' ? <ClientsList /> : <ClientsFeedback />}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default MyClientsScreen

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2aa7a9',
    paddingTop: 12,
  },
  fullTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    opacity: 1,
  },
  tabText: {
    color: '#e5f3f2',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  
});