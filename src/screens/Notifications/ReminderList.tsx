import { View, Text, SafeAreaView, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalTextStyles } from '../../styles/globalStyles'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { notificationsService } from '../../services/api/notifications';
import { useSelector } from 'react-redux';
import FullScreenLoader from '../../components/FullScreenLoader';
import { ROUTES } from '../../shared/utils/routes';

const ReminderList = () => {
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const [reminderList, setReminderList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        getReminderList();
    }, []);

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

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reminders</Text>
        </View>
    );

    const backButtonPress = () => {
        navigation.goBack();
    };

    const handleShowDetails = (item: any) => {
        navigation.navigate(ROUTES.VisitDetailScreen as never, { taskId: item?.TaskId });
    };

    const renderReminderCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardInner}>
                <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>{formatTime(item.ReminderTime)}</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                
                <ScrollView 
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Today Tasks ({reminderList.length})</Text>
                    </View>

                    {reminderList.map((item, index) => (
                        <View key={item.TaskId || index}>
                            {renderReminderCard({ item })}
                        </View>
                    ))}

                    {!isLoading && reminderList.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No reminders for today</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            <FullScreenLoader visible={isLoading} />
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
        ...globalTextStyles.h5,
        marginLeft: 8,
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
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
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
        backgroundColor: '#14b8a6',
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
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
        backgroundColor: '#fff',
        padding:16,
        borderRadius: 12,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    detailsButton: {
        borderWidth: 1.5,
        borderColor: '#14b8a6',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    detailsButtonText: {
        color: '#14b8a6',
        fontSize: 15,
        fontWeight: '600',
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