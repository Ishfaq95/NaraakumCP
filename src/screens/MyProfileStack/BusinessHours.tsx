import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Alert, ActivityIndicator, Image, useColorScheme, Dimensions, Modal } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
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
import FullScreenLoader from '../../components/FullScreenLoader';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import CommonRadioButton from '../../components/common/CommonRadioButton';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Dropdown from '../../components/common/Dropdown';

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
    const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
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
    const [isSaving, setIsSaving] = useState(false);
    const [timeErrors, setTimeErrors] = useState({ start: false, end: false, date: false });
    const [customStartDate, setCustomStartDate] = useState<moment.Moment | null>(null);
    const [customEndDate, setCustomEndDate] = useState<moment.Moment | null>(null);
    const [showCustomStartPicker, setShowCustomStartPicker] = useState(false);
    const [showCustomEndPicker, setShowCustomEndPicker] = useState(false);
    const [editSlots, setEditSlots] = useState<any>(null);
    
    // iOS modal states for date pickers
    const [showCustomStartDateModal, setShowCustomStartDateModal] = useState(false);
    const [showCustomEndDateModal, setShowCustomEndDateModal] = useState(false);
    
    // Temporary values for iOS pickers
    const [tempCustomStartDate, setTempCustomStartDate] = useState<Date | null>(null);
    const [tempCustomEndDate, setTempCustomEndDate] = useState<Date | null>(null);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Start time options: 12:00 AM to 11:00 PM with 1-hour intervals (24 options, no 11:59 PM)
    const startTimeOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const period = i < 12 ? 'AM' : 'PM';
        const timeString = `${hour}:00 ${period}`;
        return {
            label: timeString,
            value: timeString
        };
    });
    
    // End time options: Include 11:59 PM as the last option for end time only
    const endTimeOptions = [
        ...startTimeOptions,
        {
            label: '11:59 PM',
            value: '11:59 PM'
        }
    ];
    const [isLoading, setIsLoading] = useState(false);
    const [enableConfirmationModal, setEnableConfirmationModal] = useState(false);
    const [conflictBottomSheetVisible, setConflictBottomSheetVisible] = useState(false);
    const [conflictResolution, setConflictResolution] = useState<'keepPrevious' | 'saveNew'>('saveNew');
    const [conflictingSlots, setConflictingSlots] = useState<any[]>([]);
    const [copyToNextMonthModalVisible, setCopyToNextMonthModalVisible] = useState(false);
    const [slotsInfoModalVisible, setSlotsInfoModalVisible] = useState(false);
    const [selectedDateSlots, setSelectedDateSlots] = useState<any[]>([]);
    const [selectedDateForInfo, setSelectedDateForInfo] = useState<moment.Moment | null>(null);
    const [deleteConfirmationModalVisible, setDeleteConfirmationModalVisible] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<any>(null);
    const [deleteResolution, setDeleteResolution] = useState<'original' | 'day'>('original');

    const addServiceProviderHolidays = async (daysState: { [key: number]: boolean }) => {


        const dayText = daysOfWeek.map((day, index) => {
            return {
                Day: day,
                IsActive: daysState[index]
            }
        });

        setIsLoading(true);
        const payload = {
            ServiceProviderId: user?.Id,
            Days: dayText.filter(d => !d.IsActive).map(d => d.Day).join(',')
        };

        try {

            const response = await profileService.addServiceProviderHolidays(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                getServiceProviderHolidays();
                getServiceProviderAvailability(selectedMonth);
                // showAlert({
                //     title: response?.ResponseStatus?.MESSAGE,
                //     message: '',
                //     type: 'success',
                // });
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
            // Calculate what the updated state would be
            const updated = {
                ...prev,
                [dayIndex]: !prev[dayIndex],
            };

            // Check if at least one day would remain active
            const dayText = daysOfWeek.map((day, index) => {
                return {
                    Day: day,
                    IsActive: updated[index]
                }
            });

            const activeDays = dayText.filter(d => d.IsActive == true);

            // If no active days would remain, show alert and don't update state
            if (activeDays.length == 0) {
                showAlert({
                    title: 'Please select at least one day',
                    message: '',
                    type: 'warning',
                });
                return prev; // Return previous state without updating
            }

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

    const getAvailabilitySlotsCount = (date: moment.Moment) => {
        // Get the count of slots for a specific date
        return getAvailabilitySlotsForDate(date).length;
    };

    const formatDisplayDate = (date: moment.Moment | null) => date ? date.format('DD/MM/YYYY') : '';

    const handleCustomStartChange = (_event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowCustomStartPicker(false);
            if (_event.type === 'set' && date) {
                const mDate = moment(date);
                setCustomStartDate(mDate);
                if (!customEndDate || mDate.isAfter(customEndDate)) {
                    setCustomEndDate(mDate);
                }
                setSelectedDate(mDate);
                setSelectedMonth(mDate.clone().startOf('month'));
            }
        } else {
            // iOS - this is called from the Done button
            if (date) {
                const mDate = moment(date);
                setCustomStartDate(mDate);
                if (!customEndDate || mDate.isAfter(customEndDate)) {
                    setCustomEndDate(mDate);
                }
                setSelectedDate(mDate);
                setSelectedMonth(mDate.clone().startOf('month'));
            }
        }
    };

    const handleCustomEndChange = (_event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowCustomEndPicker(false);
            if (_event.type === 'set' && date) {
                const mDate = moment(date);
                if (customStartDate && mDate.isBefore(customStartDate)) {
                    return;
                }
                setCustomEndDate(mDate);
                setSelectedDate(mDate);
                setSelectedMonth(mDate.clone().startOf('month'));
            }
        } else {
            // iOS - this is called from the Done button
            if (date) {
                const mDate = moment(date);
                if (customStartDate && mDate.isBefore(customStartDate)) {
                    return;
                }
                setCustomEndDate(mDate);
                setSelectedDate(mDate);
                setSelectedMonth(mDate.clone().startOf('month'));
            }
        }
    };


    const renderSelectionInfo = () => {
        if (viewMode === 'Custom') {
            return (
                <View style={styles.dateRangeRow}>
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>Start Date</Text>
                        <TouchableOpacity style={[styles.dateInput, timeErrors.date && styles.inputError]} onPress={() => {
                            if (Platform.OS === 'ios') {
                                setTempCustomStartDate(customStartDate ? customStartDate.toDate() : new Date());
                                setShowCustomStartDateModal(true);
                            } else {
                                setShowCustomStartPicker(!showCustomStartPicker);
                                setShowCustomEndPicker(false);
                            }
                        }}>
                            <Text style={styles.dateInputText}>{formatDisplayDate(customStartDate) || 'Select start date'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>End Date</Text>
                        <TouchableOpacity style={[styles.dateInput, timeErrors.date && styles.inputError]} onPress={() => {
                            if (Platform.OS === 'ios') {
                                setTempCustomEndDate(customEndDate ? customEndDate.toDate() : new Date());
                                setShowCustomEndDateModal(true);
                            } else {
                                setShowCustomEndPicker(!showCustomEndPicker);
                                setShowCustomStartPicker(false);
                            }
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
                        Selected Week is: <Text style={styles.selectedMonthTextValue}>{start.format('DD/MM/YYYY')} - {end.format('DD/MM/YYYY')}</Text>
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.selectedMonthRow}>
                <MaterialIcons name="calendar-today" size={20} color="#00A896" />
                <Text style={styles.selectedMonthText}>
                    Selected Date is: <Text style={styles.selectedMonthTextValue}>{selectedDate.format('DD/MM/YYYY')}</Text>
                </Text>
            </View>
        );
    };

    const handleDatePress = (date: moment.Moment) => {
        const slotsCount = getAvailabilitySlotsCount(date);
        
        // If count is greater than 1, show info modal with slot times
        if (slotsCount > 1) {
            const slots = getAvailabilitySlotsForDate(date);
            setSelectedDateSlots(slots);
            setSelectedDateForInfo(date);
            setSlotsInfoModalVisible(true);
        } else {
            // Normal behavior for single or no slots
            setIsLoading(true);
            setSelectedDate(date);
            setHasUserSelectedDate(true); // Mark that user has selected a date
            // Clear previous selection and set only the new selected date
            setSelectedDates([date]);
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (slot: any) => {
        setSlotToDelete(slot);
        setDeleteConfirmationModalVisible(true);
    };

    const handleDelete = async () => {
        if (!slotToDelete) return;
        
        setDeleteConfirmationModalVisible(false);
        try {
            setIsLoading(true);
            
            let deleteStartDate: moment.Moment;
            let deleteEndDate: moment.Moment;
            
            if (deleteResolution === 'day') {
                // Delete only the selected day
                const dayOption = deleteOptions.find(opt => opt.type === 'day');
                if (dayOption) {
                    const dayMoment = moment(dayOption.dateText);
                    deleteStartDate = dayMoment.clone().startOf('day');
                    deleteEndDate = dayMoment.clone().startOf('day');
                } else {
                    // Fallback to original if day option not found
                    deleteStartDate = moment(slotToDelete.StartDate);
                    deleteEndDate = moment(slotToDelete.EndDate);
                }
            } else {
                // Delete the original slot
                deleteStartDate = moment(slotToDelete.StartDate);
                deleteEndDate = moment(slotToDelete.EndDate);
            }
            
            const payload = {
                "ServiceProviderAvailabilityIds": slotToDelete.IDs,
                "filter": deleteResolution === 'day' ? "singledate" : "fullslot",
                "StartDate": deleteStartDate.format("YYYY-MM-DD"),
                "EndDate": deleteEndDate.format("YYYY-MM-DD"),
                "CatServiceServeTypeId": Data?.CatServiceServeTypeId
            };
            const response = await profileService.deleteServiceProviderAvailability(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                showAlert({
                    title: "Slot has been deleted successfully",
                    message: '',
                    type: 'success',
                });
                getServiceProviderAvailability(selectedMonth);
            }
        } catch (error) {

        } finally {
            setIsLoading(false);
            setSlotToDelete(null);
            setDeleteResolution('original');
        }
    };

    const handleEditButton = (slot: any) => {
        const startTimeStr = moment(slot.StartTime, 'HH:mm').format('h:mm A');
        const endTimeStr = moment(slot.EndTime, 'HH:mm').format('h:mm A');
        setStartTime(startTimeStr);
        setEndTime(endTimeStr);
        setEditSlots(slot);
        if (slot.CatAvailabilityTypeId == 4) {
            setViewMode('Custom');
            const startDate = moment(slot.StartDate);
            const endDate = moment(slot.EndDate);
            setCustomStartDate(startDate);
            setCustomEndDate(endDate);
            // Initialize temp values for iOS date pickers
            setTempCustomStartDate(startDate.toDate());
            setTempCustomEndDate(endDate.toDate());
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
        setCopyToNextMonthModalVisible(false);
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
        setIsLoading(true);
        try {
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
                setIsLoading(false);
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
                if (response?.StatusCode?.STATUSCODE == 11001) {
                    setConflictBottomSheetVisible(true);
                    setConflictingSlots(response?.Data);
                    return;
                }
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
        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    };

    const onClickSave = async () => {
        const hasStart = !!startTime;
        const hasEnd = !!endTime;

        if (!hasStart || !hasEnd) {
            setTimeErrors(prev => ({ ...prev, start: !hasStart, end: !hasEnd }));
            return;
        }

        setEnableConfirmationModal(true);
    }

    const handleSave = async () => {
        setEnableConfirmationModal(false);
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

        try {

            setIsLoading(true);
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
                if (response?.StatusCode?.STATUSCODE == 11001) {
                    setConflictBottomSheetVisible(true);
                    setConflictingSlots(response?.Data);
                    return;
                }
                setStartTime('');
                setEndTime('');
                setSelectedDates([]);
                setEditSlots(null);
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

    const handleClear = () => {
        setStartTime('');
        setEndTime('');
        setSelectedDates([]);
        setEditSlots(null);
    };

    const formatTimeForDisplay = (time: string) => {
        if (!time) return '';
        return moment(time, 'HH:mm:ss').format('h:mm A');
    };

    const renderDateTimePicker = (
        type: 'date' | 'time',
        value: Date,
        tempValue: Date | null,
        setTempValue: (date: Date) => void,
        onChange: (event: any, date?: Date) => void,
        showModal: boolean,
        setShowModal: (show: boolean) => void,
        label: string,
        minimumDate?: Date,
        maximumDate?: Date
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
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                                <TouchableOpacity onPress={() => {
                                    // Reset temp value on cancel
                                    setTempValue(value);
                                    setShowModal(false);
                                }}>
                                    <Text style={[styles.cancelButtonText, isDarkMode && styles.cancelButtonTextDark]}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>{label}</Text>
                                <TouchableOpacity onPress={() => {
                                    // Apply the temp value when Done is clicked
                                    onChange({ type: 'set' }, displayValue);
                                    setShowModal(false);
                                }}>
                                    <Text style={[styles.doneButtonText, isDarkMode && styles.doneButtonTextDark]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.modalDatePickerContainer, isDarkMode && styles.modalDatePickerContainerDark]}>
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
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
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

    const renderHeader = () => (
        <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: '#eee' }]}>
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
                            thumbColor={'#fff'}
                            style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] } : {}}
                        />
                    </View>
                ))}
            </View>
            <View style={{ height: 1, backgroundColor: '#eee', marginTop: 20 }} />
        </View>
    );

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        setHasUserSelectedDate(false); // Reset flag when view mode changes
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
        setHasUserSelectedDate(false); // Reset flag when navigating
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
        setHasUserSelectedDate(false); // Reset flag when navigating
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
            return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
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
                            const slotsCount = getAvailabilitySlotsCount(date);
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
                                    {hasAvailability && isCurrentMonth && !isDateHoliday && slotsCount > 0 && (
                                        <View style={styles.availabilityDot} >
                                            <Text style={{ fontSize: 10, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 17 : 15, color: '#fff' }}>{slotsCount}</Text>
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
                        {startOfWeek.format('DD/MM/YYYY')}
                    </Text>
                    <Text style={styles.weekDateRangeText}> - </Text>
                    <Text style={styles.weekDateRangeText}>
                        {startOfWeek.clone().add(6, 'days').format('DD/MM/YYYY')}
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

    const handleRemoveConflict = async () => {
        setIsLoading(true);
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

        const startTime24 = moment(startTime, 'h:mm A').format('HH:mm');
        const endTime24 = moment(endTime, 'h:mm A').format('HH:mm');
        try {
            const payload = {
                OrganizationId: user?.OrganizationId || Data?.OrganizationId,
                UserLoginInfoId: user?.Id,
                StartDate: payloadStartDate?.format('YYYY-MM-DD'),
                EndDate: payloadEndDate?.format('YYYY-MM-DD'),
                StartTime: startTime24,
                EndTime: endTime24,
                CatAvailabilityTypeId: catAvailabilityTypeId.toString(),
                CatServiceServeTypeId: Data?.CatServiceServeTypeId,
                IskeepPrevious: conflictResolution === 'keepPrevious' ? 1 : 0,
            }
            const response = await profileService.serviceProviderAvailabilityRemoveConflict(payload);
            if (response?.ResponseStatus?.STATUSCODE == 200) {
                getServiceProviderAvailability(selectedMonth);
                showAlert({
                    title: response?.ResponseStatus?.MESSAGE,
                    message: '',
                    type: 'success',
                });
            }
        }
        catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    const checkOffDay = () => {
        if (viewMode == 'Day') {
            // Check if selected day is a past day
            if (selectedDate.isBefore(moment(), 'day')) {
                return true;
            }
            // Check if selected day is in business days
            if (businessDays[selectedDate.day()]) {
                return false;
            } else {
                return true;
            }
        } else if (viewMode == 'Month') {
            // Check if selected month is a past month
            if (selectedMonth.isBefore(moment(), 'month')) {
                return true;
            }
            return false;
        } else if (viewMode == 'Week') {
            // Check if selected week is a past week (check if end of week is before current week)
            const weekEnd = selectedDate.clone().endOf('week');
            const currentWeekEnd = moment().endOf('week');
            if (weekEnd.isBefore(currentWeekEnd, 'day')) {
                return true;
            }
            return false;
        } else {
            return false;
        }
    }

    // Get filtered end time options based on selected start time
    const getEndTimeOptions = useMemo(() => {
        if (!startTime) {
            return endTimeOptions;
        }
        
        const startIndex = startTimeOptions.findIndex(option => option.value === startTime);
        if (startIndex === -1) {
            return endTimeOptions;
        }
        
        // Minimum end time is start time + 1 hour (next index in startTimeOptions)
        const minEndIndex = startIndex + 1;
        
        // Maximum end time is 11:59 PM (last index in endTimeOptions)
        const maxEndIndex = endTimeOptions.length - 1;
        
        // If start time + 1 hour would exceed 11:59 PM (go to next day), return empty array
        if (minEndIndex > maxEndIndex) {
            return [];
        }
        
        // Return options from minEndIndex to maxEndIndex (must be at least 1 hour after start time)
        return endTimeOptions.slice(minEndIndex, maxEndIndex + 1);
    }, [startTime]);

    const renderScheduleSection = () => {
        return (
            <View style={styles.scheduleSection}>
                <View style={styles.scheduleTitleRow}>
                    <Text style={styles.scheduleTitle}>Schedule</Text>
                    {availability.length > 0 && <TouchableOpacity onPress={() => setCopyToNextMonthModalVisible(true)}>
                        <Text style={styles.copyToNextMonth}>Copy to Next Month</Text>
                    </TouchableOpacity>}
                </View>

                {renderSelectionInfo()}
                {Platform.OS === 'android' && showCustomStartPicker && (
                    <DateTimePicker
                        value={tempCustomStartDate || (customStartDate ? customStartDate.toDate() : new Date())}
                        mode="date"
                        display="default"
                        onChange={handleCustomStartChange}
                    />
                )}
                {Platform.OS === 'android' && showCustomEndPicker && (
                    <DateTimePicker
                        value={tempCustomEndDate || (customEndDate ? customEndDate.toDate() : new Date())}
                        mode="date"
                        display="default"
                        onChange={handleCustomEndChange}
                    />
                )}

                <View style={[styles.timeInput, timeErrors.start && styles.inputError]}>
                    <Dropdown
                        data={startTimeOptions}
                        value={startTime}
                        onChange={(value) => {
                            setStartTime(value as string);
                            setTimeErrors(prev => ({ ...prev, start: false }));
                        }}
                        placeholder="Start Time"
                        containerStyle={styles.timeDropdownContainer}
                        dropdownStyle={styles.timeDropdown}
                        error={timeErrors.start}
                    />
                </View>

                <View style={[styles.timeInput, timeErrors.end && styles.inputError, !startTime && styles.timeInputDisabled]}>
                    <Dropdown
                        data={getEndTimeOptions}
                        value={endTime}
                        onChange={(value) => {
                            setEndTime(value as string);
                            setTimeErrors(prev => ({ ...prev, end: false }));
                        }}
                        placeholder="End Time"
                        containerStyle={styles.timeDropdownContainer}
                        dropdownStyle={styles.timeDropdown}
                        disabled={!startTime}
                        error={timeErrors.end}
                    />
                </View>


                {!checkOffDay() ? <View style={styles.scheduleButtons}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={editSlots ? handleUpdate : onClickSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{editSlots ? 'Update' : 'Save'}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClear}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View> :
                    <View style={styles.scheduleButtons}>
                        <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, color: '#dc3545' }}>Schedule in previous date is not allowed </Text>
                    </View>}

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
                            <View key={index} style={[styles.markedSlot, editSlots?.IDs == slot?.IDs ? { backgroundColor: '#b8b5b5' } : {}]}>
                                <Text style={styles.markedSlotTime}>{`${startHourAMPMText}:${startMinuteText} ${period} - ${endHourAMPMText}:${endMinuteText} ${endPeriod}`}</Text>
                                <Text style={styles.markedSlotDate}>
                                    {moment(slot.start).format('DD/MM/YYYY')} - {moment(slot.end).format('DD/MM/YYYY')}
                                </Text>
                                <View style={styles.markedSlotActions}>
                                    <TouchableOpacity onPress={() => handleEditButton(slot)}>
                                        <MaterialIcons name="edit" size={20} color="#666" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteClick(slot)}>
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

    const getDeleteSlotDisplayInfo = () => {
        if (!slotToDelete) return null;
        
        const catAvailabilityTypeId = slotToDelete.CatAvailabilityTypeId;
        const startDate = moment(slotToDelete.StartDate);
        const endDate = moment(slotToDelete.EndDate);
        const startTime = slotToDelete.StartTime || '';
        const endTime = slotToDelete.EndTime || '';
        
        // Format time to AM/PM format
        const formatTimeToAMPM = (time: string) => {
            if (!time) return '';
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return time;
            
            const hour12 = hours % 12 === 0 ? 12 : hours % 12;
            const period = hours < 12 ? 'AM' : 'PM';
            const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
            return `${hour12}:${minuteStr} ${period}`;
        };
        
        // Format time range
        const formatTimeRange = () => {
            const startTimeFormatted = formatTimeToAMPM(startTime);
            const endTimeFormatted = formatTimeToAMPM(endTime);
            if (startTimeFormatted && endTimeFormatted) {
                return `${startTimeFormatted}-${endTimeFormatted}`;
            }
            return '';
        };
        
        const timeRange = formatTimeRange();
        
        if (catAvailabilityTypeId == 4) {
            // Custom Range
            const dateRange = `${startDate.format('DD/MM/YYYY')} To ${endDate.format('DD/MM/YYYY')}`;
            const dateText = timeRange ? `${timeRange} AT ${dateRange}` : dateRange;
            return {
                type: 'Custom Range',
                dateText: dateText
            };
        } else if (catAvailabilityTypeId == 3) {
            // Month
            const dateRange = `${startDate.format('DD/MM/YYYY')} To ${endDate.format('DD/MM/YYYY')}`;
            const dateText = timeRange ? `${timeRange} AT ${dateRange}` : dateRange;
            return {
                type: 'Month',
                dateText: dateText
            };
        } else if (catAvailabilityTypeId == 2) {
            // Week
            const weekStart = startDate.clone().startOf('week');
            const weekEnd = startDate.clone().endOf('week');
            const dateRange = `${weekStart.format('DD/MM/YYYY')} To ${weekEnd.format('DD/MM/YYYY')}`;
            const dateText = timeRange ? `${timeRange} AT ${dateRange}` : dateRange;
            return {
                type: 'Week',
                dateText: dateText
            };
        } else if (catAvailabilityTypeId == 1) {
            // Day
            const dateStr = startDate.format('DD/MM/YYYY');
            const dateText = timeRange ? `${timeRange} AT ${dateStr}` : dateStr;
            return {
                type: 'Day',
                dateText: dateText
            };
        }
        return null;
    };

    // Get delete options based on slot month and selected date
    const getDeleteOptions = () => {
        if (!slotToDelete) return [];
        
        const slotStartDate = moment(slotToDelete.StartDate);
        const slotEndDate = moment(slotToDelete.EndDate);
        const currentMonth = moment();
        const isCurrentMonth = slotStartDate.isSame(currentMonth, 'month');
        
        const options: Array<{ type: 'original' | 'day', label: string, dateText: string }> = [];
        
        // Always show the original slot type
        const originalInfo = getDeleteSlotDisplayInfo();
        if (originalInfo) {
            options.push({
                type: 'original',
                label: originalInfo.type,
                dateText: originalInfo.dateText
            });
        }
        
        // Helper function to check if a date is within the slot's range
        const isDateInSlotRange = (date: moment.Moment) => {
            return date.isBetween(slotStartDate, slotEndDate, 'day', '[]');
        };
        
        // Format time to AM/PM format (helper function)
        const formatTimeToAMPM = (time: string) => {
            if (!time) return '';
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return time;
            
            const hour12 = hours % 12 === 0 ? 12 : hours % 12;
            const period = hours < 12 ? 'AM' : 'PM';
            const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
            return `${hour12}:${minuteStr} ${period}`;
        };
        
        // Format time range for Day option
        const formatDayTimeRange = () => {
            if (!slotToDelete) return '';
            const startTime = slotToDelete.StartTime || '';
            const endTime = slotToDelete.EndTime || '';
            const startTimeFormatted = formatTimeToAMPM(startTime);
            const endTimeFormatted = formatTimeToAMPM(endTime);
            if (startTimeFormatted && endTimeFormatted) {
                return `${startTimeFormatted}-${endTimeFormatted}`;
            }
            return '';
        };
        
        // Conditionally show Day option
        let showDayOption = false;
        let dayDateText = '';
        const dayTimeRange = formatDayTimeRange();
        
        if (isCurrentMonth) {
            // Slot is in current month
            // If user has selected a date from calendar and it's in range, use selected date
            if (hasUserSelectedDate && selectedDate && isDateInSlotRange(selectedDate)) {
                showDayOption = true;
                const dateStr = selectedDate.format('DD/MM/YYYY');
                dayDateText = dayTimeRange ? `${dayTimeRange} AT ${dateStr}` : dateStr;
            } else {
                // Otherwise, use current date if it's in range
                const currentDate = moment();
                if (isDateInSlotRange(currentDate)) {
                    showDayOption = true;
                    const dateStr = currentDate.format('DD/MM/YYYY');
                    dayDateText = dayTimeRange ? `${dayTimeRange} AT ${dateStr}` : dateStr;
                }
            }
        } else {
            // Slot is NOT in current month
            // Only show Day if user has selected a date from calendar AND it's in range
            if (hasUserSelectedDate && selectedDate && isDateInSlotRange(selectedDate)) {
                showDayOption = true;
                const dateStr = selectedDate.format('DD/MM/YYYY');
                dayDateText = dayTimeRange ? `${dayTimeRange} AT ${dateStr}` : dateStr;
            }
        }
        
        if (showDayOption) {
            options.push({
                type: 'day',
                label: 'Day',
                dateText: dayDateText
            });
        }
        
        return options;
    };

    const deleteSlotInfo = getDeleteSlotDisplayInfo();
    const deleteOptions = getDeleteOptions();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                    </ScrollView>
                </View>
            </View>

            <ConfirmationModal
                visible={enableConfirmationModal}
                onClose={() => setEnableConfirmationModal(false)}
                onYes={handleSave}
                onNo={() => setEnableConfirmationModal(false)}
                title="Confirmation"
                message="Are you sure you want to save schedule for month ?"
            />

            <ConfirmationModal
                visible={copyToNextMonthModalVisible}
                onClose={() => setCopyToNextMonthModalVisible(false)}
                onYes={handleCopyToNextMonth}
                onNo={() => setCopyToNextMonthModalVisible(false)}
                title="Confirmation"
                message={`Copy Slots From ${moment(selectedMonth.clone().startOf('month')).format('MMM YYYY')} To ${moment(selectedMonth.clone().add(1, 'month').endOf('month')).format('MMM YYYY')} ?`}
            />

            <CustomBottomSheet
                visible={deleteConfirmationModalVisible}
                onClose={() => {
                    setDeleteConfirmationModalVisible(false);
                    setSlotToDelete(null);
                    setDeleteResolution('original');
                }}
                showHandle={false}
                maxHeight={"50%"}
                backdropClickable={true}
            >
                <View style={styles.deleteSheetContainer}>
                    {/* Title */}
                    <Text style={styles.deleteTitle}>Confirmation</Text>
                    
                    {/* Message */}
                    <Text style={styles.deleteMessage}>Are you sure want to remove?</Text>
                    
                    {/* Slot Information Options */}
                    {deleteOptions.length > 0 && (
                        <View style={styles.deleteSlotInfoContainer}>
                            {deleteOptions.map((option, index) => (
                                <View key={index} style={[
                                    styles.deleteSlotInfoRow,
                                    // deleteOptions.length === 2 && styles.deleteSlotInfoRowSplit
                                ]}>
                                    <View style={styles.deleteSlotRadioWrapper}>
                                        <CommonRadioButton
                                            selected={deleteResolution === option.type}
                                            onPress={() => setDeleteResolution(option.type)}
                                            label={option.label}
                                            style={styles.deleteSlotRadioButton}
                                        />
                                        <Text style={styles.deleteSlotDateText}>
                                            {option.dateText}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.deleteButtonsContainer}>
                        <TouchableOpacity
                            style={styles.deleteConfirmButton}
                            onPress={() => {
                                setDeleteConfirmationModalVisible(false);
                                handleDelete();
                            }}
                        >
                            <Text style={styles.deleteConfirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteCancelButton}
                            onPress={() => {
                                setDeleteConfirmationModalVisible(false);
                                setSlotToDelete(null);
                                setDeleteResolution('original');
                            }}
                        >
                            <Text style={styles.deleteCancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={slotsInfoModalVisible}
                onClose={() => {
                    setSlotsInfoModalVisible(false);
                    setSelectedDateSlots([]);
                    setSelectedDateForInfo(null);
                }}
                showHandle={true}
                maxHeight={Platform.OS === 'ios' ? '50%' : "50%"}
                backdropClickable={true}
            >
                <View style={styles.slotsInfoContainer}>
                    <Text style={styles.slotsInfoTitle}>
                        Slots for {selectedDateForInfo?.format('DD/MM/YYYY')}
                    </Text>
                    <ScrollView 
                        style={styles.slotsInfoScroll}
                        showsVerticalScrollIndicator={true}
                    >
                        {selectedDateSlots.map((slot, index) => {
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
                                <View key={index} style={styles.slotInfoItem}>
                                    <View style={styles.slotInfoTimeContainer}>
                                        <Text style={styles.slotInfoTime}>
                                            {`${startHourAMPMText}:${startMinuteText} ${period} - ${endHourAMPMText}:${endMinuteText} ${endPeriod}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.slotInfoDateRange}>
                                        {moment(slot.start).format('DD/MM/YYYY')} - {moment(slot.end).format('DD/MM/YYYY')}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.slotsInfoCloseButton}
                        onPress={() => {
                            setSlotsInfoModalVisible(false);
                            setSelectedDateSlots([]);
                            setSelectedDateForInfo(null);
                        }}
                    >
                        <Text style={styles.slotsInfoCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={conflictBottomSheetVisible}
                onClose={() => {
                    setConflictBottomSheetVisible(false);
                }}
                showHandle={false}
                maxHeight={Platform.OS === 'ios' ? '80%' : "70%"}
                backdropClickable={true}
            >
                <View style={styles.conflictSheetContainer}>
                    {/* Title */}
                    <Text style={styles.conflictTitle}>Conflict Confirmation</Text>

                    {/* Warning Icon */}
                    <View style={styles.warningIconContainer}>
                        <FontAwesome6 name={'circle-exclamation'} size={64} color={'#dc3545'} />
                    </View>

                    {/* Radio Buttons */}
                    <View style={styles.radioButtonsContainer}>
                        <CommonRadioButton
                            selected={conflictResolution === 'keepPrevious'}
                            onPress={() => setConflictResolution('keepPrevious')}
                            label="Keep The Previous Slots"
                            style={styles.radioButton}
                        />
                        <CommonRadioButton
                            selected={conflictResolution === 'saveNew'}
                            onPress={() => setConflictResolution('saveNew')}
                            label="Save New Slots"
                            style={styles.radioButton}
                        />
                    </View>

                    {/* Conflicting Slots Section */}
                    <Text style={styles.conflictingSlotsTitle}>Conflicting Slots:</Text>

                    {/* Scrollable Table */}
                    <ScrollView
                        style={styles.conflictTableScroll}
                        showsVerticalScrollIndicator={true}
                    >
                        <View style={styles.conflictTable}>
                            {/* Table Header */}
                            <View style={styles.conflictTableHeader}>
                                <Text style={[styles.conflictTableHeaderText, { flex: 1.2 }]}>Start Date</Text>
                                <Text style={[styles.conflictTableHeaderText, { flex: 1.2 }]}>End Date</Text>
                                <Text style={[styles.conflictTableHeaderText, { flex: 1 }]}>Start Time</Text>
                                <Text style={[styles.conflictTableHeaderText, { flex: 1 }]}>End Time</Text>
                            </View>

                            {/* Table Rows */}
                            {conflictingSlots.map((slot, index) => (
                                <View key={index} style={styles.conflictTableRow}>
                                    <Text style={[styles.conflictTableRowText, { flex: 1.2 }]}>
                                        {moment(slot.StartDate).format('DD/MM/YYYY')}
                                    </Text>
                                    <Text style={[styles.conflictTableRowText, { flex: 1.2 }]}>
                                        {moment(slot.EndDate).format('DD/MM/YYYY')}
                                    </Text>
                                    <Text style={[styles.conflictTableRowText, { flex: 1 }]}>
                                        {moment(slot.StartTime, 'HH:mm').format('h:mm A')}
                                    </Text>
                                    <Text style={[styles.conflictTableRowText, { flex: 1 }]}>
                                        {moment(slot.EndTime, 'HH:mm').format('h:mm A')}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.conflictButtonsContainer}>
                        <TouchableOpacity
                            style={styles.conflictSaveButton}
                            onPress={() => {
                                // Handle save based on conflictResolution
                                setConflictBottomSheetVisible(false);
                                handleRemoveConflict()
                            }}
                        >
                            <Text style={styles.conflictSaveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.conflictCancelButton}
                            onPress={() => {
                                setConflictBottomSheetVisible(false);
                            }}
                        >
                            <Text style={styles.conflictCancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomBottomSheet>

            {/* iOS Date/Time Modals */}
            {renderDateTimePicker('date', customStartDate ? customStartDate.toDate() : new Date(), tempCustomStartDate, setTempCustomStartDate, handleCustomStartChange, showCustomStartDateModal, setShowCustomStartDateModal, 'Start Date')}
            {renderDateTimePicker('date', customEndDate ? customEndDate.toDate() : new Date(), tempCustomEndDate, setTempCustomEndDate, handleCustomEndChange, showCustomEndDateModal, setShowCustomEndDateModal, 'End Date')}

            <FullScreenLoader visible={isLoading} />
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
        height: 56,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        paddingHorizontal: 8,
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
        borderWidth: 1,
        borderColor: '#E0E0E0',

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
        fontFamily: CAIRO_FONT_FAMILY.bold,
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
        color: '#191919',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    availabilityDot: {
        position: 'absolute',
        bottom: 0,
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
        color: '#23A2A4',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textDecorationLine: 'underline',
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
        color: '#23A2A4',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        // padding: 12,
        marginBottom: 12,
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    timeInputDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
        opacity: 0.6,
    },
    timeDropdownContainer: {
        height: 'auto',
    },
    timeDropdown: {
        height: 'auto',
        borderWidth: 0,
        padding: 0,
    },
    dateInputTextDisabled: {
        color: '#999',
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
        backgroundColor: '#6C757D',
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
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
        color: '#000',
    },
    markedSlotActions: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 12,
    },
    datePickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 8,
    },
    conflictSheetContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    conflictTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
        color: '#000',
        marginBottom: 20,
    },
    warningIconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    warningIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonsContainer: {
        flexDirection: 'column',
        height: 100,
        gap: 12,
    },
    radioButton: {
        flex: 1,
        marginVertical: 0,
    },
    conflictingSlotsTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        textAlign: 'center',
        marginVertical: 16,
    },
    conflictTableScroll: {
        flex: 1,
        marginBottom: 20,
    },
    conflictTable: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    conflictTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    conflictTableHeaderText: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 18,
        color: '#000',
        textAlign: 'center',
    },
    conflictTableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    conflictTableRowText: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 18,
        color: '#333',
        textAlign: 'center',
    },
    conflictButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    conflictSaveButton: {
        flex: 1,
        backgroundColor: '#00A79D',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conflictSaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    conflictCancelButton: {
        flex: 1,
        backgroundColor: '#6C757D',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conflictCancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    slotsInfoContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    slotsInfoTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    slotsInfoScroll: {
        flex: 1,
        marginBottom: 16,
    },
    slotInfoItem: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#00A79D',
    },
    slotInfoTimeContainer: {
        marginBottom: 8,
    },
    slotInfoTime: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#00A79D',
    },
    slotInfoDateRange: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 18,
        color: '#666',
    },
    slotsInfoCloseButton: {
        backgroundColor: '#00A79D',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotsInfoCloseButtonText: {
        color: '#fff',
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
        color: '#00A896',
    },
    doneButtonTextDark: {
        color: '#00A896',
    },
    modalDatePickerContainer: {
        backgroundColor: '#fff',
    },
    modalDatePickerContainerDark: {
        backgroundColor: '#1C1C1E',
    },
    deleteSheetContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    deleteTitle: {
        fontSize: 20,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        color: '#000',
        marginBottom: 12,
    },
    deleteMessage: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
        color: '#333',
        marginBottom: 12,
    },
    deleteSlotInfoContainer: {
        marginBottom: 12,
        flexDirection: 'column',
        gap: 12,
    },
    deleteSlotInfoRow: {
        marginVertical: 8,
    },
    deleteSlotInfoRowSplit: {
        flex: 1,
    },
    deleteSlotRadioWrapper: {
        alignItems: 'flex-start',
    },
    deleteSlotRadioButton: {
        marginVertical: 0,
    },
    deleteSlotDateText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginTop: 8,
        marginLeft: 40,
    },
    deleteButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 0,
    },
    deleteConfirmButton: {
        flex: 1,
        backgroundColor: '#00A896',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteConfirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    deleteCancelButton: {
        flex: 1,
        backgroundColor: '#6C757D',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteCancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
});

export default BusinessHours
