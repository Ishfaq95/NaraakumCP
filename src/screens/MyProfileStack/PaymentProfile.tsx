import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { ROUTES } from '../../shared/utils/routes';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';

const PaymentProfileScreen = () => {
    const [paymentMenuItems, setPaymentMenuItems] = useState([
        {
            id: 'paymentDetails',
            title: 'Payment Details',
            icon: 'person-outline',
            Image: require('../../assets/icons/careProviderBio.png'),
            iconColor: '#00A19D',
            isComplete: false,
        },
        {
            id: 'signingTheContract',
            title: 'Signing The Contract',
            icon: 'person-outline',
            Image: require('../../assets/icons/medicalLicense.png'),
            iconColor: '#00A19D',
            isComplete: false,
        },
    ]);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [paymentProfileSummary, setPaymentProfileSummary] = useState<any>(null);
    const user = useSelector((state: any) => state.root.user.user);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            getServiceProviderPersonalProfileSummary();
        }
    }, [isFocused]);

    const getServiceProviderPersonalProfileSummary = async () => {
        try {
            setIsLoading(true);
            setHasError(false);
            const payload = {
                UserloginInfoId: user?.Id,
            };
            
            const response = await profileService.getServiceProviderPaymentProfileSummary(payload);
            
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setPaymentProfileSummary(response?.PaymentProfileSummary[0]);
                updatePaymentProfileOptionsStatus(response?.PaymentProfileSummary[0]);
                setHasError(false);
            } else {
                setHasError(true);
            }
        } catch (error: any) {
            setHasError(true);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleSettingsItemPress = (itemId: string) => {
        if (itemId === 'paymentDetails') {
            navigation.navigate(ROUTES.PaymentDetailsScreen as never);
        } else if (itemId === 'signingTheContract') {
            const isComplete = paymentProfileSummary?.ContractSigningStatus === 'Completed';
            if (isComplete) {
                // Navigate to PDF viewer with the contract PDF path
                (navigation as any).navigate(ROUTES.SignatureViewerScreen);
            } else {
                navigation.navigate(ROUTES.SignTheContractScreen as never);
            }
        }
    };

    const updatePaymentProfileOptionsStatus = (profileSummaryData: any) => {
        setPaymentMenuItems(prevMenuItems => 
          prevMenuItems.map(menuItem => {
            let isComplete = false;
            if (menuItem.id === 'signingTheContract') {
                isComplete = profileSummaryData?.ContractSigningStatus === 'Completed';
            }

            return {
              ...menuItem,
              isComplete: isComplete
            };
          })
        );
      };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Payment Profile</Text>
        </View>
    );
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                {renderHeader()}
                
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#00A19D" />
                        <Text style={styles.loadingText}>Loading payment profile...</Text>
                    </View>
                ) : hasError ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
                        <Text style={styles.errorText}>Failed to load payment profile</Text>
                        <Text style={styles.errorSubText}>Please check your internet connection</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={getServiceProviderPersonalProfileSummary}
                        >
                            <Ionicons name="reload" size={20} color="#fff" />
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1, padding: 12 }}>
                        <Text style={styles.title}>Payment profile list</Text>
                        <View style={{ marginTop: 10 }}>
                            {paymentMenuItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.menuItem}
                                    onPress={() => handleSettingsItemPress(item.id)}
                                >
                                    <View style={styles.menuItemContent}>
                                        <View style={styles.leftSection}>
                                            {item.Image ? <Image source={item.Image} style={{ width: 24, height: 24 }} resizeMode="contain" /> : <Ionicons name={item.icon} size={24} color={item.iconColor} />}
                                            <Text style={styles.menuItemText}>{item.title}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {item.id != 'paymentDetails' && <View style={{ backgroundColor: item.isComplete ? '#198754' : '#ffdcdc', padding: 5, borderRadius: 10 }}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isComplete ? '#fff' : '#c50d0d' }}>{item.isComplete ? 'Complete' : 'Incomplete'}</Text>
                                            </View>}
                                            <Ionicons name="chevron-forward" size={20} color="#999" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    errorSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00A19D',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default PaymentProfileScreen