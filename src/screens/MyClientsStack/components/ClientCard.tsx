import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { MediaBaseURL } from '../../../shared/utils/constants';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const ClientCard: React.FC<{ item: any } & { onMore?: (item: any) => void; onBook?: (item: any) => void }> = ({ item, onMore, onBook }) => {
    return (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.ImagePath ? <Image
                    source={{ uri: `${MediaBaseURL}${item.ImagePath}` }}
                    style={styles.avatar}
                /> :
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={22} color="#AFAFAF" />
                    </View>
                }
                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{item.FullnamePlang}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.gender}>{item.Gender == true ? 'Male' : 'Female'}</Text>
                        <FontAwesome name="star" size={14} color="#FFC107" style={{ marginHorizontal: 6 }} />
                        <Text style={styles.rating}>{item.AccumulativeRatingAvg.toFixed(2)}</Text>
                        <Text style={styles.ratingCount}>({item.AccumulativeRatingNum} Person)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.bookButton} onPress={() => onBook?.(item)}>
                    <FontAwesome name="stethoscope" size={18} color="#00A19D" />
                    <Text style={styles.bookText}>Book a Service</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moreButton} onPress={() => onMore?.(item)}>
                    <Ionicons name="ellipsis-horizontal" size={18} color="#00A19D" />
                    <Text style={styles.moreText}>More</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#DDDDDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        textAlign: 'left',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#191919',
    },
    gender: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    rating: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#191919',
    },
    ratingCount: {
        fontSize: 11,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookText: {
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginLeft: 6,
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreText: {
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginLeft: 6,
    },
});

export default ClientCard