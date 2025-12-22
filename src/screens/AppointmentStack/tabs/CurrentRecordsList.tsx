import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

interface CurrentRecordsListProps {
    records: any[];
    onVisitRecordPress?: (item: any) => void;
}

const CurrentRecordsList: React.FC<CurrentRecordsListProps> = ({ records, onVisitRecordPress }) => {
    const renderRecordItem = ({ item }: { item: any }) => (
        <View style={styles.recordCard}>
            <View style={styles.providerHeader}>
                <View style={styles.providerInfo}>
                    <Text style={styles.providerLabel}>Care Provider</Text>
                    <Text style={styles.providerName}>{item.FullnamePlang}</Text>
                </View>
                <Image
                    source={{ uri: item.LogoImagePath ? `${MediaBaseURL}${item.LogoImagePath}` : `${MediaBaseURL}${item.ImagePath}` }}
                    style={styles.providerImage}
                />
            </View>

            <View style={styles.detailRow}>
                <MaterialIcons name="local-hospital" size={20} color="#14b8a6" />
                <Text style={styles.detailLabel}>Hospital</Text>
                <Text style={styles.detailValue}>{item.TitlePlang}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#14b8a6" />
                <Text style={styles.detailLabel}>{item.CatCategoryId == '42' ? 'Session Date' : 'Visit Date'}</Text>
                <Text style={styles.detailValue}>{moment.utc(item.VisitDate).local().format('DD/MM/YYYY')}</Text>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => onVisitRecordPress && onVisitRecordPress(item)}>
            {item.CatCategoryId == '42' &&<Image source={require('../../../assets/icons/cameramovie.png')} style={{ tintColor: '#808080',marginRight: 8, width: 18, height: 18 }} />}
            <Text style={styles.infoButtonText}>{item.CatCategoryId == '42' ? 'Session Record Information' : 'Visit Record Information'}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No current session records</Text>
        </View>
    );

    return (
        <FlatList
            data={records}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    recordCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    providerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    providerInfo: {
        flex: 1,
    },
    providerLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    providerImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    providerImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#e4f1ef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 20 : 18,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 20 : 18,
        color: '#000',
    },
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#14b8a6',
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 12,
        gap: 8,
    },
    infoButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#14b8a6',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});

export default CurrentRecordsList;

