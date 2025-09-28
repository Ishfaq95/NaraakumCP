import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    I18nManager,
    ScrollView,
} from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
import { authService } from '../../services/api/authService';
import { useIsFocused } from '@react-navigation/native';
import { MediaBaseURL } from '../../shared/utils/constants';
import UniversalImage from '../common/UniversalImage';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ServiceProviderSelectionProps {
    selectedProvider: string | null;
    onProviderSelect: (providerId: string) => void;
    onNext: () => void;
}

const ServiceProviderSelection: React.FC<ServiceProviderSelectionProps> = ({
    selectedProvider,
    onProviderSelect,
    onNext,
}) => {
    const isFocused = useIsFocused();
    const isRTL = I18nManager.isRTL;
    const [serviceProviders, setServiceProviders] = useState<any[]>([]);

    useEffect(() => {
        if (isFocused) {
            fetchServiceProviderRoleList();
        }
    }, [isFocused]);

    const fetchServiceProviderRoleList = async () => {
        const response = await authService.getServiceProviderRoleList();
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setServiceProviders(response.list);
        }
    };

    const handleNext = () => {
        onNext();
    }

    return (
        <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Service Provider Type</Text>
            <ScrollView>
                <View style={styles.cardsGrid}>
                    {serviceProviders.map((provider) => {
                        console.log('provider', `${MediaBaseURL}${provider.UserRoleImagePath}`);
                        return (
                            <TouchableOpacity
                                key={provider.Id}
                                style={[
                                    styles.providerCard,
                                    selectedProvider === provider.Id && styles.providerCardSelected
                                ]}
                                onPress={() => onProviderSelect(provider.Id)}
                            >
                                <View style={[
                                    styles.selectionIndicator,
                                    selectedProvider === provider.Id && styles.selectionIndicatorActive
                                ]}>
                                    {selectedProvider === provider.Id && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>

                                <View style={styles.iconContainer}>
                                    {provider.UserRoleImagePath ? (
                                        <UniversalImage source={{ uri: `${MediaBaseURL}${provider.UserRoleImagePath}` }} style={styles.providerIcon} />
                                    ) : (
                                        <Image source={require('../../assets/icons/test-tube.png')} style={styles.providerIcon} />
                                    )}
                                </View>

                                <Text style={[
                                    styles.providerName,
                                    selectedProvider === provider.Id && styles.providerNameSelected
                                ]}>
                                    {isRTL ? provider.TitleSlang : provider.TitlePlang}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={styles.navigationContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{`Next 1/4`}</Text>
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    selectionContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    selectionTitle: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        fontWeight: '600',
        marginBottom: 24,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    providerCard: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    providerCardSelected: {
        borderColor: '#20B2AA',
        backgroundColor: '#E6F3EF',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionIndicatorActive: {
        backgroundColor: '#20B2AA',
        borderColor: '#20B2AA',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    providerIcon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    providerName: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    providerNameSelected: {
        color: '#20B2AA',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    previousButton: {
        padding: 10,
        backgroundColor: '#20B2AA',
        borderRadius: 8,
    },
    previousButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginLeft: 12,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    nextButtonArrow: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ServiceProviderSelection;
