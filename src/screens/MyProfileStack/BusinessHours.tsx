import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator, Image, useColorScheme, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useAlert } from '../../contexts/AlertContext';

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

const BusinessHours = ({ route }: { route: any }) => {
    const navigation = useNavigation();
    const Data = route.params?.Data;
    const user = useSelector((state: any) => state.root.user.user);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(moment());
    const [viewMode, setViewMode] = useState<ViewMode>('Month');
    const [selectedDate, setSelectedDate] = useState(moment());
    const [selectedDates, setSelectedDates] = useState<moment.Moment[]>([]);
    const { showAlert } = useAlert();

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
    const [timeErrors, setTimeErrors] = useState({ start: false, end: false, date: false });
    const [customStartDate, setCustomStartDate] = useState<moment.Moment | null>(null);
    const [customEndDate, setCustomEndDate] = useState<moment.Moment | null>(null);
    const [showCustomStartPicker, setShowCustomStartPicker] = useState(false);
    const [showCustomEndPicker, setShowCustomEndPicker] = useState(false);
    const [editSlots, setEditSlots] = useState<any>(null);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [isLoading, setIsLoading] = useState(false);

    const addServiceProviderHolidays = async (daysState: { [key: number]: boolean }) => {
        setIsLoading(true);
        const dayText = daysOfWeek.map((day, index) => {
            return {
                Day: day,
                IsActive: daysState[index]
            }
        });

        const payload = {
            ServiceProviderId: user?.Id,
            Days: dayText.filter(d => !d.IsActive).map(d => d.Day).join(',')
        };
        
        try {
            
            const response = await profileService.addServiceProviderHolidays(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                getServiceProviderHolidays();
                getServiceProviderAvailability(selectedMonth);
                showAlert({
                    title: response?.ResponseStatus?.MESSAGE,
                    message: '',
                    type: 'success',
                });
            }
        }
        catch (error: any) {
        } finally {
            setIsLoading(false);
        }
    };

    // NOTE: We intentionally do NOT call addServiceProviderHolidays here on mount or when
    // businessDays is updated from the holidays API. The API should only be called when
    // the user changes the checkboxes (see toggleBusinessDay).

    const getWeekAnchorForMonth = (month: moment.Moment) => {
        const today = moment();
        if (month.isSame(today, 'month')) {
            return today.clone().startOf('week');
        }
        return month.clone().startOf('month').startOf('week');
    };

    const getDayAnchorForMonth = (month: moment.Moment) => {
        const today = moment();
        if (month.isSame(today, 'month')) {
            return today.clone();
        }
        return month.clone().startOf('month');
    };

    useEffect(() => {
        getServiceProviderHolidays();
    }, []);

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
            setIsLoading(true);
            const payload = {
                ServiceProviderId: user?.Id,
            };
            const response = await profileService.getServiceProviderHolidays(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                setHolidays(response?.Holidays || []);
            }
        } catch (error: any) {
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceProviderAvailability = async (monthDate: moment.Moment) => {
        try {
            setIsLoading(true);
            const startOfTargetMonth = monthDate.clone().startOf('month').format('YYYY-MM-DD');
            const payload = {
                CatAvailabilityTypeId: 0,
                CatServiceServeTypeId: Data?.CatServiceServeTypeId,
                ServiceProviderId: user?.Id,
                StartDate: startOfTargetMonth,
            };
            const response = await profileService.getServiceProviderAvailability(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                setAvailability(response?.Data || []);
            }
        } catch (error: any) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch availability whenever selected month or service type changes
        getServiceProviderAvailability(selectedMonth);
    }, [selectedMonth, Data?.CatServiceServeTypeId]);

    const backButtonPress = () => {
        navigation.goBack();
    };

    const toggleBusinessDay = (dayIndex: number) => {
        setBusinessDays(prev => {
            const updated = {
                ...prev,
                [dayIndex]: !prev[dayIndex],
            };
            // Call API only when user toggles a checkbox
            addServiceProviderHolidays(updated);
            return updated;
        });
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

    const formatDisplayDate = (date: moment.Moment | null) => date ? date.format('DD-MMM-YYYY') : '';

    const handleCustomStartChange = (_event: any, date?: Date) => {
        setShowCustomStartPicker(Platform.OS === 'ios');
        if (date) {
            const mDate = moment(date);
            setCustomStartDate(mDate);
            if (!customEndDate || mDate.isAfter(customEndDate)) {
                setCustomEndDate(mDate);
            }
            setSelectedDate(mDate);
            setSelectedMonth(mDate.clone().startOf('month'));
        }
    };

    const handleCustomEndChange = (_event: any, date?: Date) => {
        setShowCustomEndPicker(Platform.OS === 'ios');
        if (date) {
            const mDate = moment(date);
            if (customStartDate && mDate.isBefore(customStartDate)) {
                return;
            }
            setCustomEndDate(mDate);
            setSelectedDate(mDate);
            setSelectedMonth(mDate.clone().startOf('month'));
        }
    };


    const renderSelectionInfo = () => {
        if (viewMode === 'Custom') {
            return (
                <View style={styles.dateRangeRow}>
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>Start Date</Text>
                        <TouchableOpacity style={[styles.dateInput, timeErrors.date && styles.inputError]} onPress={() => {
                            setShowCustomStartPicker(!showCustomStartPicker)
                            setShowCustomEndPicker(false)
                        }}>
                            <Text style={styles.dateInputText}>{formatDisplayDate(customStartDate) || 'Select start date'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>End Date</Text>
                        <TouchableOpacity style={[styles.dateInput, timeErrors.date && styles.inputError]} onPress={() => {
                            setShowCustomEndPicker(!showCustomEndPicker)
                            setShowCustomStartPicker(false)
                        }}>
                            <Text style={styles.dateInputText}>{formatDisplayDate(customEndDate) || 'Select end date'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (viewMode === 'Month') {
            return (
                <View style={styles.selectedMonthRow}>
                    <MaterialIcons name="calendar-today" size={20} color="#00A896" />
                    <Text style={styles.selectedMonthText}>
                        Selected Month is: <Text style={styles.selectedMonthTextValue}>{selectedMonth.format('MMMM YYYY')}</Text>
                    </Text>
                </View>
            );
        }

        if (viewMode === 'Week') {
            const start = selectedDate.clone().startOf('week');
            const end = selectedDate.clone().endOf('week');
            return (
                <View style={styles.selectedMonthRow}>
                    <MaterialIcons name="calendar-today" size={20} color="#00A896" />
                    <Text style={styles.selectedMonthText}>
                        Selected Week is: <Text style={styles.selectedMonthTextValue}>{start.format('DD-MMM-YYYY')} - {end.format('DD-MMM-YYYY')}</Text>
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.selectedMonthRow}>
                <MaterialIcons name="calendar-today" size={20} color="#00A896" />
                <Text style={styles.selectedMonthText}>
                    Selected Date is: <Text style={styles.selectedMonthTextValue}>{selectedDate.format('DD-MMM-YYYY')}</Text>
                </Text>
            </View>
        );
    };

    const handleDatePress = (date: moment.Moment) => {
        setIsLoading(true);
        setSelectedDate(date);
        const existingIndex = selectedDates.findIndex(d => d.isSame(date, 'day'));
        if (existingIndex >= 0) {
            setSelectedDates(prev => prev.filter((_, i) => i !== existingIndex));
        } else {
            setSelectedDates(prev => [...prev, date]);
        }
        setIsLoading(false);
    };

    const handleDelete = async (slot: any) => {
        try {
            setIsLoading(true);
        const payload = {
            "ServiceProviderAvailabilityIds": slot.IDs,
            "filter": "fullslot",
            "StartDate": moment(slot.StartDate).format("YYYY-MM-DD"),
            "EndDate": moment(slot.EndDate).format("YYYY-MM-DD"),
            "CatServiceServeTypeId": Data?.CatServiceServeTypeId
        };
        const response = await profileService.deleteServiceProviderAvailability(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            showAlert({
                title: response?.ResponseStatus?.MESSAGE,
                message: '',
                type: 'success',
            });
            getServiceProviderAvailability(selectedMonth);
        }
        } catch (error) {
            
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditButton = (slot: any) => {
        setStartTime(moment(slot.StartTime, 'HH:mm').format('h:mm A'));
        setEndTime(moment(slot.EndTime, 'HH:mm').format('h:mm A'));
        setEditSlots(slot);
        if (slot.CatAvailabilityTypeId == 4) {
            setViewMode('Custom');
            setCustomStartDate(moment(slot.StartDate));
            setCustomEndDate(moment(slot.EndDate));
        }
        if (slot.CatAvailabilityTypeId == 3) {
            setViewMode('Month');
            setSelectedMonth(moment(slot.StartDate));
        }
        if (slot.CatAvailabilityTypeId == 2) {
            setViewMode('Week');
            setSelectedDate(moment(slot.StartDate));
        }
        if (slot.CatAvailabilityTypeId == 1) {
            setViewMode('Day');
            setSelectedDate(moment(slot.StartDate));
        }
    };

    const handleCopyToNextMonth = async () => {
        try {
            setIsLoading(true);
            const payload = {
                "CatServiceServeTypeId": Data?.CatServiceServeTypeId,
                "ServiceProviderId": user?.Id,
                "Date": selectedMonth.clone().startOf('month').format('YYYY-MM-DD'),
            };
            const response = await profileService.copyServiceProviderAvailabilityToNextMonth(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                showAlert({
                    title: response?.ResponseStatus?.MESSAGE,
                    message: '',
                    type: 'success',
                });
                getServiceProviderAvailability(selectedMonth);
            }
        } catch (error) {
            
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        let payloadStartDate: moment.Moment | null = null;
        let payloadEndDate: moment.Moment | null = null;
        let catAvailabilityTypeId = 1;

        if (viewMode === 'Month') {
            const today = moment().startOf('day');
            const monthStart = selectedMonth.clone().startOf('month');
            payloadStartDate = selectedMonth.isSame(today, 'month') ? moment.max(monthStart, today) : monthStart;
            payloadEndDate = selectedMonth.clone().endOf('month');
            catAvailabilityTypeId = 3;
        } else if (viewMode === 'Week') {
            payloadStartDate = selectedDate.clone().startOf('week');
            payloadEndDate = selectedDate.clone().endOf('week');
            catAvailabilityTypeId = 2;
        } else if (viewMode === 'Day') {
            payloadStartDate = selectedDate.clone().startOf('day');
            payloadEndDate = selectedDate.clone().startOf('day');
            catAvailabilityTypeId = 1;
        } else if (viewMode === 'Custom') {
            payloadStartDate = customStartDate;
            payloadEndDate = customEndDate;
            catAvailabilityTypeId = 4;
        }

        if (!payloadStartDate || !payloadEndDate) {
            return;
        }

        const startTime24 = moment(startTime, 'h:mm A').format('HH:mm');
        const endTime24 = moment(endTime, 'h:mm A').format('HH:mm');

        const payload = {
            "Ids": editSlots.IDs,
            "OrganizationId": user?.OrganizationId || Data?.OrganizationId,
            "ServiceProviderId": user?.Id,
            "StartTime": startTime24,
            "EndTime": endTime24,
            "CatAvailabilityTypeId": catAvailabilityTypeId,
            "StartDate": payloadStartDate.format('YYYY-MM-DD'),
            "EndDate": payloadEndDate.format('YYYY-MM-DD'),
            "CatServiceServeTypeId": Data?.CatServiceServeTypeId
        }

        const response = await profileService.updateServiceProviderAvailability(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            setEditSlots(null);
            setStartTime('');
            setEndTime('');
            setViewMode('Month');
            setSelectedMonth(moment());
            setCustomStartDate(null);
            setCustomEndDate(null);
            showAlert({
                title: response?.ResponseStatus?.MESSAGE,
                message: '',
                type: 'success',
            });
            getServiceProviderAvailability(selectedMonth);
        }

    };

    const handleSave = async () => {
        const hasStart = !!startTime;
        const hasEnd = !!endTime;
        let hasDate = true;

        let payloadStartDate: moment.Moment | null = null;
        let payloadEndDate: moment.Moment | null = null;
        let catAvailabilityTypeId = 1;

        if (viewMode === 'Month') {
            const today = moment().startOf('day');
            const monthStart = selectedMonth.clone().startOf('month');
            payloadStartDate = selectedMonth.isSame(today, 'month') ? moment.max(monthStart, today) : monthStart;
            payloadEndDate = selectedMonth.clone().endOf('month');
            catAvailabilityTypeId = 3;
        } else if (viewMode === 'Week') {
            payloadStartDate = selectedDate.clone().startOf('week');
            payloadEndDate = selectedDate.clone().endOf('week');
            catAvailabilityTypeId = 2;
        } else if (viewMode === 'Day') {
            payloadStartDate = selectedDate.clone().startOf('day');
            payloadEndDate = selectedDate.clone().startOf('day');
            catAvailabilityTypeId = 1;
        } else if (viewMode === 'Custom') {
            payloadStartDate = customStartDate;
            payloadEndDate = customEndDate;
            catAvailabilityTypeId = 4;
        }

        if (!payloadStartDate || !payloadEndDate) {
            hasDate = false;
        }

        setTimeErrors({
            start: !hasStart,
            end: !hasEnd,
            date: !hasDate,
        });

        if (!hasStart || !hasEnd || !hasDate || !payloadStartDate || !payloadEndDate) {
            return;
        }

        const startTime24 = moment(startTime, 'h:mm A').format('HH:mm');
        const endTime24 = moment(endTime, 'h:mm A').format('HH:mm');

        const today = moment().startOf('day');
        if (payloadStartDate.isBefore(today)) {
            setTimeErrors(prev => ({ ...prev, date: true }));
            showAlert({
                title: 'Previous date scheduling not allowed',
                message: '',
                type: 'warning',
            });
            return;
        }

        setIsSaving(true);
        const payload = {
            OrganizationId: user?.OrganizationId || Data?.OrganizationId,
            ServiceProviderId: user?.Id,
            StartDate: payloadStartDate.format('YYYY-MM-DD'),
            EndDate: payloadEndDate.format('YYYY-MM-DD'),
            StartTime: startTime24,
            EndTime: endTime24,
            CatAvailabilityTypeId: catAvailabilityTypeId,
            CatServiceServeTypeId: Data?.CatServiceServeTypeId,
        };
        const response = await profileService.addUpdateServiceProviderAvailability(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            showAlert({
                title: response?.ResponseStatus?.MESSAGE,
                message: '',
                type: 'success',
            });

            getServiceProviderAvailability(selectedMonth);
        }
        setIsSaving(false);
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
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
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
                            trackColor={{ false: '#DBDBDB', true: '#239ea0' }}
                            thumbColor={ '#fff'}
                            style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7}, { scaleY: 0.7 }] } : {}}
                        />
                    </View>
                ))}
            </View>
            <View style={{ height: 1, backgroundColor: '#eee', marginTop: 20 }} />
        </View>
    );

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (mode === 'Month') {
            setSelectedDate(selectedMonth.clone().startOf('month'));
        } else if (mode === 'Week') {
            const anchor = getWeekAnchorForMonth(selectedMonth);
            setSelectedDate(anchor);
        } else if (mode === 'Day' || mode === 'Custom') {
            const anchor = getDayAnchorForMonth(selectedMonth);
            setSelectedDate(anchor);
            if (mode === 'Custom') {
                setCustomStartDate(prev => prev || anchor);
                setCustomEndDate(prev => prev || anchor);
            }
        }
    };

    const renderViewModeButtons = () => (
        <View style={styles.viewModeContainer}>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Month' && styles.viewModeButtonActive]}
                onPress={() => handleViewModeChange('Month')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Month' && styles.viewModeTextActive]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Week' && styles.viewModeButtonActive]}
                onPress={() => handleViewModeChange('Week')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Week' && styles.viewModeTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Day' && styles.viewModeButtonActive]}
                onPress={() => handleViewModeChange('Day')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Day' && styles.viewModeTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'Custom' && styles.viewModeButtonActive]}
                onPress={() => handleViewModeChange('Custom')}
            >
                <Text style={[styles.viewModeText, viewMode === 'Custom' && styles.viewModeTextActive]}>Custom</Text>
            </TouchableOpacity>
        </View>
    );

    const handlePrevNavigation = () => {
        if (viewMode === 'Month') {
            setSelectedMonth(prev => {
                const nextMonth = prev.clone().subtract(1, 'month');
                setSelectedDate(nextMonth.clone().startOf('month'));
                return nextMonth;
            });
        } else if (viewMode === 'Week') {
            setSelectedDate(prev => {
                const nextDate = prev.clone().subtract(1, 'week').startOf('week');
                setSelectedMonth(nextDate.clone().startOf('month'));
                return nextDate;
            });
        } else {
            setSelectedDate(prev => {
                const nextDate = prev.clone().subtract(1, 'day');
                setSelectedMonth(nextDate.clone().startOf('month'));
                return nextDate;
            });
        }
    };

    const handleNextNavigation = () => {
        if (viewMode === 'Month') {
            setSelectedMonth(prev => {
                const nextMonth = prev.clone().add(1, 'month');
                setSelectedDate(nextMonth.clone().startOf('month'));
                return nextMonth;
            });
        } else if (viewMode === 'Week') {
            setSelectedDate(prev => {
                const nextDate = prev.clone().add(1, 'week').startOf('week');
                setSelectedMonth(nextDate.clone().startOf('month'));
                return nextDate;
            });
        } else {
            setSelectedDate(prev => {
                const nextDate = prev.clone().add(1, 'day');
                setSelectedMonth(nextDate.clone().startOf('month'));
                return nextDate;
            });
        }
    };

    const getCenterLabel = () => {
        if (viewMode === 'Month') {
            return selectedMonth.format('MMMM YYYY').toUpperCase();
        }
        if (viewMode === 'Week') {
            const start = selectedDate.clone().startOf('week');
            const end = selectedDate.clone().endOf('week');
            return `${start.format('MM/DD/YYYY')} - ${end.format('MM/DD/YYYY')}`;
        }
        return selectedDate.format('MMMM DD, YYYY');
    };

    const renderMonthNavigation = () => (
        <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={handlePrevNavigation}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
                {getCenterLabel()}
            </Text>
            <TouchableOpacity onPress={handleNextNavigation}>
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
        // Include the last day of the computed range so the month renders fully
        while (day.isSameOrBefore(endDate, 'day')) {
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
                            const isToday = date.isSame(moment(), 'day');
                            const isSelectedMonthCurrent = selectedMonth.isSame(moment(), 'month');
                            const isTodayInCurrentMonth = isToday && isSelectedMonthCurrent && isCurrentMonth;

                            return (
                                <TouchableOpacity
                                    key={dayIndex}
                                    style={[
                                        styles.dayCell,
                                        isTodayInCurrentMonth && styles.dayCellToday
                                    ]}
                                    onPress={() => isCurrentMonth && !isDateHoliday && handleDatePress(date)}
                                    disabled={!isCurrentMonth || isDateHoliday}
                                >
                                    <Text style={[
                                        styles.dayCellText,
                                        !isCurrentMonth && styles.dayCellTextInactive,
                                        isDateHoliday && isCurrentMonth && styles.dayCellTextHoliday,
                                        isSelected && styles.dayCellTextSelected,
                                        isTodayInCurrentMonth && styles.dayCellTextToday
                                    ]}>
                                        {date.date()}
                                    </Text>
                                    {hasAvailability && isCurrentMonth && !isDateHoliday && (
                                        <View style={styles.availabilityDot} >
                                            <Text style={{ fontSize: 10, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 17 : 15, color: '#fff' }}>{'1'}</Text>
                                        </View>
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
        const { width: screenWidth } = Dimensions.get('window');
        const timeColumnWidth = 50;
        const dayColumnWidth = (screenWidth - timeColumnWidth) / 8;
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
                            <View style={[styles.timeColumn, { width: timeColumnWidth }]}>
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
                                    <View key={index} style={[styles.dayColumn, { width: dayColumnWidth }]}>
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
                                                const top = startHour * 30 + (startMinute * 30 / 40);
                                                const height = ((endHour * 40 + endMinute) - (startHour * 40 + startMinute)) * 30 / 40;

                                                const startHourAMPM = startHour % 12 === 0 ? 12 : startHour % 12;
                                                const endHourAMPM = endHour % 12 === 0 ? 12 : endHour % 12;

                                                const startHourAMPMText = startHourAMPM < 10 ? `0${startHourAMPM}` : startHourAMPM;
                                                const endHourAMPMText = endHourAMPM < 10 ? `0${endHourAMPM}` : endHourAMPM;

                                                const startMinuteText = startMinute < 10 ? `0${startMinute}` : startMinute;
                                                const endMinuteText = endMinute < 10 ? `0${endMinute}` : endMinute;

                                                const period = startHour < 12 ? 'AM' : 'PM';
                                                const endPeriod = endHour < 12 ? 'AM' : 'PM';

                                                return (
                                                    <View
                                                        key={slotIndex}
                                                        style={[
                                                            styles.availabilityBlock,
                                                            { top, height }
                                                        ]}
                                                    >
                                                        <Text style={styles.availabilityBlockText}>{`${startHourAMPMText}:${startMinuteText} ${period} - ${endHourAMPMText}:${endMinuteText} ${endPeriod}`}</Text>
                                                    </View>
                                                );
                                            })}
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <View key={i} style={[styles.hourLine, { top: i * 30 }]} />
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
                                <View key={i} style={[styles.hourLine, { top: i * 30 }]} />
                            ))}
                            {!isDayHoliday && slots.map((slot, slotIndex) => {
                                const startHour = parseInt(slot.StartTime.split(':')[0]);
                                const endHour = parseInt(slot.EndTime.split(':')[0]);
                                const startMinute = parseInt(slot.StartTime.split(':')[1]);
                                const endMinute = parseInt(slot.EndTime.split(':')[1]);
                                const top = startHour * 30 + (startMinute * 30 / 40);
                                const height = ((endHour * 40 + endMinute) - (startHour * 40 + startMinute)) * 30 / 40;

                                const startHourAMPM = startHour % 12 === 0 ? 12 : startHour % 12;
                                const endHourAMPM = endHour % 12 === 0 ? 12 : endHour % 12;

                                const startHourAMPMText = startHourAMPM < 10 ? `0${startHourAMPM}` : startHourAMPM;
                                const endHourAMPMText = endHourAMPM < 10 ? `0${endHourAMPM}` : endHourAMPM;

                                const startMinuteText = startMinute < 10 ? `0${startMinute}` : startMinute;
                                const endMinuteText = endMinute < 10 ? `0${endMinute}` : endMinute;

                                const period = startHour < 12 ? 'AM' : 'PM';
                                const endPeriod = endHour < 12 ? 'AM' : 'PM';

                                return (
                                    <View
                                        key={slotIndex}
                                        style={[
                                            styles.dayAvailabilityBlockAbs,
                                            { top, height }
                                        ]}
                                    >
                                        <Text style={styles.dayAvailabilityText}>{`${startHourAMPMText}:${startMinuteText} ${period} - ${endHourAMPMText}:${endMinuteText} ${endPeriod}`}</Text>
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
                    {availability.length > 0 && <TouchableOpacity onPress={handleCopyToNextMonth}>
                        <Text style={styles.copyToNextMonth}>Copy to Next Month</Text>
                    </TouchableOpacity>}
                </View>

                {renderSelectionInfo()}
                {showCustomStartPicker && (
                    <View style={Platform.OS === 'ios' ? [styles.datePickerContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }] : null}>
                        <DateTimePicker
                            value={(customStartDate || moment()).toDate()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleCustomStartChange}
                            textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                            themeVariant={isDarkMode ? 'dark' : 'light'}
                        />
                    </View>
                )}
                {showCustomEndPicker && (
                    <View style={Platform.OS === 'ios' ? [styles.datePickerContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }] : null}>
                        <DateTimePicker
                            value={(customEndDate || moment()).toDate()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleCustomEndChange}
                            textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                            themeVariant={isDarkMode ? 'dark' : 'light'}
                        />
                    </View>
                )}

                <View style={[styles.timeInput, timeErrors.start && styles.inputError]}>
                    <TouchableOpacity
                        style={{ flex: 1, justifyContent: 'center' }}
                        activeOpacity={0.7}
                        onPress={() => {
                            setShowStartTimePicker(!showStartTimePicker);
                            setShowEndTimePicker(false);
                        }}
                    >
                        <Text style={styles.dateInputText}>
                            {startTime || 'Start Time'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.timeInput, timeErrors.end && styles.inputError]}>
                    <TouchableOpacity
                        style={{ flex: 1, justifyContent: 'center' }}
                        activeOpacity={0.7}
                        onPress={() => {
                            setShowEndTimePicker(!showEndTimePicker);
                            setShowStartTimePicker(false);
                        }}
                    >
                        <Text style={styles.dateInputText}>
                            {endTime || 'End Time'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showStartTimePicker && (
                    <View style={Platform.OS === 'ios' ? [styles.datePickerContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }] : null}>
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
                            textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                            themeVariant={isDarkMode ? 'dark' : 'light'}
                        />
                    </View>
                )}

                {showEndTimePicker && (
                    <View style={Platform.OS === 'ios' ? [styles.datePickerContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }] : null}>
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
                            textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                            themeVariant={isDarkMode ? 'dark' : 'light'}
                        />
                    </View>
                )}

                <View style={styles.scheduleButtons}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={editSlots ? handleUpdate : handleSave}
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
                    {availability.length > 0 ? availability.map((slot, index) => {
                        const startHour = parseInt(slot.StartTime.split(':')[0]);
                        const endHour = parseInt(slot.EndTime.split(':')[0]);
                        const startMinute = parseInt(slot.StartTime.split(':')[1]);
                        const endMinute = parseInt(slot.EndTime.split(':')[1]);

                        const startHourAMPM = startHour % 12 === 0 ? 12 : startHour % 12;
                        const endHourAMPM = endHour % 12 === 0 ? 12 : endHour % 12;

                        const startHourAMPMText = startHourAMPM < 10 ? `0${startHourAMPM}` : startHourAMPM;
                        const endHourAMPMText = endHourAMPM < 10 ? `0${endHourAMPM}` : endHourAMPM;

                        const startMinuteText = startMinute < 10 ? `0${startMinute}` : startMinute;
                        const endMinuteText = endMinute < 10 ? `0${endMinute}` : endMinute;

                        const period = startHour < 12 ? 'AM' : 'PM';
                        const endPeriod = endHour < 12 ? 'AM' : 'PM';

                        return (
                            <View key={index} style={styles.markedSlot}>
                                <Text style={styles.markedSlotTime}>{`${startHourAMPMText}:${startMinuteText} ${period} - ${endHourAMPMText}:${endMinuteText} ${endPeriod}`}</Text>
                                <Text style={styles.markedSlotDate}>
                                    {moment(slot.start).format('YYYY-MM-DD')} - {moment(slot.end).format('YYYY-MM-DD')}
                                </Text>
                                <View style={styles.markedSlotActions}>
                                    <TouchableOpacity onPress={() => handleEditButton(slot)}>
                                        <MaterialIcons name="edit" size={20} color="#666" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(slot)}>
                                        <MaterialIcons name="delete" size={20} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }) : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, color: '#666' }}>Data not found</Text>
                    </View>}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mainContent}>
                        <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                resizeMode='contain'
                                source={Data?.CatServiceServeTypeId == 1
                                    ? require('../../assets/icons/RemoteConsultant.png')
                                    : require('../../assets/icons/HomeVisit.png')}
                                style={{ width: 50, height: 50 }}
                            />
                            <Text style={{ fontSize: 15, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, color: '#666' }}>
                                {Data?.CatServiceServeTypeId == 1
                                    ? `Online Consultation Business Hours`
                                    : `Home Visit Business Hours`}
                            </Text>
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
            </View>
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
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginLeft: 4,
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
        marginBottom: 12,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 15,
        columnGap: 8,
    },
    dayCard: {
        backgroundColor: '#e4f1ef',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dayText: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
        marginBottom: 8,
    },
    businessHoursCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    monthYearText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    viewModeContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
    dayCellToday: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    dayCellText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#00A896',
    },
    dayCellTextToday: {
        color: '#00A896',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    availabilityDot: {
        position: 'absolute',
        bottom: 4,
        width: 15,
        height: 15,
        borderRadius: 15,
        backgroundColor: '#00A896',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekViewContainer: {
        marginBottom: 16,
        height: 400,
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
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    timelineContainer: {
        flexDirection: 'row',
        paddingBottom: 20,
    },
    timeColumn: {
        width: 40,
    },
    dayHeaderSpacer: {
        height: 40,
    },
    timeSlot: {
        height: 30,
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    timeLabel: {
        fontSize: 10,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        textAlign: 'right',
        paddingRight: 4,
    },
    dayColumn: {
        width: 40,
    },
    dayHeader: {
        height: 40,
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#00A896',
    },
    dayHeaderDate: {
        fontSize: 11,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    dayHeaderTextHoliday: {
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    daySlots: {
        position: 'relative',
        height: 24 * 30, // Reduced from 60 to 50 per hour
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    dayViewContainer: {
        marginBottom: 16,
        height: 450,
    },
    dayViewTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#00A896',
        textAlign: 'center',
        marginBottom: 12,
    },
    dayViewTitleHoliday: {
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        height: 24 * 30,
    },
    dayTimeline: {
        flexDirection: 'column',
        paddingBottom: 20,
    },
    dayTimeSlot: {
        flexDirection: 'row',
        height: 30,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    dayTimeLabel: {
        width: 40,
        fontSize: 10,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
    },
    copyToNextMonth: {
        fontSize: 16,
        color: '#0f0f0f',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    selectedMonthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    dateRangeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dateInputGroup: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
        marginBottom: 6,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    dateInputText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    selectedMonthText: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    selectedMonthTextValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    markedSlotsSection: {
        marginTop: 20,
    },
    markedSlotsTitle: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0f0f0f',
        flex: 1,
    },
    markedSlotDate: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    markedSlotActions: {
        flexDirection: 'row',
        gap: 12,
    },
    datePickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 8,
    },
});

export default BusinessHours
