import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import AppointmentStatistics from '../../components/Appointment/AppointmentStatistics'
import AppointmentFilter from '../../components/Appointment/AppointmentFilter'
import AppointmentTabs from '../../components/Appointment/AppointmentTabs'
import ProfileCompletionNotice from '../../components/Profile/ProfileCompletionNotice'
import AppointmentCard from '../../components/Appointment/AppointmentCard'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appointmentService } from '../../services/api/appointmentService';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../shared/utils/routes'

const AppointmentListScreen = () => {
  const navigation = useNavigation();
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'previous' | 'today' | 'upcoming'>('today');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profileSummary, setProfileSummary] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { user } = useSelector((state: any) => state.root.user);
  const [ordersCount, setOrdersCount] = useState({
    new: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    getServiceProviderMainSummary();
    getServiceProviderUnAvailability();
    getServiceProviderCount();
  }, []);

  const getServiceProviderMainSummary = async () => {
    const payload = {
      UserloginInfoId: user?.Id,
    };
    const response = await appointmentService.getServiceProviderMainSummary(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      setProfileSummary(response.ServiceProviderSummary[0]);
    }
  };

  const getServiceProviderUnAvailability = async () => {
    const payload = {
      ServiceProviderLogininfoId: user?.Id,
    };
    const response = await appointmentService.getServiceProviderUnAvailability(payload);
    if (response?.ResponseStatus?.STATUSCODE === 201) {
      setIsAvailable(true);
    }
  };

  const getServiceProviderCount = async () => {
    const payload = {
      ServiceProviderId: user?.Id,
    };
    const response = await appointmentService.getServiceProviderCount(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      const newCount = response.CountByNewOrders[0]?.NewOrders;
      const inProgressCount = response.CountByHeadName.find((item: any) => item.TitlePlang === 'InprogressOrders')?.Count;
      const completedCount = response.CountByHeadName.find((item: any) => item.TitlePlang === 'CompletedOrders')?.Count;
      const cancelledCount = response.CountByHeadName.find((item: any) => item.TitlePlang === 'CanceledOrders')?.Count;
      const tempOrdersCount = {
        new: newCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
      };
      setOrdersCount(tempOrdersCount);
    }
  };

  const getTaskbyServiceProviderId = async (page = 1, isLoadMore = false) => {
    try {
      setIsLoading(true);
      
      const payload: any = {
        "UserId": user?.Id,
        "OrderStatus": null,
        "OrderId": null,
        "OrderbyPatientName": 0,
        "OrderbyAsc": 0,
        "PageNumber": page,
        "OrderStatStatus": activeTab === 'previous' ? 0 : activeTab === 'today' ? 1 : 2,
        "PageSize": 10
      };

      if (activeTab === 'upcoming') {
        payload.OrderByUpcomingDate = 1;
      }
      
      const response = await appointmentService.getTaskbyServiceProviderId(payload);
      
      if (response?.ResponseStatus?.STATUSCODE === 200) {
        // Update total records for pagination
        setTotalRecords(response.TotalRecord || 0);
        
        // If loading more, append to existing list, otherwise replace
        if (isLoadMore) {
          setAppointments(prevAppointments => [...prevAppointments, ...response.TaskList]);
        } else {
          setAppointments(response.TaskList);
        }
        
        // Check if we've loaded all records
        setHasMoreData((page * 10) < (response.TotalRecord || 0));
      } else if (response?.ResponseStatus?.STATUSCODE === 201) {
        if (!isLoadMore) {
          setAppointments([]);
        }
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreAppointments = () => {
    if (isLoading || !hasMoreData) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    getTaskbyServiceProviderId(nextPage, true);
  };

  useEffect(() => {
    // Reset pagination when tab changes
    setCurrentPage(1);
    setHasMoreData(true);
    getTaskbyServiceProviderId(1, false);
  }, [activeTab]);
  
  const isProfileComplete = (): boolean => {
    return (
      profileSummary?.ProfileManagement === "Completed" &&
      profileSummary?.PaymentProfile === "Completed" &&
      profileSummary?.ServiceProfile === "Completed"
    );
  };
  
  const handleCompleteProfile = () => {
    // Navigate to profile completion screen
    navigation.navigate('MyProfile' as never);
  };

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

  const handleAvailabilityChange = (value: boolean) => {
    setIsAvailable(value);
    console.log('Availability changed:', value);
    // Update availability status in backend
  };

  const handleCalendarPress = () => {
    navigation.navigate(ROUTES.CalendarScreen as never);
  };

  const handleTabChange = (tab: 'previous' | 'today' | 'upcoming') => {
    setActiveTab(tab);
  };
  
  const handleSessionDetails = (appointmentId: string) => {
    console.log('View session details for appointment:', appointmentId);
    // Navigate to appointment details screen
    // navigation.navigate('AppointmentDetails', { appointmentId });
  };

  console.log("appointments",appointments);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="My Appointments"
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
          {isProfileComplete() ? (
            <AppointmentStatistics
              stats={[
                { count: ordersCount.new, label: 'New', color: '#00A19D' },
                { count: ordersCount.inProgress, label: 'In Progress', color: '#FFA500' },
                { count: ordersCount.completed, label: 'Completed', color: '#00A19D' },
                { count: ordersCount.cancelled, label: 'Cancelled', color: '#FF6B6B' }
              ]}
            />
          ) : (
            <ProfileCompletionNotice 
              profileSummary={profileSummary}
              onCompleteProfile={handleCompleteProfile}
            />
          )}

          {/* Availability and Calendar */}
          <AppointmentFilter
            onAvailabilityChange={handleAvailabilityChange}
            isAvailable={isAvailable}
          />

          {/* Calendar Button */}
          <TouchableOpacity style={styles.card} onPress={handleCalendarPress}>
            <View style={styles.calendarRow}>
              <View style={styles.calendarLabelContainer}>
                <Ionicons name="calendar-outline" size={24} color="#00A19D" />
                <Text style={styles.calendarLabel}>Appointment calendar</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={{ height: 1, width: '100%', backgroundColor: '#000',opacity:0.1 }} />

          {/* Tab Filters */}
          <AppointmentTabs onTabChange={handleTabChange} />

          <View style={{ flex: 1 }}>
            {/* Appointment list will be shown here */}
            {appointments.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16 }}>No appointments found</Text>
              </View>
            ) : (
              <FlatList
                data={appointments}
                keyExtractor={(item) => item.RowId}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <AppointmentCard
                    item={item}
                    onSessionDetails={() => handleSessionDetails(item)}
                  />
                )}
                onEndReached={loadMoreAppointments}
                onEndReachedThreshold={0.3}
                ListFooterComponent={() => (
                  isLoading ? (
                    <View style={styles.loaderContainer}>
                      <ActivityIndicator size="small" color="#23a2a4" />
                    </View>
                  ) : null
                )}
              />
            )}
          </View>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default AppointmentListScreen

const styles = StyleSheet.create({
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
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
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});