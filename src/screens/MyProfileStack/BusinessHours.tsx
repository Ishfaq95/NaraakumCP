import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalTextStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

type ViewMode = 'Month' | 'Week' | 'Day' | 'Custom';

interface Holiday {
    WeekDay: number;
    Day: string;
    ServiceProviderId: number;
    isActive: boolean;
}

interface AvailabilitySlot {
    OrganizationId: string;
    ServiceProviderId: string;
    CatAvailabilityTypeId: string;
    title: string;
    start: string;
    end: string;
    StartTime: string;
    EndTime: string;
    StartDate: string;
    EndDate: string;
    IDs: string;
}

const BusinessHours = ({route}: {route: any}) => {
    const navigation = useNavigation();
    const Data = route.params?.Data;
    const user = useSelector((state: any) => state.root.user.user);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(moment());
    const [viewMode, setViewMode] = useState<ViewMode>('Month');
    const [selectedDate, setSelectedDate] = useState(moment());
    const [selectedDates, setSelectedDates] = useState<moment.Moment[]>([]);
    
    // Business days state - Will be updated based on API response
    const [businessDays, setBusinessDays] = useState<{ [key: number]: boolean }>({
        0: true,  // Sunday
        1: true,  // Monday
        2: true,  // Tuesday
        3: true,  // Wednesday
        4: true,  // Thursday
        5: true,  // Friday
        6: true,  // Saturday
    });

    // Schedule form state
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [tempStartTime, setTempStartTime] = useState(new Date());
    const [tempEndTime, setTempEndTime] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        getServiceProviderHolidays();
        getServiceProviderAvailability();
    }, []);

    useEffect(() => {
        if (Data) {
            getServiceProviderAvailability();
        }
    }, [Data]);

    useEffect(() => {
        // Update business days based on holidays from API
        if (holidays.length > 0) {
            const newBusinessDays: { [key: number]: boolean } = {
                0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true
            };
            
            // Mark holidays as OFF
            holidays.forEach(holiday => {
                // API WeekDay: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
                // Convert to moment index: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
                const momentIndex = holiday.WeekDay - 1;
                if (momentIndex >= 0 && momentIndex <= 6) {
                    newBusinessDays[momentIndex] = false;
                }
            });
            
            setBusinessDays(newBusinessDays);
        }
    }, [holidays]);

    const getServiceProviderHolidays = async () => {
        try {
            const payload = {
                ServiceProviderId: user?.Id,
            };
            const response = await profileService.getServiceProviderHolidays(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                setHolidays(response?.Holidays || []);
            }
        } catch (error: any) {
        }
    };

    const getServiceProviderAvailability = async () => {
        try {
            const payload = {
                CatAvailabilityTypeId: 0,
                CatServiceServeTypeId: Data?.CatServiceServeTypeId,
                ServiceProviderId: user?.Id,
                StartDate: moment().format('YYYY-MM-DD'),
            };
            const response = await profileService.getServiceProviderAvailability(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                setAvailability(response?.Data || []);
            }
        } catch (error: any) {
        }
    };

    const backButtonPress = () => {
        navigation.goBack();
    };

    const toggleBusinessDay = (dayIndex: number) => {
        setBusinessDays(prev => ({
            ...prev,
            [dayIndex]: !prev[dayIndex]
        }));
    };

    const isHoliday = (date: moment.Moment) => {
        const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // API WeekDay format: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
        // Convert moment day (0-6) to API WeekDay format (1-7)
        const apiWeekDay = dayOfWeek + 1;
        return holidays.some(h => h.WeekDay === apiWeekDay);
    };

    const isDateInAvailability = (date: moment.Moment) => {
        // Don't show availability on holidays
        if (isHoliday(date)) {
            return false;
        }
        
        return availability.some(slot => {
            const start = moment(slot.start);
            const end = moment(slot.end);
            return date.isBetween(start, end, 'day', '[]');
        });
    };

    const getAvailabilitySlotsForDate = (date: moment.Moment) => {
        // Don't return slots for holidays
        if (isHoliday(date)) {
            return [];
        }
        
        return availability.filter(slot => {
            const start = moment(slot.start);
            const end = moment(slot.end);
            return date.isBetween(start, end, 'day', '[]');
        });
    };

    const handleDatePress = (date: moment.Moment) => {
        setSelectedDate(date);
        const existingIndex = selectedDates.findIndex(d => d.isSame(date, 'day'));
        if (existingIndex >= 0) {
            setSelectedDates(prev => prev.filter((_, i) => i !== existingIndex));
        } else {
            setSelectedDates(prev => [...prev, date]);
        }
    };

    const handleSave = async () => {
        if (!startTime || !endTime) {
            Alert.alert('Error', 'Please select start and end time');
            return;
        }

        if (selectedDates.length === 0) {
            Alert.alert('Error', 'Please select at least one date');
            return;
        }

        setIsSaving(true);
        // TODO: Implement save API call
        setTimeout(() => {
            setIsSaving(false);
            Alert.alert('Success', 'Business hours saved successfully');
            handleClear();
        }, 1000);
    };

    const handleClear = () => {
        setStartTime('');
        setEndTime('');
        setSelectedDates([]);
    };

    const formatTimeForDisplay = (time: string) => {
        if (!time) return '';
        return moment(time, 'HH:mm:ss').format('h:mm A');
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Hours</Text>
        </View>
    );

    const renderBusinessDays = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Days</Text>
            <View style={styles.daysGrid}>
                {daysOfWeek.map((day, index) => (
                    <View key={index} style={styles.dayCard}>
                        <Text style={styles.dayText}>{day}</Text>
                        <Switch
                            value={businessDays[index]}
                            onValueChange={() => toggleBusinessDay(index)}
                            trackColor={{ false: '#D1D5DB', true: '#6DD5C3' }}
                            thumbColor={businessDays[index] ? '#00A896' : '#f4f3f4'}
                        />
                    </View>
                ))}
            </View>
        </View>
    );

    const renderViewModeButtons = () => (
        <View style={styles.viewModeContainer}>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Month' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('Month')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Month' && styles.viewModeTextActive]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Week' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('Week')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Week' && styles.viewModeTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Day' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('Day')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Day' && styles.viewModeTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Custom' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('Custom')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Custom' && styles.viewModeTextActive]}>Custom</Text>
            </TouchableOpacity>
        </View>
    );

    const renderMonthNavigation = () => (
        <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => setSelectedMonth(selectedMonth.clone().subtract(1, 'month'))}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
                {selectedMonth.format('MMMM YYYY').toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMonth(selectedMonth.clone().add(1, 'month'))}>
                <Ionicons name="chevron-forward" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderMonthCalendar = () => {
        const startOfMonth = selectedMonth.clone().startOf('month');
        const endOfMonth = selectedMonth.clone().endOf('month');
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');

        const calendar: moment.Moment[][] = [];
        let week: moment.Moment[] = [];

        let day = startDate.clone();
        while (day.isBefore(endDate, 'day')) {
            week.push(day.clone());
            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
            day.add(1, 'day');
        }

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.weekDaysHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <Text key={index} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>
                {calendar.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((date, dayIndex) => {
                            const isCurrentMonth = date.month() === selectedMonth.month();
                            const hasAvailability = isDateInAvailability(date);
                            const isSelected = selectedDates.some(d => d.isSame(date, 'day'));
                            const isDateHoliday = isHoliday(date);

                            return (
                                <TouchableOpacity
                                    key={dayIndex}
                                    style={styles.dayCell}
                                    onPress={() => isCurrentMonth && !isDateHoliday && handleDatePress(date)}
                                    disabled={!isCurrentMonth || isDateHoliday}
                                >
                                    <Text style={[
                                        styles.dayCellText,
                                        !isCurrentMonth && styles.dayCellTextInactive,
                                        isDateHoliday && isCurrentMonth && styles.dayCellTextHoliday,
                                        isSelected && styles.dayCellTextSelected
                                    ]}>
                                        {date.date()}
                                    </Text>
                                    {hasAvailability && isCurrentMonth && !isDateHoliday && (
                                        <View style={styles.availabilityDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = selectedDate.clone().startOf('week');
        const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, 'days'));

        return (
            <View style={styles.weekViewContainer}>
                <View style={styles.weekDateRange}>
                    <Text style={styles.weekDateRangeText}>
                        {startOfWeek.format('MM/DD/YYYY')}
                    </Text>
                    <Text style={styles.weekDateRangeText}> - </Text>
                    <Text style={styles.weekDateRangeText}>
                        {startOfWeek.clone().add(6, 'days').format('MM/DD/YYYY')}
                    </Text>
                </View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.weekScrollView}
                >
                    <ScrollView 
                        style={styles.weekVerticalScroll}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                    >
                        <View style={styles.timelineContainer}>
                        <View style={styles.timeColumn}>
                            <View style={styles.dayHeaderSpacer} />
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = i % 12 === 0 ? 12 : i % 12;
                                const period = i < 12 ? 'AM' : 'PM';
                                return (
                                    <View key={i} style={styles.timeSlot}>
                                        <Text style={styles.timeLabel}>{`${hour} ${period}`}</Text>
                                    </View>
                                );
                            })}
                        </View>
                            {weekDays.map((day, index) => {
                                const isDayHoliday = isHoliday(day);
                                return (
                                    <View key={index} style={styles.dayColumn}>
                                        <View style={[styles.dayHeader, isDayHoliday && styles.dayHeaderHoliday]}>
                                            <Text style={[styles.dayHeaderDayName, isDayHoliday && styles.dayHeaderTextHoliday]}>{day.format('ddd')}</Text>
                                            <Text style={[styles.dayHeaderDate, isDayHoliday && styles.dayHeaderTextHoliday]}>{day.format('MM/DD')}</Text>
                                        </View>
                                        <View style={styles.daySlots}>
                                            {!isDayHoliday && getAvailabilitySlotsForDate(day).map((slot, slotIndex) => {
                                                const startHour = parseInt(slot.StartTime.split(':')[0]);
                                                const endHour = parseInt(slot.EndTime.split(':')[0]);
                                                const startMinute = parseInt(slot.StartTime.split(':')[1]);
                                                const endMinute = parseInt(slot.EndTime.split(':')[1]);
                                                // Use 50px per hour instead of 60px
                                                const top = startHour * 50 + (startMinute * 50 / 60);
                                                const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * 50 / 60;

                                                return (
                                                    <View
                                                        key={slotIndex}
                                                        style={[
                                                            styles.availabilityBlock,
                                                            { top, height }
                                                        ]}
                                                    >
                                                        <Text style={styles.availabilityBlockText}>{slot.title}</Text>
                                                    </View>
                                                );
                                            })}
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <View key={i} style={[styles.hourLine, { top: i * 50 }]} />
                                            ))}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        );
    };

    const renderDayView = () => {
        const isDayHoliday = isHoliday(selectedDate);
        const slots = getAvailabilitySlotsForDate(selectedDate);

        return (
            <View style={styles.dayViewContainer}>
                <Text style={[styles.dayViewTitle, isDayHoliday && styles.dayViewTitleHoliday]}>
                    {viewMode === 'Custom' ? selectedDate.format('MMMM DD, YYYY - dddd') : selectedDate.format('dddd')}
                    {isDayHoliday && ' (Holiday)'}
                </Text>
                <ScrollView 
                    style={styles.dayTimelineScroll}
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                >
                    <View style={styles.dayTimelineContent}>
                        <View style={styles.timeColumn}>
                            {Array.from({ length: 24 }, (_, i) => {
                                const displayHour = i % 12 === 0 ? 12 : i % 12;
                                const period = i < 12 ? 'AM' : 'PM';
                                return (
                                    <View key={i} style={styles.timeSlot}>
                                        <Text style={styles.timeLabel}>{`${displayHour} ${period}`}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.dayMainColumn}>
                            {Array.from({ length: 24 }, (_, i) => (
                                <View key={i} style={[styles.hourLine, { top: i * 50 }]} />
                            ))}
                            {!isDayHoliday && slots.map((slot, slotIndex) => {
                                const startHour = parseInt(slot.StartTime.split(':')[0]);
                                const endHour = parseInt(slot.EndTime.split(':')[0]);
                                const startMinute = parseInt(slot.StartTime.split(':')[1]);
                                const endMinute = parseInt(slot.EndTime.split(':')[1]);
                                const top = startHour * 50 + (startMinute * 50 / 60);
                                const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * 50 / 60;

                                return (
                                    <View
                                        key={slotIndex}
                                        style={[
                                            styles.dayAvailabilityBlockAbs,
                                            { top, height }
                                        ]}
                                    >
                                        <Text style={styles.dayAvailabilityText}>{slot.title}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderScheduleSection = () => {
        return (
            <View style={styles.scheduleSection}>
                <View style={styles.scheduleTitleRow}>
                    <Text style={styles.scheduleTitle}>Schedule</Text>
                    <TouchableOpacity>
                        <Text style={styles.copyToNextMonth}>Copy to Next Month</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.selectedMonthRow}>
                    <MaterialIcons name="calendar-today" size={20} color="#00A896" />
                    <Text style={styles.selectedMonthText}>
                        Selected Month is: {selectedMonth.format('MMMM YYYY')}
                    </Text>
                </View>

                <TextInput
                    style={styles.timeInput}
                    placeholder="Start Time"
                    value={startTime}
                    onFocus={() => setShowStartTimePicker(true)}
                    showSoftInputOnFocus={false}
                />

                <TextInput
                    style={styles.timeInput}
                    placeholder="End Time"
                    value={endTime}
                    onFocus={() => setShowEndTimePicker(true)}
                    showSoftInputOnFocus={false}
                />

                {showStartTimePicker && (
                    <DateTimePicker
                        value={tempStartTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowStartTimePicker(Platform.OS === 'ios');
                            if (date) {
                                setTempStartTime(date);
                                setStartTime(moment(date).format('h:mm A'));
                            }
                        }}
                    />
                )}

                {showEndTimePicker && (
                    <DateTimePicker
                        value={tempEndTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowEndTimePicker(Platform.OS === 'ios');
                            if (date) {
                                setTempEndTime(date);
                                setEndTime(moment(date).format('h:mm A'));
                            }
                        }}
                    />
                )}

                <View style={styles.scheduleButtons}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClear}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.markedSlotsSection}>
                    <Text style={styles.markedSlotsTitle}>Already marked slots</Text>
                    {availability.map((slot, index) => (
                        <View key={index} style={styles.markedSlot}>
                            <Text style={styles.markedSlotTime}>{slot.title}</Text>
                            <Text style={styles.markedSlotDate}>
                                {moment(slot.start).format('YYYY-MM-DD')} - {moment(slot.end).format('YYYY-MM-DD')}
                            </Text>
                            <View style={styles.markedSlotActions}>
                                <TouchableOpacity>
                                    <MaterialIcons name="edit" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <MaterialIcons name="delete" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.mainContent}>
                    <View style={{padding: 16,alignItems: 'center',justifyContent: 'center'}}>
                        <Image source={Data?.CatServiceServeTypeId == 1 ? require('../../assets/icons/RemoteConsultant.png') : require('../../assets/icons/HomeVisit.png')} style={{width: 50,height: 50}} />
                        <Text style={{fontSize: 16,fontWeight: '600',color: '#666'}}>{Data?.CatServiceServeTypeId == 1 ? `Online Consultation Business Hours` : `Home Visit Business Hours`}</Text>
                    </View>
                    {renderBusinessDays()}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Business Hours</Text>
                        <View style={styles.businessHoursCard}>
                            {renderMonthNavigation()}
                            {renderViewModeButtons()}
                            
                            {viewMode === 'Month' && renderMonthCalendar()}
                            {viewMode === 'Week' && renderWeekView()}
                            {viewMode === 'Day' && renderDayView()}
                            {viewMode === 'Custom' && renderDayView()}
                            
                            {renderScheduleSection()}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#E8F4F3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        ...globalTextStyles.h6,
        marginLeft: 8,
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    dayCard: {
        width: '22%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dayText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    businessHoursCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    monthYearText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    viewModeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    viewModeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00A896',
    },
    viewModeButtonActive: {
        backgroundColor: '#00A896',
    },
    viewModeText: {
        fontSize: 13,
        color: '#00A896',
        fontWeight: '500',
    },
    viewModeTextActive: {
        color: '#fff',
    },
    calendarContainer: {
        marginBottom: 16,
    },
    weekDaysHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#00A896',
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dayCellText: {
        fontSize: 14,
        color: '#333',
    },
    dayCellTextInactive: {
        color: '#ccc',
    },
    dayCellTextHoliday: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    dayCellTextSelected: {
        fontWeight: 'bold',
        color: '#00A896',
    },
    availabilityDot: {
        position: 'absolute',
        bottom: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00A896',
    },
    weekViewContainer: {
        marginBottom: 16,
        height: 450,
    },
    weekScrollView: {
        height: 400,
    },
    weekVerticalScroll: {
        height: 400,
    },
    weekDateRange: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    weekDateRangeText: {
        fontSize: 13,
        color: '#666',
    },
    timelineContainer: {
        flexDirection: 'row',
        paddingBottom: 20,
    },
    timeColumn: {
        width: 65,
    },
    dayHeaderSpacer: {
        height: 60,
    },
    timeSlot: {
        height: 50,
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    timeLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'right',
        paddingRight: 4,
    },
    dayColumn: {
        width: 80,
    },
    dayHeader: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dayHeaderHoliday: {
        backgroundColor: '#F5F5F5',
    },
    dayHeaderDayName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#00A896',
    },
    dayHeaderDate: {
        fontSize: 11,
        color: '#666',
    },
    dayHeaderTextHoliday: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    daySlots: {
        position: 'relative',
        height: 24 * 50, // Reduced from 60 to 50 per hour
    },
    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    availabilityBlock: {
        position: 'absolute',
        left: 4,
        right: 4,
        backgroundColor: '#00A896',
        borderRadius: 4,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    availabilityBlockText: {
        fontSize: 9,
        color: '#fff',
        fontWeight: '600',
    },
    dayViewContainer: {
        marginBottom: 16,
        height: 450,
    },
    dayViewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00A896',
        textAlign: 'center',
        marginBottom: 12,
    },
    dayViewTitleHoliday: {
        color: '#999',
    },
    dayTimelineScroll: {
        height: 400,
        flex: 0,
    },
    dayTimelineContent: {
        flexDirection: 'row',
        paddingBottom: 20,
    },
    dayMainColumn: {
        flex: 1,
        position: 'relative',
        height: 24 * 50,
    },
    dayTimeline: {
        flexDirection: 'column',
        paddingBottom: 20,
    },
    dayTimeSlot: {
        flexDirection: 'row',
        height: 50,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    dayTimeLabel: {
        width: 65,
        fontSize: 10,
        color: '#666',
        paddingTop: 4,
        textAlign: 'right',
        paddingRight: 4,
    },
    daySlotContent: {
        flex: 1,
        position: 'relative',
    },
    dayAvailabilityBlock: {
        backgroundColor: '#00A896',
        borderRadius: 4,
        padding: 8,
        marginLeft: 4,
        marginRight: 4,
        justifyContent: 'center',
    },
    dayAvailabilityBlockAbs: {
        position: 'absolute',
        left: 4,
        right: 4,
        backgroundColor: '#00A896',
        borderRadius: 4,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayAvailabilityText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    scheduleSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    scheduleTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    copyToNextMonth: {
        fontSize: 13,
        color: '#00A896',
        fontWeight: '500',
    },
    selectedMonthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    selectedMonthText: {
        fontSize: 14,
        color: '#333',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
        color: '#333',
    },
    scheduleButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#00A896',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#00A896',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    markedSlotsSection: {
        marginTop: 20,
    },
    markedSlotsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    markedSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    markedSlotTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    markedSlotDate: {
        fontSize: 12,
        color: '#666',
        marginRight: 12,
    },
    markedSlotActions: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default BusinessHours
