import { View, Text, SafeAreaView, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { notificationsService } from '../../services/api/notifications';
import { useSelector } from 'react-redux';
import FullScreenLoader from '../../components/FullScreenLoader';
import { ROUTES } from '../../shared/utils/routes';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import Dropdown from '../../components/common/Dropdown';
import { settingService } from '../../services/api/settingService';

const ReminderTimeUnit = [
    { label: 'Minutes', value: '6' },
    { label: 'Hours', value: '5' },
    { label: 'Days', value: '1' },
];

const ReminderMinutes = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '15', value: '15' },
    { label: '30', value: '30' },
    { label: '45', value: '45' },
];

const ReminderHours = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
];

const ReminderDays = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
];

const ReminderList = () => {
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const [reminderSettingBottomSheetVisible, setReminderSettingBottomSheetVisible] = useState(false);
    const [reminderList, setReminderList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reminderTimeUnit, setReminderTimeUnit] = useState<string>('6'); // Default to minutes
    const [reminderMinutesAndHours, setReminderMinutesAndHours] = useState<string>('5'); // Default value
    const [loading, setLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        getReminderList();
    }, []);

    useEffect(() => {
        if (isFocused) {
            getReminderSettingApi()
        }
    }, [isFocused]);

    const getReminderSettingApi = async () => {
        try {
            setLoading(true);
            const payload = {
                "UserloginInfoId": user.Id,
            }
            const response = await settingService.getReminderSetting(payload);

            if (response.ResponseStatus.STATUSCODE == 200 && response.ReminderSetting && response.ReminderSetting.length > 0) {
                const reminderValues = response.ReminderSetting[0];

                // Set values from API
                setReminderTimeUnit(reminderValues.CatTimeUnitId.toString());
                setReminderMinutesAndHours(reminderValues.TimeUnitDuration.toString());
                setIsDataLoaded(true);
            } else {
                // No API data, use defaults
                setDefaultValues();
                setIsDataLoaded(true);
            }
        } catch (error) {
            // API failed, use defaults
            setDefaultValues();
            setIsDataLoaded(true);
        } finally {
            setLoading(false);
        }
    }

    const setDefaultValues = () => {
        setReminderTimeUnit('6'); // Default to minutes
        setReminderMinutesAndHours('5'); // Default to 5 minutes
    }

    console.log('reminderTimeUnit', reminderTimeUnit);
    console.log('reminderMinutesAndHours', reminderMinutesAndHours);

    const getReminderList = async () => {
        setIsLoading(true);
        try {
            const payload = {
                UserloginInfoId: user.Id,
            }
            const response = await notificationsService.getServiceProviderReminderList(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                setReminderList(response.ReminderList);
            }
        }
        catch (error) {
            console.log('Error fetching reminder list:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        // Convert "2025-11-17" to "17/11/2025"
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeString: string) => {
        // Convert "17:05" to "5:05 PM"
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const calculateReminderTime = (bookingTime: string, timeUnit: string, duration: string): string => {
        // Parse booking time (format: "HH:MM" or "12:00")
        const [bookingHours, bookingMinutes] = bookingTime.split(':').map(Number);
        
        // Create a date object for easier calculation (using today's date)
        const bookingDate = new Date();
        bookingDate.setHours(bookingHours, bookingMinutes, 0, 0);
        
        // Calculate the reminder time based on time unit
        let reminderDate = new Date(bookingDate);
        const durationValue = parseInt(duration);
        
        switch (timeUnit) {
            case '6': // Minutes
                reminderDate.setMinutes(reminderDate.getMinutes() - durationValue);
                break;
            case '5': // Hours
                reminderDate.setHours(reminderDate.getHours() - durationValue);
                break;
            case '1': // Days
                reminderDate.setDate(reminderDate.getDate() - durationValue);
                break;
            default:
                // Default to minutes
                reminderDate.setMinutes(reminderDate.getMinutes() - durationValue);
        }
        
        // Format the result back to "HH:MM" format
        const reminderHours = reminderDate.getHours().toString().padStart(2, '0');
        const reminderMinutes = reminderDate.getMinutes().toString().padStart(2, '0');
        
        return `${reminderHours}:${reminderMinutes}`;
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reminders</Text>
            </View>
            <TouchableOpacity onPress={() => {
                getReminderSettingApi();
                setReminderSettingBottomSheetVisible(true)}} style={{ borderWidth: 1, marginRight: 8, borderColor: '#14b8a6', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 16 }}>
                <Text style={{ color: '#14b8a6', fontSize: 15, fontWeight: '600', lineHeight: Platform.OS === 'ios' ? 0 : 18, fontFamily: CAIRO_FONT_FAMILY.semiBold }}>Settings</Text>
            </TouchableOpacity>
        </View>
    );

    // Get the appropriate data array based on selected time unit
    const getTimeData = (timeUnit: string) => {
        switch (timeUnit) {
            case '6': // Minutes
                return ReminderMinutes;
            case '5': // Hours
                return ReminderHours;
            case '1': // Days
                return ReminderDays;
            default:
                return ReminderMinutes;
        }
    };

    const currentTimeData = getTimeData(reminderTimeUnit);

    // Get default value based on selected time unit
    const getDefaultValue = (timeUnit: string) => {
        switch (timeUnit) {
            case '6': // Minutes
                return '5';
            case '5': // Hours
                return '1';
            case '1': // Days
                return '1';
            default:
                return '5';
        }
    };

    const updateReminderSettingApi = async () => {
        try {
            setLoading(true);
            const payload = {
                "UserloginInfoId": user.Id,
                "CatTimeUnitId": reminderTimeUnit,
                "TimeUnitDuration": reminderMinutesAndHours
            }

            const response = await settingService.updateReminderSetting(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    const onPressSaveReminderSetting = () => {
        updateReminderSettingApi();
        setReminderSettingBottomSheetVisible(false);
    }

    const onPressChangeReminderValue = (value: string | number) => {
        setReminderMinutesAndHours(value as string);
    }

    const onPressChangeReminderTimeUnit = (value: string | number) => {
        setReminderTimeUnit(value as string);
    }

    const backButtonPress = () => {
        navigation.goBack();
    };

    const handleShowDetails = (item: any) => {
        navigation.navigate(ROUTES.VisitDetailScreen as never, { taskId: item?.TaskId });
    };

    const renderReminderCard = ({ item }: { item: any }) => {
        // Calculate reminder time based on booking time and reminder settings
        const calculatedReminderTime = calculateReminderTime(
            item.SchedulingTime,
            reminderTimeUnit,
            reminderMinutesAndHours
        );
        
        return (
        <View style={styles.card}>
            <View style={styles.cardInner}>
                <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>{formatTime(calculatedReminderTime)}</Text>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.patientName}>{item.FullnamePlang.trim()}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#14b8a6" />
                        <Text style={styles.infoLabel}>Online Session Date</Text>
                        <Text style={styles.infoValue}>{formatDate(item.SchedulingDate)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#14b8a6" />
                        <Text style={styles.infoLabel}>Online Session Time</Text>
                        <Text style={styles.infoValue}>{formatTime(item.SchedulingTime)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => handleShowDetails(item)}
                    >
                        <Text style={styles.detailsButtonText}>Show Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}

                <View style={styles.scrollContent}>
                    {/* style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                > */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Today Tasks ({reminderList.length})</Text>
                    </View>

                    <FlatList
                        data={reminderList}
                        renderItem={renderReminderCard}
                        keyExtractor={(item, index) => `reminder-${item.TaskId || index}`}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshing={isLoading}
                        onRefresh={getReminderList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No reminders for today</Text>
                            </View>
                        )}
                    />

                    {/* {reminderList.map((item, index) => (
                        <View key={item.TaskId || index}>
                            {renderReminderCard({ item })}
                        </View>
                    ))} */}

                    {!isLoading && reminderList.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No reminders for today</Text>
                        </View>
                    )}
                    {/* </ScrollView> */}
                </View>
            </View>

            <CustomBottomSheet
                visible={reminderSettingBottomSheetVisible}
                onClose={() => setReminderSettingBottomSheetVisible(false)}
                // height="28%"
                maxHeight={Platform.OS === 'ios' ? 280 : 220}
                showHandle={false}
                style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden' }}
            >
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6F3F3', paddingVertical: 10, paddingHorizontal: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <Text style={{ ...globalTextStyles.buttonLarge, fontFamily: globalTextStyles.h3.fontFamily, color: '#000' }}>Reminder Settings</Text>
                        <TouchableOpacity onPress={() => setReminderSettingBottomSheetVisible(false)}>
                            <Icon name="close" size={20} color="#239EA0" />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ ...globalTextStyles.bodyMedium, fontFamily: globalTextStyles.h5.fontFamily, color: '#000', paddingHorizontal: 16, marginTop: 10 }}>Remind me before</Text>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 16 }}>
                        <View style={{ width: '48%' }}>
                            <Dropdown
                                data={currentTimeData}
                                placeholder={getDefaultValue(reminderTimeUnit)}
                                value={reminderMinutesAndHours}
                                onChange={(value: string | number) => onPressChangeReminderValue(value)}
                                containerStyle={{ height: 50 }}
                                dropdownStyle={{ height: 50 }}
                            />
                        </View>
                        <View style={{ width: '48%' }}>
                            <Dropdown
                                data={ReminderTimeUnit}
                                containerStyle={{ height: 50 }}
                                dropdownStyle={{ height: 50 }}
                                value={reminderTimeUnit}
                                onChange={(value: string | number) => onPressChangeReminderTimeUnit(value)}
                            />
                        </View>

                    </View>

                    <TouchableOpacity onPress={onPressSaveReminderSetting} style={{ backgroundColor: '#239EA0', padding: 10, borderRadius: 10, marginTop: 10, marginHorizontal: 16 }}>
                        <Text style={{ ...globalTextStyles.buttonLarge, color: '#fff', textAlign: 'center' }}>Save</Text>
                    </TouchableOpacity>
                </View>
            </CustomBottomSheet>

            {/* <FullScreenLoader visible={isLoading} /> */}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f4f3',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#e8f4f3',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        color: '#000',
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    titleContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    title: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    card: {
        // backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
    },
    cardInner: {
        flexDirection: 'row',
        gap: 8,
    },
    timeBadge: {
        backgroundColor: '#23a2a4',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
        // minWidth: 70,
    },
    timeBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 18,
    },
    cardContent: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    patientName: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        textAlign: 'left',
        lineHeight: 20,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: 20,
        color: '#555',
        marginLeft: 4,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    detailsButton: {
        borderWidth: 1.5,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    detailsButtonText: {
        color: '#23a2a4',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: Platform.OS === 'ios' ? 0 : 18,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

export default ReminderList