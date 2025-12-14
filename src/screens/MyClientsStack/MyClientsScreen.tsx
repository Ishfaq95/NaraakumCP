import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import React, { useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClientsList from './components/ClientsList';
import ClientsFeedback from './components/ClientsFeedback';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const MyClientsScreen = () => {
  const navigation = useNavigation();
  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NotificationListScreen as never);
  };

  const handleMessagesPress = () => {
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  const handleAlarmPress = () => {
    navigation.navigate(ROUTES.ReminderListScreen as never);
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
        showMessages={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onMessagesPress={handleMessagesPress}
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
    // paddingTop: 12,
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
    color: '#E9F5F6',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  tabTextActive: {
    color: '#fff',
  },
  
});