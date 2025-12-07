import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Platform } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import moment from 'moment';
import TransactionItem from '../../components/Payment/TransactionItem';

const PaymentDetailsScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
    const [paymentAmount, setPaymentAmount] = useState<any>(null);
    const [totalBookings, setTotalBookings] = useState(0);
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
    const user = useSelector((state: any) => state.root.user.user);

    useEffect(() => {
        getServiceProviderPersonalProfileSummary();
    }, []);

    const getServiceProviderPersonalProfileSummary = async () => {
        try {
            setIsLoading(true);
            const payload = {
                UserloginInfoId: user?.Id,
            };

            const response = await profileService.getServiceProviderPaymentDetails(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setPaymentDetails(response?.PaymentProfileDetail || []);
                setPaymentAmount(response?.PaymentProfileAmounts[0]);
                setTotalBookings(response?.PaymentProfileDetail?.length || 0);
            }
        } catch (error: any) {
            console.log('error', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const toggleExpand = useCallback((itemId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    }, []);

    const formatTime = useCallback((time: string) => {
        if (!time) return '';
        return moment.utc(time, 'HH:mm').local().format('hh:mm A');
    }, []);

    const formatDate = useCallback((date: string) => {
        if (!date) return '';
        return moment.utc(date).local().format('DD/MM/YYYY');
    }, []);

    const renderScreenHeader = () => (
        <View style={styles.screenHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Details</Text>
        </View>
    );

    const renderTransactionItem = useCallback(({ item }: any) => {
        return (
            <TransactionItem
                item={item}
                isExpanded={expandedItems[item.Id]}
                onToggle={toggleExpand}
                formatTime={formatTime}
                formatDate={formatDate}
            />
        );
    }, [expandedItems, toggleExpand, formatTime, formatDate]);

    const renderListHeaderComponent = useCallback(() => (
        <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Total Bookings : </Text>
                    <Text style={styles.summaryTitleValue}>{totalBookings}</Text>
                </View>

                <View style={styles.totalAmountRow}>
                    <Text style={styles.totalAmountLabel}>Total Amounts</Text>
                    <Text style={styles.totalAmountValue}>
                        {paymentAmount?.TotalAmount?.toFixed(2) || '0.00'} <Text style={styles.totalAmountCurrency}>SAR</Text>
                    </Text>
                </View>

                <View style={styles.transferredContainer}>
                    <View style={{}}>
                        <Text style={styles.transferredLabel}>Transferred</Text>
                        <Text style={styles.transferredAmount}>
                            {paymentAmount?.TotalPaid || 0} <Text style={styles.totalAmountCurrency}>SAR</Text>
                        </Text>
                    </View>

                    <View style={{}}>
                        <Text style={styles.notTransferredLabel}>Not Transferred</Text>
                        <Text style={styles.notTransferredAmount}>
                            {paymentAmount?.TotalUnpaid?.toFixed(2) || '0.00'} <Text style={styles.totalAmountCurrency}>SAR</Text>
                        </Text>
                    </View>
                </View>
            </View>


        </>
    ), [totalBookings, paymentAmount]);

    const renderEmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
        </View>
    ), []);

    console.log('paymentDetails', paymentDetails);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                {renderScreenHeader()}
                <View style={{ backgroundColor: '#239ea0', paddingHorizontal: 16, paddingVertical: 16}}>
                    {renderListHeaderComponent()}
                </View>
                <View style={styles.flatListContainer}>
                    <FlatList
                        data={paymentDetails}
                        renderItem={renderTransactionItem}
                        keyExtractor={(item, index) => `${item.Id.toString()}-${index}`}
                        ListHeaderComponent={
                            <View style={styles.transactionSectionHeader}>
                                <Text style={styles.transactionSectionTitle}>Payment Transaction</Text>
                            </View>
                        }
                        ListEmptyComponent={renderEmptyComponent}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        nestedScrollEnabled={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={10}
                        windowSize={10}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
    },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#fff',
        padding: 10,
    },
    backButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    flatListContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
        padding: 12,
    },
    flatListContent: {
        paddingBottom: 40,
    },
    // Summary Card Styles
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 15,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    summaryTitleValue: {
        fontSize: 16,
        color: '#239EA0',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    totalAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    totalAmountLabel: {
        fontSize: 15,
        color: '#555',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    totalAmountValue: {
        fontSize: 16,
        color: '#239EA0',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    transferredContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
        overflow: 'hidden',
    },
    transferredBox: {
        flex: 1,
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    transferredLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    transferredAmount: {
        fontSize: 15,
        color: '#239EA0',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    notTransferredBox: {
        flex: 1,
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    notTransferredLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    notTransferredAmount: {
        fontSize: 15,
        color: '#239EA0',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    // Transaction Section Styles
    transactionSectionHeader: {
        marginBottom: 12,
    },
    transactionSectionTitle: {
        fontSize: 15,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 12,
        overflow: 'hidden',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    totalAmountCurrency: {
        fontSize: 15,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
});

export default PaymentDetailsScreen