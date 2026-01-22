import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    I18nManager,
    ScrollView,
    TouchableWithoutFeedback,
    Platform,
    Modal,
} from 'react-native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { authService } from '../../services/api/authService';
import { useIsFocused } from '@react-navigation/native';
import { MediaBaseURL } from '../../shared/utils/constants';
import UniversalImage from '../common/UniversalImage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenLoader from '../FullScreenLoader';
import { setStep2PhoneNumber } from '../../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';
import { isTablet } from '../../shared/utils/deviceUtils';
import LoaderKit from 'react-native-loader-kit';

interface ServiceProviderSelectionProps {
    selectedProvider: string | null;
    onProviderSelect: (providerId: string) => void;
    onNext: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

const ServiceProviderSelection: React.FC<ServiceProviderSelectionProps> = ({
    selectedProvider,
    onProviderSelect,
    onNext,
    setIsLoading,
}) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const isRTL = I18nManager.isRTL;
    const [serviceProviders, setServiceProviders] = useState<any[]>([]);
    const deviceIsTablet = isTablet();

    useEffect(() => {
        if (isFocused) {
            fetchServiceProviderRoleList();
        }
    }, [isFocused]);

    const fetchServiceProviderRoleList = async () => {
        try {
            setIsLoading(true);
            const response = await authService.getServiceProviderRoleList();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setServiceProviders(response.list);
            }
        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        dispatch(setStep2PhoneNumber(null));
        onNext();
    }

    return (
        <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Service Provider Type</Text>
           <ScrollView
                style={styles.scrollViewContainer}
                contentContainerStyle={styles.scrollViewContent}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <TouchableWithoutFeedback>
                    <View style={[styles.cardsGrid, deviceIsTablet ? { paddingHorizontal: 150 } : {}]}>
                        {serviceProviders.map((provider) => {
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
                                            <Ionicons name="checkmark-sharp" size={20} color="#fff" />
                                        )}
                                    </View>

                                    <View style={styles.iconContainer}>
                                        {provider.UserRoleImagePath ? (
                                            <UniversalImage source={{ uri: `${MediaBaseURL}${provider.UserRoleImagePath}` }} style={deviceIsTablet ? { width: 120, height: 120 } : styles.providerIcon} resizeMode={'contain'} />
                                        ) : (
                                            <Image source={require('../../assets/icons/test-tube.png')} style={deviceIsTablet ? { width: 120, height: 120 } : styles.providerIcon} resizeMode={'contain'} />
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
                </TouchableWithoutFeedback>
            </ScrollView>
            <View style={styles.navigationContainer}>
                <TouchableOpacity disabled={!selectedProvider} style={[styles.nextButton, !selectedProvider && styles.nextButtonDisabled]} onPress={handleNext}>
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
        // paddingHorizontal: 16,
    },
    selectionTitle: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 22,
    },
    scrollViewContainer: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20,
        minHeight: '100%',
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
        borderWidth: 1,
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
        backgroundColor: '#239EA0',
        borderColor: '#239EA0',
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    providerNameSelected: {
        color: '#239EA0',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    previousButton: {
        padding: 10,
        backgroundColor: '#239EA0',
        borderRadius: 8,
    },
    previousButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#239EA0',
        borderRadius: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        // marginLeft: 12,
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
    nextButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
});

export default ServiceProviderSelection;
