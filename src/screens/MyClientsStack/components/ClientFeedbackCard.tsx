import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../../styles/colors';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import { MediaBaseURL } from '../../../shared/utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    item: any;
    onDelete?: () => void;
};

const placeholder = require('../../../assets/icons/doctorvector.png');

const ClientFeedbackCard: React.FC<Props> = ({ item, onDelete }) => {
    const name = item?.FullnamePlang || item?.FullnameSlang || '—';
    const rating = typeof item?.AvgRating === 'number' ? item.AvgRating.toFixed(1) : (item?.AvgRating || '0.0');
    const avatarUri = item?.ImagePath;
    const secondaryDate = item?.Comment && String(item.Comment).trim().length > 0 ? item.Comment : 'No comment provided';

    const formatPrimaryDate = (iso?: string) => {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        } catch {
            return '';
        }
    };

    const primaryDate = formatPrimaryDate(item?.DateAdded);

    return (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <View style={styles.rowStart}>
                    {avatarUri ? <Image
                        source={{ uri: `${MediaBaseURL}${avatarUri}` }}
                        style={styles.avatar}
                    /> :
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={22} color="#AFAFAF" />
                        </View>
                    }
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.name}>{name}</Text>
                        {!!primaryDate && <Text style={styles.dateText}>{primaryDate}</Text>}
                    </View>
                </View>
                <View style={[styles.rowStart, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Icon name="star" size={16} color="#FFC107" style={{ marginRight: 4 }} />
                    <Text style={styles.ratingText}>{String(rating)}</Text>
                </View>
            </View>

            <View style={styles.separator} />

            {!!secondaryDate && <Text style={styles.secondaryDate}>{secondaryDate}</Text>}

            {/* <TouchableOpacity onPress={onDelete} activeOpacity={0.8} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete Comment</Text>
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowStart: {
        flexDirection: 'row',
        alignItems: 'center',
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
    dateText: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        textAlign: 'left',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    ratingText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        textAlign: 'left',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#191919',
    },
    separator: {
        height: 1,
        backgroundColor: '#E9E9E9',
        marginVertical: 12,
    },
    secondaryDate: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        textAlign: 'left',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginBottom: 12,
    },
    deleteBtn: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D9534F',
    },
    deleteText: {
        ...globalTextStyles.bodyMedium,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#D9534F',
    },
});

export default ClientFeedbackCard;


