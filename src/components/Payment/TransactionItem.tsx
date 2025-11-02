import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

interface TransactionItemProps {
    item: any;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    formatTime: (time: string) => string;
    formatDate: (date: string) => string;
}

const TransactionItem = memo(({ item, isExpanded, onToggle, formatTime, formatDate }: TransactionItemProps) => {
    return (
        <View style={styles.transactionCard}>
            <TouchableOpacity
                style={styles.transactionHeader}
                onPress={() => onToggle(item.Id)}
                activeOpacity={0.7}
            >
                <View style={styles.transactionHeaderLeft}>
                    <Text style={styles.transactionName}>{item.FullnamePlang?.trim()}</Text>
                    <Text style={styles.transactionService}>{item.CategoryName}</Text>
                </View>
                <View style={styles.transactionHeaderRight}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{item.ServiceCharges} SAR</Text>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#000"
                        />
                    </View>
                    
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.transactionDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="medical" size={18} color="#17a2b8" />
                        </View>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>{item.CategoryName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="calendar-outline" size={18} color="#17a2b8" />
                        </View>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{formatDate(item.SchedulingDate)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="time-outline" size={18} color="#17a2b8" />
                        </View>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{formatTime(item.SchedulingTime)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="information-circle-outline" size={18} color="#17a2b8" />
                        </View>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{item.TitlePlang}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>{item.ServiceCharges} SAR</Text>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>System Charges</Text>
                        <Text style={styles.amountValue}>{item.PlatformPercentageAmount} SAR</Text>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Tax</Text>
                        <Text style={styles.amountValue}>{item.VatAmount} SAR</Text>
                    </View>
                </View>
            )}
        </View>
    );
});

TransactionItem.displayName = 'TransactionItem';

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#fff',
    },
    transactionHeaderLeft: {
        flex: 1,
    },
    transactionName: {
        fontSize: 15,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        marginBottom: 4,
        textAlign: 'left',
    },
    transactionService: {
        fontSize: 13,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    transactionHeaderRight: {
        // marginLeft: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceText: {
        fontSize: 13,
        color: '#fff',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        backgroundColor: '#17a2b8',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    transactionDetails: {
        padding: 14,
        paddingTop: 0,
        backgroundColor: '#f8f9fa',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    detailIconContainer: {
        width: 28,
        alignItems: 'flex-start',
    },
    detailLabel: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        marginLeft: 10,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.medium,
    },
    statusBadge: {
        backgroundColor: '#ffe6e6',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#dc3545',
        fontFamily: CAIRO_FONT_FAMILY.medium,
    },
    divider: {
        height: 1,
        backgroundColor: '#d0d0d0',
        marginVertical: 10,
        marginTop: 12,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    amountValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
});

export default TransactionItem;

