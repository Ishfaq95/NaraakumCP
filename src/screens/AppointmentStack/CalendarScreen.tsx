import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { appointmentService } from '../../services/api/appointmentService';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import AppointmentCard from '../../components/Appointment/AppointmentCard';
import { globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { useNavigation } from '@react-navigation/native';

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState<string>(moment().format('MMMM YYYY'));
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [showYearModal, setShowYearModal] = useState<boolean>(false);
  const [yearInput, setYearInput] = useState<string>(moment().format('YYYY'));
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState<string | number>("50%");
  const { user } = useSelector((state: any) => state.root.user);
  const navigation = useNavigation();
  useEffect(() => {
    getTaskbyServiceProviderId();
  }, [currentMonth]);


  const getTaskbyServiceProviderId = async () => {
    try {
      const payload: any = {
        "UserId": user?.Id,
        "PageNumber": 1,
        "PageSize": 100,
        "Fromdate": moment(currentMonth, 'MMMM YYYY').startOf('month').format('YYYY-MM-DD'),
        "Todate": moment(currentMonth, 'MMMM YYYY').endOf('month').format('YYYY-MM-DD')
      };

      const response = await appointmentService.getTaskbyServiceProviderId(payload);

      if (response?.ResponseStatus?.STATUSCODE === 200) {
        const taskList = response.TaskList || [];

        // Extract unique scheduling dates from the task list
        const dates = taskList.map((task: any) => {
          // Format the date to YYYY-MM-DD
          return moment(task.SchedulingDate).format('YYYY-MM-DD');
        }).filter((date: string, index: number, self: string[]) => {
          // Remove duplicates
          return self.indexOf(date) === index;
        });

        setScheduledDates(dates);

        // Format dates for the calendar
        const marked: MarkedDates = {};
        dates.forEach((date: string) => {
          marked[date] = {
            marked: true,
            dotColor: '#00A19D'
          };
        });

        // Keep the selected date marked
        if (marked[selectedDate]) {
          marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: '#00A19D'
          };
        } else {
          marked[selectedDate] = {
            marked: false,
            selected: true,
            selectedColor: '#00A19D',
            dotColor: '#00A19D',
          };
        }

        setMarkedDates(marked);

        // Store the task list for later use when showing schedules for a specific date
        setAllTasks(taskList);
      }
    } catch (error) {
      console.error('Error fetching scheduled dates:', error);
    }
  };

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;

    // Update selected date in markedDates
    const updatedMarkedDates = { ...markedDates };

    // Remove selection from previous date
    if (markedDates[selectedDate]) {
      updatedMarkedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: false
      };

      // Keep the dot if it was marked
      if (!markedDates[selectedDate].marked) {
        delete updatedMarkedDates[selectedDate];
      } else {
        updatedMarkedDates[selectedDate] = {
          marked: true,
          dotColor: markedDates[selectedDate].dotColor,
          selected: false
        };
      }
    }

    // Mark the new selected date
    updatedMarkedDates[dateString] = {
      ...(markedDates[dateString] || {}),
      selected: true,
      selectedColor: '#00A19D',
      marked: markedDates[dateString]?.marked || false,
      dotColor: markedDates[dateString]?.dotColor || '#00A19D'
    };

    setSelectedDate(dateString);
    setMarkedDates(updatedMarkedDates);

    // Check if this date has schedules
    if (scheduledDates.includes(dateString)) {
      fetchDateSchedules(dateString);
      setShowScheduleModal(true);
    }
  };

  const fetchDateSchedules = (date: string) => {
    // Filter tasks for the selected date
    const tasksForDate = allTasks.filter((task: any) => {
      const taskDate = moment(task.SchedulingDate).format('YYYY-MM-DD');
      return taskDate === date;
    });

    // Format tasks for display
    const formattedTasks = tasksForDate.map((task: any) => task);

    // Calculate appropriate height based on number of items
    if (formattedTasks.length === 0) {
      setBottomSheetHeight("25%"); // Minimal height for no items
    } else if (formattedTasks.length < 2) {
      setBottomSheetHeight("40%"); // Small height for few items
    } else if (formattedTasks.length <= 4) {
      setBottomSheetHeight("60%"); // Medium height
    } else {
      setBottomSheetHeight("85%"); // Maximum height for many items
    }

    setSelectedDateSchedules(formattedTasks);
  };

  const handleMonthChange = (month: DateData) => {
    const monthYear = moment(month.dateString).format('MMMM YYYY');
    setCurrentMonth(monthYear);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const monthMoment = moment(currentMonth, 'MMMM YYYY');
    const newMonth = direction === 'prev'
      ? monthMoment.subtract(1, 'month')
      : monthMoment.add(1, 'month');

    setCurrentMonth(newMonth.format('MMMM YYYY'));
  };

  const handleYearSubmit = () => {
    if (yearInput.length === 4 && !isNaN(Number(yearInput))) {
      const newDate = moment(currentMonth, 'MMMM YYYY')
        .year(parseInt(yearInput, 10))
        .format('MMMM YYYY');

      setCurrentMonth(newDate);
      setShowYearModal(false);
    }
  };

  const renderCustomHeader = () => {
    return (
      <View style={styles.customHeaderContainer}>
        {/* <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => setShowYearModal(true)}>
          <Text style={styles.headerTitle}>{currentMonth}</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity> */}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#333" />

      </TouchableOpacity>
      <Text style={{fontSize:16,fontWeight:'bold',color:'#333'}}>Appointment Calendar</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
        {renderHeader()}
        <View style={styles.headerContainer}>

          <Text style={styles.headerText}>
            <Ionicons name="ellipse" size={12} color="#00A19D" /> Tasks Related To This Day.
          </Text>
          <Text style={styles.subHeaderText}>Click To View Tasks</Text>
        </View>

        <Calendar
          current={selectedDate}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          renderHeader={renderCustomHeader}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#333',
            selectedDayBackgroundColor: '#00A19D',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00A19D',
            dayTextColor: '#333',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00A19D',
            selectedDotColor: '#ffffff',
            arrowColor: '#00A19D',
            monthTextColor: '#333',
            indicatorColor: '#00A19D',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14
          }}

          style={styles.calendar}
          dayComponent={({ date, state, marking }) => {
            if (!date) return null;
            const isSelected = !!markedDates[date.dateString]?.selected;
            const isToday = date.dateString === moment().format('YYYY-MM-DD');
            const hasDot = !!marking?.marked;
            return (
              <TouchableOpacity
                onPress={() => handleDayPress({
                  dateString: date.dateString,
                  day: date.day,
                  month: date.month,
                  year: date.year,
                  timestamp: date.timestamp,
                })}
                style={[styles.dayContainer, isSelected && styles.selectedDay]}
              >
                <View style={styles.dayInnerContainer}>
                  <Text
                    style={[
                      styles.dayText,
                      state === 'disabled' && styles.disabledDayText,
                      isSelected && styles.selectedDayText,
                      isToday && styles.todayText,
                    ]}
                  >
                    {date.day}
                  </Text>
                  {hasDot && (
                    <View
                      style={[
                        { width: 12, height: 12, borderRadius: 6, backgroundColor: marking?.dotColor || '#00A19D', position: 'absolute', bottom: 4 },
                        isSelected && { backgroundColor: '#fff' },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Year Selection Modal */}
        <Modal
          visible={showYearModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalOverlay}>

              <View style={styles.yearModalContainer}>
                <View style={styles.yearModalHeader}>
                  <Text style={styles.yearModalTitle}>Select Year</Text>
                  <TouchableOpacity onPress={() => setShowYearModal(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.yearInput}
                  placeholder="Enter a 4-digit year"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={yearInput}
                  onChangeText={setYearInput}
                />

                <View style={styles.monthGrid}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={styles.monthItem}
                        onPress={() => {
                          const newDate = moment(`${yearInput}-${index + 1}-01`).format('MMMM YYYY');
                          setCurrentMonth(newDate);
                          setShowYearModal(false);
                        }}
                      >
                        <Text style={styles.monthText}>{month}</Text>
                      </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleYearSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Schedule Modal */}

        <CustomBottomSheet
          visible={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          height={bottomSheetHeight}
          backdropClickable={true}
          showHandle={false}
        >
          <View style={{ flexDirection: 'row', height: 50, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Appointments List ({moment(selectedDate).format('DD/MM/YYYY')})</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#e4f1ef' }}>

            {selectedDateSchedules.length > 0 && (
              <FlatList
                data={selectedDateSchedules}
                keyExtractor={(item) => item.RowId}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <AppointmentCard
                    item={item}
                    onSessionDetails={() => { }}
                  />
                )}

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
        </CustomBottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#e4f1ef',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 16,
  },
  dayContainer: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  selectedDay: {
    backgroundColor: '#00A19D',
    // width: '100%',
    // height: '100%',
  },
  dayInnerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  disabledDayText: {
    color: '#d9e1e8',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '500',
  },
  todayText: {
    fontWeight: '700',
  },
  customHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearModalContainer: {
    width: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  yearModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  yearModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  yearInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  monthItem: {
    width: '30%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#00A19D',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  scheduleModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  scheduleList: {
    maxHeight: 400,
  },
  scheduleItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#00A19D',
    fontWeight: '500',
  },
  scheduleTitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
    fontWeight: '600',
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleOrderId: {
    fontSize: 13,
    color: '#666',
  },
  scheduleServiceType: {
    backgroundColor: '#e6f8eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#54b196',
  },
  scheduleServiceTypeText: {
    fontSize: 12,
    color: '#008b62',
    fontWeight: '500',
  },
  noSchedulesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  closeButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#00A19D',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default CalendarScreen;
