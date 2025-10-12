import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
                            <Ionicons name="person" size={28} color="gray" />
                        </View>
                    }
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.name}>{name}</Text>
                        {!!primaryDate && <Text style={styles.dateText}>{primaryDate}</Text>}
                    </View>
                </View>
                <View style={[styles.rowStart,{alignItems: 'flex-start',justifyContent: 'flex-start'}]}>
                    <Icon name="star" size={16} color="#FFC107" style={{ marginRight: 4 }} />
                    <Text style={styles.ratingText}>{String(rating)}</Text>
                </View>
            </View>

            <View style={styles.separator} />

            {!!secondaryDate && <Text style={styles.secondaryDate}>{secondaryDate}</Text>}

            <TouchableOpacity onPress={onDelete} activeOpacity={0.8} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete Comment</Text>
            </TouchableOpacity>
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
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    name: {
        ...globalTextStyles.h5,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    dateText: {
        ...globalTextStyles.bodySmall,
        color: '#9AA1A6',
    },
    ratingText: {
        ...globalTextStyles.bodyMedium,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    separator: {
        height: 1,
        backgroundColor: '#E9E9E9',
        marginVertical: 12,
    },
    secondaryDate: {
        ...globalTextStyles.bodyMedium,
        color: '#6E6E6E',
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


