import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { notificationsService } from '../../services/api/notifications';
import { useSelector } from 'react-redux';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import moment from 'moment';
import { ROUTES } from '../../shared/utils/routes';

interface NotificationItem {
    RowId?: string;
    Id: number | string;
    ReciverId?: string;
    NSubject?: string;
    NBody?: string;
    isViewed?: boolean;
    DeliveryDate?: string;
    NotificationDeliveryDate?: string;
    NotificationDeliveryTime?: string;
    ViewDate?: string | null;
    NSubjectSlang?: string;
    NBodySlang?: string;
    RelationOrderAndOrganizationCategoryId?: string;
    OrderId?: string;
    TempId?: string;
    TaskId?: string;
    SchedulingDate?: string;
    SchedulingTime?: string;
    [key: string]: any;
}

const NotificationList = () => {
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;
    const isFocused = useIsFocused();
    const backButtonPress = () => {
        navigation.goBack();
    }

    useEffect(() => {
        if (user && isFocused) {
            getNotificationsList(1, true);
        }
    }, [user,isFocused]);

    const getNotificationsList = async (page: number, isInitialLoad: boolean = false) => {
        if (isInitialLoad) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const payload = {
                "ReciverId": user.Id,
                "Viewstatus": 0,
                "PageNumber": page,
                "PageSize": pageSize
            }
            const response = await notificationsService.getNotificationsList(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                const newNotifications = response.Notifications || [];
                const totalRecordsCount = response.TotalRecord || 0;
                
                // Set total records on initial load
                if (isInitialLoad) {
                    setTotalRecords(totalRecordsCount);
                    setNotificationsList(newNotifications);
                    
                    // Check if there are more items to load based on TotalRecord
                    setHasMore(newNotifications.length < totalRecordsCount);
                } else {
                    setNotificationsList(prev => {
                        const updatedList = [...prev, ...newNotifications];
                        
                        // Check if there are more items to load based on TotalRecord
                        setHasMore(updatedList.length < totalRecordsCount);
                        
                        return updatedList;
                    });
                }

                // Update page number
                setPageNumber(page);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }

    const updateNotificationViewStatus = async (item: any) => {
        try {
            const payload = {
                NotificationOccerrenceSystemId: item.Id,
            }
            const response = await notificationsService.updateNotificationViewStatus(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
            }
        }
        catch (error) {
        }
    }

    const loadMoreNotifications = () => {
        if (!isLoadingMore && hasMore) {
            getNotificationsList(pageNumber + 1, false);
        }
    }

    const formatDateTime = (item: NotificationItem) => {
        try {
            // Try to use DeliveryDate first (UTC datetime string)
            if (item.DeliveryDate) {
                const localDate = moment.utc(item.DeliveryDate).local();
                return localDate.format('DD/MM/YYYY hh:mm A');
            }
            
            // Fall back to NotificationDeliveryDate + NotificationDeliveryTime
            if (item.NotificationDeliveryDate && item.NotificationDeliveryTime) {
                // Combine date and time as UTC string
                const utcDateTimeString = `${item.NotificationDeliveryDate}T${item.NotificationDeliveryTime}:00.000Z`;
                const localDate = moment.utc(utcDateTimeString).local();
                return localDate.format('DD/MM/YYYY hh:mm A');
            }
            
            return '';
        } catch (error) {
            return '';
        }
    }

    const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
        return (
            <View style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                    {/* First Row: Icon, Date, and Title */}
                    <View style={styles.notificationHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="notifications" size={18} color="#14b8a6" />
                        </View>
                        <View>
                        <Text style={styles.timestamp}>
                            {formatDateTime(item)}
                        </Text>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.NSubjectSlang || item.NSubject || 'Notification'}
                        </Text>
                        </View>
                    </View>
                    
                    {/* Second Row: Description */}
                    <Text style={styles.description}>
                        {item.NBodySlang || item.NBody || 'No description available.'}
                    </Text>
                    
                    {/* Third Row: Tasks Button */}
                    <TouchableOpacity 
                        style={styles.tasksButton}
                        activeOpacity={0.7}
                        onPress={ () => {
                            updateNotificationViewStatus(item);
                            navigation.navigate(ROUTES.VisitDetailScreen as never, { taskId: item?.TaskId });
                        }}
                    >
                        <Text style={styles.tasksButtonText}>Tasks</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#14b8a6" />
            </View>
        );
    }

    const renderEmptyState = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No notifications found</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                {isLoading && notificationsList.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#14b8a6" />
                    </View>
                ) : (
                    <FlatList
                        data={notificationsList}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item, index) => `notification-${item.Id || index}`}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadMoreNotifications}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmptyState}
                    />
                )}
            </View>
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
        fontSize: 16,
        fontFamily:CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    notificationContent: {
        padding: 16,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e4f1ef',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    timestamp: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily:CAIRO_FONT_FAMILY.semiBold,
        color: '#666',
        flexShrink: 0,
    },
    title: {
        fontSize: 16,
        fontFamily:CAIRO_FONT_FAMILY.bold,
        color: '#000',
        flex: 1,
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily:CAIRO_FONT_FAMILY.medium,
        color: '#555',
        marginBottom: 16,
        lineHeight: 20,
    },
    tasksButton: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#14b8a6',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    tasksButtonText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily:CAIRO_FONT_FAMILY.medium,
        color: '#14b8a6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        ...globalTextStyles.bodyMedium,
        color: '#999',
    },
})
export default NotificationList