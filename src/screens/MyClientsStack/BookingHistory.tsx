import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { myClientsService } from '../../services/api/myClientsService';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { MediaBaseURL } from '../../shared/utils/constants';
import { ROUTES } from '../../shared/utils/routes';

const BookingHistory = ({ route }: { route: any }) => {
    const { Patient } = route.params;

    const navigation = useNavigation();
    const [bookingHistory, setBookingHistory] = useState<any>(null);
    const user = useSelector((state: any) => state.root.user.user);

    useEffect(() => {
        getServiceProviderAndPatientBookingHistory();
    }, []);

    const getServiceProviderAndPatientBookingHistory = async () => {
        try {
            const payload = {
                ServiceProviderUserloginInfoId: user?.Id,
                PatientProfileId: Patient?.PatientUserProfileInfoId,
            };
            const response = await myClientsService.getServiceProviderAndPatientBookingHistory(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setBookingHistory(response);
            }
        } catch (error) {
        }
    };

    const patientInfo = bookingHistory?.Rating?.[0];
    const bookingCounts = bookingHistory?.Counts?.[0];
    const bookingData = bookingHistory?.Data || [];

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking History</Text>
        </View>
    );

    const backButtonPress = () => {
        navigation.goBack();
    };

    const renderPatientInfoCard = () => {
        if (!patientInfo) return null;

        const imageUrl = patientInfo.ImagePath
            ? `${MediaBaseURL}${patientInfo.ImagePath}`
            : null;

        return (
            <>
                <View style={styles.patientHeader}>
                    <Text style={styles.patientHeaderTitle}>Patient Information</Text>
                </View>
                <View style={styles.patientCard}>

                    <View style={styles.patientContent}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.patientAvatar}
                            />
                        ) : (
                            <View style={[styles.patientAvatar, styles.patientAvatarPlaceholder]}>
                                <Ionicons name="person" size={32} color="#999" />
                            </View>
                        )}
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{patientInfo.FullnamePlang?.trim()}</Text>
                            <View style={styles.patientMeta}>
                                <Text style={styles.patientGender}>
                                    {patientInfo.Gender ? 'Male' : 'Female'}
                                </Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#FFA500" />
                                    <Text style={styles.ratingText}>
                                        {patientInfo.AccumulativeRatingAvg?.toFixed(2)}
                                    </Text>
                                    <Text style={styles.ratingCount}>
                                        ({patientInfo.AccumulativeRatingNum} Person)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </>
        );
    };

    const renderBookingStats = () => {

        return (
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>
                    Total Booking : {bookingCounts?.TotalRecords || 0}
                </Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#FFA500' }]}>
                            {bookingCounts?.TotalInProress || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: '#FFA500' }]}>
                            In Progress
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#00A19D' }]}>
                            {bookingCounts?.TotalCompleted || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: '#00A19D' }]}>
                            Complete
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                            {bookingCounts?.TotalCanceled || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: '#FF6B6B' }]}>
                            Cancelled
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const formatDateTime = (date: string, time: string) => {
        // Parse UTC and convert to local
        const dateTimeUTC = moment.utc(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        const dateTimeLocal = dateTimeUTC.local();
        return {
            date: dateTimeLocal.format('DD/MM/YYYY'),
            time: dateTimeLocal.format('hh:mm A')
        };
    };

    const getStatusColor = (status: string) => {
        if (status.toLowerCase().includes('completed')) return '#00A19D';
        if (status.toLowerCase().includes('reached')) return '#00A19D';
        if (status.toLowerCase().includes('progress')) return '#FFA500';
        if (status.toLowerCase().includes('cancel')) return '#FF6B6B';
        return '#666';
    };

    const renderBookingItem = ({ item }: { item: any }) => {
        const { date, time } = formatDateTime(item.SchedulingDate, item.SchedulingTime);
        const statusColor = getStatusColor(item.OrderStatusTitlePlang);

        const getStatusInfo = () => {
            const statusId = item?.OrderMainStatus?.toString();

            switch (statusId) {
                case '1':
                case '17':
                    return {
                        backgroundColor: '#e6f8eb',
                        borderColor: '#54b196',
                        textColor: '#008b62',
                        text: 'Accepted'
                    };
                case '7':
                    return {
                        backgroundColor: '#fef2e6',
                        borderColor: '#faa754',
                        textColor: '#f87b00',
                        text: 'On the way'
                    };
                case '8':
                    return {
                        backgroundColor: '#fef2e6',
                        borderColor: '#faa754',
                        textColor: '#f87b00',
                        text: 'In Progress'
                    };
                case '19':
                case '10':
                    return {
                        backgroundColor: '#e6f8eb',
                        borderColor: '#54b196',
                        textColor: '#008b62',
                        text: 'Completed'
                    };
                case '9':
                case '4':
                    return {
                        backgroundColor: '#fde8e8',
                        borderColor: '#ef6666',
                        textColor: '#ec4949',
                        text: 'Cancelled'
                    };
                case '23':
                    return {
                        backgroundColor: '#fde8e8',
                        borderColor: '#ef6666',
                        textColor: '#ec4949',
                        text: 'Incomplete'
                    };
                case '24':
                    return {
                        backgroundColor: '#fde8e8',
                        borderColor: '#ef6666',
                        textColor: '#ec4949',
                        text: 'Missed'
                    };
                default:
                    return {
                        backgroundColor: '#e6f8eb',
                        borderColor: '#54b196',
                        textColor: '#008b62',
                        text: 'New'
                    };
            }
        };

        const handlePrescriptionPress = (item: any) => {
            if (item?.VisitID) {
                const params = {
                    CatCategoryId: item.CatCategoryIds,
                    Id: item.VisitID,
                };
                navigation.navigate(ROUTES.PrescriptionView, { prescriptionData: params });
            } else {
                navigation.navigate(ROUTES.AddSessionRecord as never, { patientData: Patient });
            }
        };

        return (
            <View style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>Service</Text>
                    <Text style={styles.bookingValue}>{item.CatServicePlang}</Text>
                </View>
                <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>Date</Text>
                    <Text style={styles.bookingValue}>{date}</Text>
                </View>
                <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>Time</Text>
                    <Text style={styles.bookingValue}>{time}</Text>
                </View>
                <View style={styles.bookingRow}>
                    <Text style={styles.bookingLabel}>Duration</Text>
                    <Text style={styles.bookingValue}>{item.DurationMinutes} Min</Text>
                </View>
                <View style={styles.bookingRow}>
                    <View style={styles.statusRow}>
                        <Ionicons name="information-circle-outline" size={18} color="#00A19D" />
                        <Text style={styles.bookingLabel}>Status</Text>
                    </View>
                    {(() => {
                        const statusInfo = getStatusInfo();
                        return (
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: statusInfo.backgroundColor,
                                    borderLeftWidth: 4,
                                    borderLeftColor: statusInfo.borderColor
                                }
                            ]}>
                                <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                                    {item?.OrderStatusTitlePlang}
                                </Text>
                            </View>
                        );
                    })()}
                </View>


                <TouchableOpacity onPress={() => handlePrescriptionPress(item)} style={styles.prescriptionButton}>
                    <Text style={styles.prescriptionButtonText}>Show Prescription</Text>
                </TouchableOpacity>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingHorizontal: 16, backgroundColor: '#23a2a4' }}>
                        {renderPatientInfoCard()}
                        {renderBookingStats()}
                    </View>

                    {bookingData?.length > 0 && (
                        <View style={styles.bookingDetailsSection}>
                            <Text style={styles.sectionTitle}>Booking Details</Text>
                            <FlatList
                                data={bookingData}
                                renderItem={renderBookingItem}
                                keyExtractor={(item) => item.OrderID}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginLeft: 8,
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        // padding: 16,
        // paddingBottom: 30,
    },
    // Patient Information Card
    patientCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
    },
    patientHeader: {
        backgroundColor: '#23a2a4',
        // paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    patientHeaderTitle: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    patientContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
    },
    patientAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
    },
    patientAvatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    patientInfo: {
        marginLeft: 16,
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginBottom: 4,
        textAlign: 'left',
    },
    patientMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientGender: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginRight: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
        marginLeft: 4,
    },
    ratingCount: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginLeft: 4,
    },
    // Booking Stats Card
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',

    },
    statNumber: {
        fontSize: 32,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginBottom: 4,
        paddingBottom: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#E0E0E0',
    },
    // Booking Details Section
    bookingDetailsSection: {
        marginTop: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginBottom: 12,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    bookingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    bookingValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    prescriptionButton: {
        marginTop: 8,
        borderWidth: 1.5,
        borderColor: '#00A19D',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    prescriptionButtonText: {
        color: '#00A19D',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default BookingHistory;