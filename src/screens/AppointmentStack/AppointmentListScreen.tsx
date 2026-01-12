import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, RefreshControl, Image, useColorScheme, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import AppointmentStatistics from '../../components/Appointment/AppointmentStatistics'
import AppointmentFilter from '../../components/Appointment/AppointmentFilter'
import AppointmentTabs from '../../components/Appointment/AppointmentTabs'
import ProfileCompletionNotice from '../../components/Profile/ProfileCompletionNotice'
import AppointmentCard from '../../components/Appointment/AppointmentCard'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appointmentService } from '../../services/api/appointmentService';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../shared/utils/routes'
import { subsribeTopic } from '../../shared/services/service'
import WebSocketService from '../../components/WebSocketService'
import moment from 'moment'
import CustomBottomSheet from '../../components/common/CustomBottomSheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles'
import { useAlert } from '../../contexts/AlertContext';
import LoaderKit from 'react-native-loader-kit';
import FullScreenLoader from '../../components/FullScreenLoader'

const AppointmentListScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'previous' | 'today' | 'upcoming'>('today');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profileSummary, setProfileSummary] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { user } = useSelector((state: any) => state.root.user);
  const { topic } = useSelector((state: any) => state.root.user);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const enabledAppointmentsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<any>(null);
  const dispatch = useDispatch();
  const webSocketService = WebSocketService.getInstance();
  const isScreenFocused = useIsFocused();
  const [unAvailableBottomSheetVisible, setUnAvailableBottomSheetVisible] = useState(false);
  const isFocused = useIsFocused();
  const [ordersCount, setOrdersCount] = useState({
    new: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [unAvailabilityList, setUnAvailabilityList] = useState<any[]>([]);

  // Unavailability form states
  const [startDate, setStartDate] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [startDateError, setStartDateError] = useState(false);
  const [startTimeError, setStartTimeError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);
  const [reasonError, setReasonError] = useState(false);

  // Date/Time picker visibility states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // iOS modal states
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  
  // Temporary values for iOS pickers (to hold changes until Done is clicked)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempEndTime, setTempEndTime] = useState<Date | null>(null);
  
  const [unavailabilityAPIError, setUnavailabilityAPIError] = useState('');
  const { showAlert } = useAlert();

  console.log("user",topic)

  // Handle WebSocket connection
  useEffect(() => {
    if (user && isFocused) {
      const presence = 1;
      const communicationKey = user.CommunicationKey;
      const UserId = user.Id;
      subsribeTopic(UserId, topic, dispatch);

      // Only connect if not already connected
      if (!webSocketService.isSocketConnected()) {
        webSocketService.connect(presence, communicationKey, UserId);
      } else {
        // If already connected, make sure the global handler is set
        webSocketService.addGlobalMessageHandler();
      }

      // Check for unread messages when screen is focused
      if (isScreenFocused) {
        checkUnreadMessages();
      }
    } else {
      // webSocketService.disconnect();
    }
  }, [user, isScreenFocused]);

  const checkUnreadMessages = () => {
    if (user) {
      webSocketService.checkUnreadMessages(user.Id);
    }
  }

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
      setUnAvailabilityList([]);
      setIsAvailable(true);
    } else if (response?.ResponseStatus?.STATUSCODE === 200) {
      setUnAvailabilityList(response.Data);
      setIsAvailable(false);
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
        inProgress: inProgressCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0,
      };
      setOrdersCount(tempOrdersCount);
    }
  };

  // Separate effect for initial setup only - runs once
  useEffect(() => {
    // Initialize the ref
    enabledAppointmentsRef.current = new Set<string>();
  }, []);

  const checkTimeCondition = useCallback((appointment: any) => {
    const now = moment();
    const appointmentDate = moment.utc(appointment?.SchedulingDate).local();
    const startTime = moment.utc(appointment?.SchedulingTime, 'HH:mm').local();
    const endTime = moment.utc(appointment?.SchedulingEndTime, 'HH:mm').local();

    startTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });
    endTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });

    return now.isSameOrAfter(startTime) &&
      now.isBefore(endTime) &&
      now.isSame(appointmentDate, 'day');
  }, []);

  // Main effect for timer and WebSocket
  useEffect(() => {
    if (isScreenFocused) {

      // Set up interval for appointment status only
      timerRef.current = setInterval(() => {
        // Only process appointments if they exist
        if (appointments?.length > 0) {
          const enabled = new Set<string>();
          let hasChanges = false;

          appointments.forEach(appointment => {
            const isEnabled = checkTimeCondition(appointment);
            const appointmentId = `${appointment.OrderId}-${appointment.TaskId}`;

            if (isEnabled) {
              enabled.add(appointmentId);
            }

            // Check if the enabled state has changed
            if (isEnabled !== enabledAppointmentsRef.current.has(appointmentId)) {
              hasChanges = true;
            }
          });

          // Only update if there are actual changes
          if (hasChanges) {
            enabledAppointmentsRef.current = enabled;
            // Force a re-render of the FlatList
            setAppointments(prev => [...prev]);
          }
        }
      }, 1000);
    }

    return () => {
      // Clean up appointment timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // We don't stop the WebSocketService periodic check here
      // because we want it to continue across screens
    };
  }, [isScreenFocused, user, appointments]);

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

        // Initialize the enabled appointments set
        const enabled = new Set<string>();

        // Check each appointment
        response.TaskList.forEach((appointment: any) => {
          if (checkTimeCondition(appointment)) {
            enabled.add(`${appointment.OrderId}-${appointment.TaskId}`);
          }
        });

        // Update the ref
        enabledAppointmentsRef.current = enabled;

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
          setTotalRecords(0);
        }
        setHasMoreData(false);
      }
    } catch (error) {
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

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    await getTaskbyServiceProviderId(1, false);
    setRefreshing(false);
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
    navigation.navigate(ROUTES.MyProfileStack, { screen: ROUTES.MyProfileScreen })
  };

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NotificationListScreen as never);
  };

  const handleMessagesPress = () => {
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  const handleAlarmPress = () => {
    navigation.navigate(ROUTES.ReminderListScreen as never);
  };

  const handleAvailabilityChange = (value: boolean) => {
    if (!value) {
      // Reset form when creating new unavailability
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setReason('');
      setUnAvailableBottomSheetVisible(true);
    } else {
      setShowConfirmModal(true);
      // handleAddServiceProviderAvailability(unAvailabilityList[0]);
    }
  };

  const handleEditUnavailability = (item: any) => {
    // Parse the UTC date and time from the item and convert to local
    const startDateTimeUTC = moment.utc(`${item.StartDate} ${item.StartTime}`, 'YYYY-MM-DD HH:mm');
    const endDateTimeUTC = moment.utc(`${item.EndDate} ${item.EndTime}`, 'YYYY-MM-DD HH:mm');

    // Convert to local time
    const startDateTimeLocal = startDateTimeUTC.local();
    const endDateTimeLocal = endDateTimeUTC.local();

    setStartDate(startDateTimeLocal.toDate());
    setStartTime(startDateTimeLocal.toDate());
    setEndDate(endDateTimeLocal.toDate());
    setEndTime(endDateTimeLocal.toDate());
    setReason(item.Reason || '');
    setUnAvailableBottomSheetVisible(true);
  };

  const handleCalendarPress = () => {
    navigation.navigate(ROUTES.CalendarScreen as never);
  };

  const handleTabChange = (tab: 'previous' | 'today' | 'upcoming') => {
    setActiveTab(tab);
  };

  const handleSessionDetails = (item: any) => {
    // Navigate to appointment details screen
    navigation.navigate(ROUTES.VisitDetailScreen as never, { taskId: item?.TaskId });
  };

  const handleJoinMeeting = (appointment: any) => {
    // Parse the date and time separately
    const date = moment.utc(appointment.SchedulingDate);
    const [startHours, startMinutes] = appointment.SchedulingTime.split(':');
    const [endHours, endMinutes] = appointment.SchedulingEndTime.split(':');

    // Create UTC moments with the correct time
    let startTimeUTC = moment.utc(date).set({
      hours: parseInt(startHours),
      minutes: parseInt(startMinutes)
    });

    let endDateTimeUTC = moment.utc(date).set({
      hours: parseInt(endHours),
      minutes: parseInt(endMinutes)
    });

    // Convert to local time
    let startTimeLocal = startTimeUTC.local();
    let endTimeLocal = endDateTimeUTC.local();

    let meetingInfo = {
      toUserId: appointment.PatientUserProfileInfoId,
      sessionStartTime: startTimeLocal.toISOString(),
      bookingId: appointment.TaskId,
      patientProfileId: appointment.PatientUserProfileInfoId,
      meetingId: appointment.VideoSDKMeetingId,
      Name: appointment.PatientPName,
      displayName: user?.FullnamePlang,
      sessionEndTime: endTimeLocal.toISOString(),
      patientId: appointment.PatientUserProfileInfoId,
      serviceProviderId: appointment.UserloginInfoId
    };

    navigation.navigate(ROUTES.preViewCall, { Data: meetingInfo });
  }

  const isAppointmentEnabled = useCallback((appointment: any) => {
    return enabledAppointmentsRef.current.has(`${appointment.OrderId}-${appointment.TaskId}`);
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <AppointmentCard
      item={item}
      onSessionDetails={(item: any) => handleSessionDetails(item)}
      onJoinMeeting={handleJoinMeeting}
      isCallEnabled={isAppointmentEnabled(item)}
    />
  ), [handleJoinMeeting, isAppointmentEnabled]);

  const handleAddServiceProviderAvailability = async (item: any) => {

    const payload = {
      ServiceProviderAvailabilityId: item?.ServiceProviderAvailabilityId,
      OrganizationId: user?.OrganizationId,
      ServiceProviderLogininfoId: user?.Id,
      StartDate: null,
      StartTime: null,
      EndDate: null,
      EndTime: null,
      Reason: null
    };

    const response = await appointmentService.addEditServiceProviderUnAvailability(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      setUnAvailableBottomSheetVisible(false);

      // Refresh the unavailability list
      await getServiceProviderUnAvailability();
      // Reset form
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setReason('');
    }
  };

  const handleAddServiceProviderUnAvailability = async () => {
    // Validate required fields
    let hasError = false;
    if (!startDate) {
      setStartDateError(true);
      hasError = true;
    }
    if (!startTime) {
      setStartTimeError(true);
      hasError = true;
    }
    if (!endDate) {
      setEndDateError(true);
      hasError = true;
    }
    if (!endTime) {
      setEndTimeError(true);
      hasError = true;
    }
    if (!reason.trim()) {
      setReasonError(true);
      hasError = true;
    }
    if (hasError) return;

    // Convert local date/time to UTC before sending
    const startDateTimeLocal = moment(startDate);
    startDateTimeLocal.set({
      hour: moment(startTime).hour(),
      minute: moment(startTime).minute(),
      second: 0,
      millisecond: 0
    });

    const endDateTimeLocal = moment(endDate);
    endDateTimeLocal.set({
      hour: moment(endTime).hour(),
      minute: moment(endTime).minute(),
      second: 0,
      millisecond: 0
    });

    // Convert to UTC
    const startDateTimeUTC = startDateTimeLocal.utc();
    const endDateTimeUTC = endDateTimeLocal.utc();

    const payload = {
      ServiceProviderAvailabilityId: null,
      OrganizationId: user?.OrganizationId,
      ServiceProviderLogininfoId: user?.Id,
      StartDate: startDateTimeUTC.format('YYYY-MM-DD'),
      StartTime: startDateTimeUTC.format('HH:mm'),
      EndDate: endDateTimeUTC.format('YYYY-MM-DD'),
      EndTime: endDateTimeUTC.format('HH:mm'),
      Reason: reason
    };

    const response = await appointmentService.addEditServiceProviderUnAvailability(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      if(response?.StatusCode?.STATUSCODE === 11011 || response?.StatusCode?.STATUSCODE === 11012) {
        setUnavailabilityAPIError(response?.StatusCode?.MESSAGE);
        return;
      }else {
        setUnAvailableBottomSheetVisible(false);
        setUnavailabilityAPIError('');
        // Refresh the unavailability list
        await getServiceProviderUnAvailability();
        // Reset form
        setStartDate(null);
        setStartTime(null);
        setEndDate(null);
        setEndTime(null);
        setReason('');
        setStartDateError(false);
        setStartTimeError(false);
        setEndDateError(false);
        setEndTimeError(false);
        setReasonError(false);
      }
      
    }
  };

  // Date/Time picker handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      // Only update state if user confirmed (type === 'set')
      // If dismissed (type === 'dismissed'), don't update state
      if (event.type === 'set' && selectedDate) {
        setStartDate(selectedDate);
        setStartDateError(false);
      } else if (event.type === 'dismissed') {
        // Reset temp value when dismissed
        setTempStartDate(startDate ? new Date(startDate) : null);
      }
    } else {
      // iOS - this is called from the Done button
      if (selectedDate) {
        setStartDate(selectedDate);
        setStartDateError(false);
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
      // Only update state if user confirmed (type === 'set')
      if (event.type === 'set' && selectedTime) {
        setStartTime(selectedTime);
        setStartTimeError(false);
      } else if (event.type === 'dismissed') {
        // Reset temp value when dismissed
        setTempStartTime(startTime ? new Date(startTime) : null);
      }
    } else {
      // iOS - this is called from the Done button
      if (selectedTime) {
        setStartTime(selectedTime);
        setStartTimeError(false);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
      // Only update state if user confirmed (type === 'set')
      if (event.type === 'set' && selectedDate) {
        setEndDate(selectedDate);
        setEndDateError(false);
      } else if (event.type === 'dismissed') {
        // Reset temp value when dismissed
        setTempEndDate(endDate ? new Date(endDate) : null);
      }
    } else {
      // iOS - this is called from the Done button
      if (selectedDate) {
        setEndDate(selectedDate);
        setEndDateError(false);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
      // Only update state if user confirmed (type === 'set')
      if (event.type === 'set' && selectedTime) {
        setEndTime(selectedTime);
        setEndTimeError(false);
      } else if (event.type === 'dismissed') {
        // Reset temp value when dismissed
        setTempEndTime(endTime ? new Date(endTime) : null);
      }
    } else {
      // iOS - this is called from the Done button
      if (selectedTime) {
        setEndTime(selectedTime);
        setEndTimeError(false);
      }
    }
  };

  const handleSaveUnavailability = () => {
    handleAddServiceProviderAvailability(unAvailabilityList[0]);
    setShowConfirmModal(false);
  };

  const handleCancelUnavailability = () => {
    setUnAvailableBottomSheetVisible(false);
    setUnavailabilityAPIError('');
    // Reset form
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setReason('');
  };

  const renderDateTimePicker = (
    type: 'date' | 'time',
    value: Date,
    tempValue: Date | null,
    setTempValue: (date: Date) => void,
    onChange: (event: any, date?: Date) => void,
    showModal: boolean,
    setShowModal: (show: boolean) => void,
    label: string
  ) => {
    if (Platform.OS === 'ios') {
      const displayValue = tempValue || value;
      
      return (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            // Reset temp value on cancel
            setTempValue(value);
            setShowModal(false);
          }}
        >
          <View style={unavailabilityStyles.modalOverlay}>
            <View style={[unavailabilityStyles.modalContent, isDarkMode && unavailabilityStyles.modalContentDark]}>
              <View style={[unavailabilityStyles.modalHeader, isDarkMode && unavailabilityStyles.modalHeaderDark]}>
                <TouchableOpacity onPress={() => {
                  // Reset temp value on cancel
                  setTempValue(value);
                  setShowModal(false);
                }}>
                  <Text style={[unavailabilityStyles.cancelButtonText, isDarkMode && unavailabilityStyles.cancelButtonTextDark]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[unavailabilityStyles.modalTitle, isDarkMode && unavailabilityStyles.modalTitleDark]}>{label}</Text>
                <TouchableOpacity onPress={() => {
                  // Apply the temp value when Done is clicked
                  onChange({ type: 'set' }, displayValue);
                  setShowModal(false);
                }}>
                  <Text style={[unavailabilityStyles.doneButtonText, isDarkMode && unavailabilityStyles.doneButtonTextDark]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={[unavailabilityStyles.datePickerContainer, isDarkMode && unavailabilityStyles.datePickerContainerDark]}>
                <DateTimePicker
                  value={displayValue}
                  mode={type}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    // Update temp value when picker changes, but don't call onChange yet
                    if (selectedDate) {
                      setTempValue(selectedDate);
                    }
                  }}
                  textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                  themeVariant={isDarkMode ? 'dark' : 'light'}
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="My Appointments"
        showNotification={true}
        notificationCount={0}
        showMessages={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onMessagesPress={handleMessagesPress}
        onAlarmPress={handleAlarmPress}
      />
      <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
        <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
        <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -80 }}>
          <View style={{ marginBottom: 10 }}>
          {isProfileComplete() ? (
            <AppointmentStatistics
              stats={[
                { count: ordersCount.new, label: 'New', color: '#33A281' },
                { count: ordersCount.inProgress, label: 'In Progress', color: '#F29F3F' },
                { count: ordersCount.completed, label: 'Completed', color: '#239EA0' },
                { count: ordersCount.cancelled, label: 'Cancelled', color: '#EF6666' }
              ]}
            />
          ) : (
            <ProfileCompletionNotice
              profileSummary={profileSummary}
              onCompleteProfile={handleCompleteProfile}
            />
          )}
          </View>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.RowId}
            contentContainerStyle={
              appointments.length === 0 
                ? { flexGrow: 1 } 
                : {}
            }
            renderItem={({ item }) => renderItem({ item })}
            onEndReached={loadMoreAppointments}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#23a2a4']}
                tintColor="#23a2a4"
              />
            }
            ListHeaderComponent={() => (
              <>
                {/* Availability and Calendar */}
                <AppointmentFilter
                  onAvailabilityChange={handleAvailabilityChange}
                  isAvailable={isAvailable}
                  unAvailabilityList={unAvailabilityList}
                  onEditUnavailability={handleEditUnavailability}
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

                <View style={{ height: 1, width: '100%', backgroundColor: '#000', opacity: 0.1 }} />

                {/* Tab Filters */}
                <AppointmentTabs onTabChange={handleTabChange} activeTab={activeTab} />

                {/* Appointment list header text */}
                <Text style={{ color: '#666', fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, marginTop: -10, marginBottom: 8 }}>{`${activeTab === 'today' ? "Today's" : activeTab === 'upcoming' ? 'Upcoming' : 'Previous'} Appointments: (${totalRecords})`}</Text>
              </>
            )}
            ListEmptyComponent={() => (
              !refreshing ? (
                <View style={styles.emptyContainer}>
                  <Image source={require('../../assets/images/EmptyList.png')} style={{ width: 50, height: 50 }} />
                  <Text style={{ color: '#666', fontSize: 16, paddingTop: 10 }}>There are no appointments available</Text>
                </View>
              ) : null
            )}
            ListFooterComponent={() => (
              isLoading && !refreshing ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#23a2a4" />
                </View>
              ) : null
            )}
            scrollEnabled={true}
          />
        </View>

      </View>

      <CustomBottomSheet
        visible={unAvailableBottomSheetVisible}
        onClose={() => setUnAvailableBottomSheetVisible(false)}
        backdropClickable={true}
        showHandle={false}
        maxHeight={Platform.OS === 'ios' ? "80%" : "60%"}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={unavailabilityStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
          {/* Header */}
          <Text style={unavailabilityStyles.title}>Switch Mode To Unavailable</Text>

          {/* Info Box */}
          <View style={unavailabilityStyles.infoBox}>
            <Text style={unavailabilityStyles.infoText}>
              Choose the time period to pause receiving bookings through the app.
            </Text>
          </View>

          {/* Start Date and Time Row */}
          <View style={unavailabilityStyles.row}>
            <View style={unavailabilityStyles.halfColumn}>
              <Text style={unavailabilityStyles.label}>Start Date</Text>
              <TouchableOpacity
                style={[unavailabilityStyles.inputContainer, startDateError && unavailabilityStyles.inputError]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    // Initialize temp value when opening modal
                    setTempStartDate(startDate ? new Date(startDate) : new Date());
                    setShowStartDateModal(true);
                  } else {
                    // Initialize temp value when opening picker for Android
                    setTempStartDate(startDate ? new Date(startDate) : new Date());
                    setShowStartDatePicker(true);
                  }
                }}
              >
                <Text style={unavailabilityStyles.inputText}>
                  { startDate ? moment(startDate).format('DD/MM/YYYY') : 'dd/mm/yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={unavailabilityStyles.halfColumn}>
              <Text style={unavailabilityStyles.label}>Start Time</Text>
              <TouchableOpacity
                style={[unavailabilityStyles.inputContainer, startTimeError && unavailabilityStyles.inputError]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    // Initialize temp value when opening modal
                    setTempStartTime(startTime ? new Date(startTime) : new Date());
                    setShowStartTimeModal(true);
                  } else {
                    // Initialize temp value when opening picker for Android
                    setTempStartTime(startTime ? new Date(startTime) : new Date());
                    setShowStartTimePicker(true);
                  }
                }}
              >
                <Text style={unavailabilityStyles.inputText}>
                  {startTime ? moment(startTime).format('HH:mm') : '--:--'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* End Date and Time Row */}
          <View style={unavailabilityStyles.row}>
            <View style={unavailabilityStyles.halfColumn}>
              <Text style={unavailabilityStyles.label}>End Date</Text>
              <TouchableOpacity
                style={[unavailabilityStyles.inputContainer, endDateError && unavailabilityStyles.inputError]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    // Initialize temp value when opening modal
                    setTempEndDate(endDate ? new Date(endDate) : new Date());
                    setShowEndDateModal(true);
                  } else {
                    // Initialize temp value when opening picker for Android
                    setTempEndDate(endDate ? new Date(endDate) : new Date());
                    setShowEndDatePicker(true);
                  }
                }}
              >
                <Text style={unavailabilityStyles.inputText}>
                  {endDate ? moment(endDate).format('DD/MM/YYYY') : 'dd/mm/yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={unavailabilityStyles.halfColumn}>
              <Text style={unavailabilityStyles.label}>End Time</Text>
              <TouchableOpacity
                style={[unavailabilityStyles.inputContainer, endTimeError && unavailabilityStyles.inputError]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    // Initialize temp value when opening modal
                    setTempEndTime(endTime ? new Date(endTime) : new Date());
                    setShowEndTimeModal(true);
                  } else {
                    // Initialize temp value when opening picker for Android
                    setTempEndTime(endTime ? new Date(endTime) : new Date());
                    setShowEndTimePicker(true);
                  }
                }}
              >
                <Text style={unavailabilityStyles.inputText}>
                  {endTime ? moment(endTime).format('HH:mm') : '--:--'}
                </Text>
                <Ionicons name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reason Input */}
          <View style={unavailabilityStyles.fullColumn}>
            <Text style={unavailabilityStyles.label}>Write The Reason</Text>
            <TextInput
              style={[unavailabilityStyles.textArea, reasonError && unavailabilityStyles.inputError]}
              placeholder="write the reason"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={(text)=>{setReason(text); if(reasonError && text.trim()) setReasonError(false);}}
              textAlignVertical="top"
            />
             {unavailabilityAPIError && (
            <Text style={{ color: '#FF3B30', fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.regular, lineHeight: Platform.OS === 'ios' ? 0 : 20, marginBottom: 10 }}>{unavailabilityAPIError}</Text>
          )}
          </View>

         

          {/* Save Button */}
          <TouchableOpacity
            style={unavailabilityStyles.saveButton}
            onPress={handleAddServiceProviderUnAvailability}
          >
            <Text style={unavailabilityStyles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={unavailabilityStyles.cancelButton}
            onPress={handleCancelUnavailability}
          >
            <Text style={unavailabilityStyles.cancelButtonTextButton}>Cancel</Text>
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Android Date/Time Pickers */}
        {Platform.OS === 'android' && showStartDatePicker && (
          <DateTimePicker
            value={tempStartDate || (startDate ? new Date(startDate) : new Date())}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        {Platform.OS === 'android' && showStartTimePicker && (
          <DateTimePicker
            value={tempStartTime || (startTime ? new Date(startTime) : new Date())}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}
        {Platform.OS === 'android' && showEndDatePicker && (
          <DateTimePicker
            value={tempEndDate || (endDate ? new Date(endDate) : new Date())}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
        {Platform.OS === 'android' && showEndTimePicker && (
          <DateTimePicker
            value={tempEndTime || (endTime ? new Date(endTime) : new Date())}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}

        {/* iOS Date/Time Modals */}
        {renderDateTimePicker('date', startDate ? new Date(startDate) : new Date(), tempStartDate, setTempStartDate, handleStartDateChange, showStartDateModal, setShowStartDateModal, 'Start Date')}
        {renderDateTimePicker('time', startTime ? new Date(startTime) : new Date(), tempStartTime, setTempStartTime, handleStartTimeChange, showStartTimeModal, setShowStartTimeModal, 'Start Time')}
        {renderDateTimePicker('date', endDate ? new Date(endDate) : new Date(), tempEndDate, setTempEndDate, handleEndDateChange, showEndDateModal, setShowEndDateModal, 'End Date')}
        {renderDateTimePicker('time', endTime ? new Date(endTime) : new Date(), tempEndTime, setTempEndTime, handleEndTimeChange, showEndTimeModal, setShowEndTimeModal, 'End Time')}
      </CustomBottomSheet>

      <ConfirmationModal
        visible={showConfirmModal}
        message="Are You Sure To Remove The Unavailability Time?"
        onYes={handleSaveUnavailability}
        onNo={() => {
          setShowConfirmModal(false);
        }}
        title="Confirmation"
      />

      <FullScreenLoader visible={isLoading || refreshing} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const unavailabilityStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000',
    marginBottom: 16,
    textAlign: 'left',
  },
  infoBox: {
    backgroundColor: '#FFF4E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  halfColumn: {
    flex: 1,
  },
  fullColumn: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: 20,
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  inputText: {
    fontSize: 14,
    color: '#666',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    fontSize: 14,
    color: '#000',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  saveButton: {
    backgroundColor: '#00A19D',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00A19D',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonTextButton: {
    color: '#00A19D',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  // iOS Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderDark: {
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 16,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#000',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  cancelButtonTextDark: {
    color: '#FFFFFF',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#00A19D',
  },
  doneButtonTextDark: {
    color: '#00A19D',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
  },
  datePickerContainerDark: {
    backgroundColor: '#1C1C1E',
  },
});