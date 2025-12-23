import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { ROUTES } from '../../shared/utils/routes';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const PersonalProfileScreen = () => {
    const isFocused = useIsFocused();
    const [personalMenuItems, setPersonalMenuItems] = useState([
        {
            id: 'careProviderBio',
            title: 'Care Provider Bio',
            icon: 'person-outline',
            Image: require('../../assets/icons/careProviderBio.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('careProviderBio'),
            isComplete: false,
        },
        {
            id: 'medicalLicense',
            title: 'Medical License',
            icon: 'person-outline',
            Image: require('../../assets/icons/medicalLicense.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('medicalLicense'),
            isComplete: false,
        },
        {
            id: 'accountInfo',
            title: 'Account Information',
            icon: 'person-outline',
            Image: require('../../assets/icons/accountInfo.png'),
            iconColor: '#00A19D',
            onPress: () => handleSettingsItemPress('accountInfo'),
            isComplete: false,
        },
    ]);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state: any) => state.root.user.user);
    useEffect(() => {
        getServiceProviderPersonalProfileSummary();
    }, [isFocused]);

    const getServiceProviderPersonalProfileSummary = async () => {
        try {
            setIsLoading(true);
            const payload = {
                UserloginInfoId: user?.Id,
            };
            const response = await profileService.getServiceProviderPersonalProfileSummary(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                updateProfileOptionsStatus(response?.PersonalProfileSummary[0]);
            }
        } catch (error: any) {
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleSettingsItemPress = (itemId: string) => {
        if (itemId === 'accountInfo') {
            navigation.navigate(ROUTES.AccountInformationScreen as never);
        }else if (itemId === 'careProviderBio') {
            navigation.navigate(ROUTES.CareProviderBioScreen as never);
        }else if (itemId === 'medicalLicense') {
            navigation.navigate(ROUTES.MedicalLicenseScreen as never);
        }
    };

    const updateProfileOptionsStatus = (profileSummaryData: any) => {
        setPersonalMenuItems(prevMenuItems => 
          prevMenuItems.map(menuItem => {
            let isComplete = false;
            if (menuItem.id === 'careProviderBio') {
                isComplete = profileSummaryData.ServiceProviderBioStatus === 'Completed';
            } else if (menuItem.id === 'medicalLicense') {
                isComplete = profileSummaryData.MedicalLicenseStatus === 'Completed';
            } 

            return {
              ...menuItem,
              isComplete: isComplete
            };
          })
        );
      };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff',paddingHorizontal: 10,elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3, }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Personal Profile</Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                {renderHeader()}
                <View style={{ flex: 1, padding: 12 }}>
                    <Text style={styles.title}>Personal profile list</Text>
                    <View style={{ marginTop: 10 }}>
                        {personalMenuItems.map((item) => (
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
                                        {item.id != 'accountInfo' && <View style={{ backgroundColor: item.isComplete ? '#198754' : '#ffdcdc', padding: 5, borderRadius: 10 }}>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isComplete ? '#fff' : '#c50d0d' }}>{item.isComplete ? 'Complete' : 'Incomplete'}</Text>
                                        </View>}
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
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
        marginLeft: 8,
    },
});

export default PersonalProfileScreen