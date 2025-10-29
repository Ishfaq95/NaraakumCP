import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { ROUTES } from '../../shared/utils/routes';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';

const CareProviderBioScreen = () => {
    const [careProviderBioMenuItems, setCareProviderBioMenuItems] = useState([
        {
            id: 'englishBio',
            title: 'Bio - English',
            icon: 'person-outline',
            Image: require('../../assets/icons/careProviderBio.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('englishBio'),
        },
        {
            id: 'arabicBio',
            title: 'Bio - لغة عربية',
            icon: 'person-outline',
            Image: require('../../assets/icons/medicalLicense.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('arabicBio'),
        },
    ]);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state: any) => state.root.user.user);
   

    const handleSettingsItemPress = (itemId: string) => {
       
    };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Personal Profile</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                {renderHeader()}
                <View style={{ flex: 1, padding: 12 }}>
                    <View style={{ marginTop: 10 }}>
                        {careProviderBioMenuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={item.onPress}
                            >
                                <View style={styles.menuItemContent}>
                                    <View style={styles.leftSection}>
                                        {item.Image ? <Image source={item.Image} style={{ width: 24, height: 24 }} resizeMode="contain" /> : <Ionicons name={item.icon} size={24} color={item.iconColor} />}
                                        <Text style={styles.menuItemText}>{item.title}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <Ionicons name="chevron-forward" size={20} color="#999" />
                                    </View>
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
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        paddingVertical: 10,
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
        paddingVertical: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 12,
    },
});

export default CareProviderBioScreen