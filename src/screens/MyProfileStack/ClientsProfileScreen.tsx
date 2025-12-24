import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform } from 'react-native'
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { ROUTES } from '../../shared/utils/routes';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const ClientsProfileScreen = () => {
    const [clientsMenuItems, setClientsMenuItems] = useState([
        {
            id: 'clientSection',
            title: 'Client Section',
            icon: 'pricetag-outline',
            Image: require('../../assets/icons/clientsIcon.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('clientSection'),
        },
    ]);
    const navigation = useNavigation();

    const handleSettingsItemPress = (itemId: string) => {
        if (itemId === 'clientSection') {
            navigation.navigate(ROUTES.ClientSectionScreen as never);
        }
    };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', paddingHorizontal: 10,elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3, }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Clients Profile</Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                {renderHeader()}
                <View style={{ flex: 1, padding: 12 }}>
                    <Text style={styles.title}>Clients profile list</Text>
                    <View style={{marginTop: 10}}>
                        {clientsMenuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={item.onPress}
                            >
                                <View style={styles.menuItemContent}>
                                    <View style={styles.leftSection}>
                                        {item.Image ? <Image source={item.Image} style={{width: 24, height: 24}} resizeMode="contain" /> : <Ionicons name={item.icon} size={24} color={item.iconColor} />}
                                        <Text style={styles.menuItemText}>{item.title}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    title: {
        fontSize: 16,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        paddingVertical: 6,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
        marginLeft: 12,
    },
});

export default ClientsProfileScreen