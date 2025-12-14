import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface TransactionItemProps {
    item: any;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    formatTime: (time: string) => string;
    formatDate: (date: string) => string;
}

const TransactionItem = memo(({ item, isExpanded, onToggle, formatTime, formatDate }: TransactionItemProps) => {
    const getStatusInfo = () => {
        const statusId = item?.CatOrderStatusId?.toString();
    
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
              backgroundColor: '#e9f5f6',
              borderColor: '#6cbebf',
              textColor: '#239ea0',
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
                        <FontAwesome name="stethoscope" size={20} color="#239EA0" />
                        </View>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>{item.CategoryName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="calendar-outline" size={18} color="#239EA0" />
                        </View>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{formatDate(item.SchedulingDate)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="time-outline" size={18} color="#239EA0" />
                        </View>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{formatTime(item.SchedulingTime)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Ionicons name="information-circle-outline" size={18} color="#239EA0" />
                        </View>
                        <Text style={styles.detailLabel}>Status</Text>
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
                  {statusInfo.text}
                </Text>
              </View>
            );
          })()}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>{item.ServiceCharges} <Text style={styles.amountValueCurrency}>SAR</Text></Text>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>System Charges</Text>
                        <Text style={styles.amountValue}>{item.PlatformPercentageAmount} <Text style={styles.amountValueCurrency}>SAR</Text></Text>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Tax</Text>
                        <Text style={styles.amountValue}>{item.VatAmount} <Text style={styles.amountValueCurrency}>SAR</Text></Text>
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
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
        backgroundColor: '#239EA0',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
    },
    transactionDetails: {
        padding: 14,
        paddingTop: 0,
        backgroundColor: '#f8f9fa',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
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
        marginLeft: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.bold,
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
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    amountValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    amountValueCurrency: {
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
});

export default TransactionItem;

