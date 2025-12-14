import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    useWindowDimensions,
    Keyboard,
    TouchableWithoutFeedback,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import FullScreenLoader from '../../components/FullScreenLoader';
import AuthHeader from '../../components/AuthHeader';
import Stepper from '../../components/common/Stepper';
import ServiceProviderSelection from '../../components/AuthModule/ServiceProviderSelection';
import PersonalInfoStep from '../../components/AuthModule/PersonalInfoStep';
import OTPVerificationStep from '../../components/AuthModule/OTPVerificationStep';
import { globalTextStyles } from '../../styles/globalStyles';
import { authService } from '../../services/api/authService';
import FinalDetailsStep from '../../components/AuthModule/FinalDetailsStep';
import SuccessScreen from '../../components/AuthModule/SuccessScreen';
import { setUser } from '../../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_HEIGHT = 550; // Absolute minimum height
const OPTIMAL_HEIGHT = 750; // Height for medium screens

interface Country {
    code: string;
    name: string;
    nameAr: string;
    phoneCode: string;
    flag: string;
}

const SignUpScreen = () => {
    const dispatch = useDispatch();
    const { height: windowHeight } = useWindowDimensions();
    const isLargeScreen = windowHeight > OPTIMAL_HEIGHT;
    const isSmallScreen = windowHeight < MIN_HEIGHT;
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const { t } = useTranslation();
    const navigation = useNavigation();
    const handleProviderSelect = (providerId: string) => {
        setSelectedProvider(providerId);
    };

    const handleUserInfoData = (userInfo: any, phoneNumber: string) => {
        if (phoneNumber) {
            setPhoneNumber(phoneNumber);
        }
        setUserInfo(userInfo);
        handleNext();
    };

    const handleOTPVerified = async (otp: string) => {
        handleNext();
    };

    const handleEditPhoneNumber = () => {
        setCurrentStep(2);
    };

    const handleNext = () => {
        if (currentStep === 1 && selectedProvider) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(4);
        }
    };

    const handlePrevious = () => {
        if(currentStep === 1){
            navigation.goBack();
        }else if(currentStep === 2){
            setCurrentStep(1);
        }else if(currentStep === 3){
            setCurrentStep(2);
        }else if(currentStep === 4){
            setCurrentStep(2);
        }
        
    };

    const handleSuccess = () => {
       dispatch(setUser(userData));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ServiceProviderSelection
                        selectedProvider={selectedProvider}
                        onProviderSelect={handleProviderSelect}
                        onNext={handleNext}
                    />
                );
            case 2:
                return <PersonalInfoStep userRoleId={selectedProvider} onNext={handleUserInfoData} />;
            case 3:
                return (
                    <OTPVerificationStep
                        phoneNumber={phoneNumber}
                        userInfo={userInfo}
                        onOTPVerified={handleOTPVerified}
                        onEditPhoneNumber={handleEditPhoneNumber}
                    />
                );
            case 4:
                return (
                    <FinalDetailsStep
                        phoneNumber={phoneNumber}
                        userInfo={userInfo}
                        selectedProvider={selectedProvider}
                        onSubmit={(form) => {
                            setUserData(form);
                            setCurrentStep(5);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return selectedProvider !== null;
            case 2:
                return true; // PersonalInfoStep handles its own validation
            case 3:
                return false;
            case 4:
                return true;
            default:
                return false;
        }
    };
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentStep === 5 ? '#fff' : '#eaf6f6' }]}>
            {currentStep !== 5 && <AuthHeader onBack={handlePrevious} />}
            {/* <FullScreenLoader visible={false} /> */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {currentStep === 5 ? <View style={styles.contentContainer}>
                        <View style={styles.stepContentContainer}>
                            <SuccessScreen onNext={handleSuccess} />
                        </View>
                    </View> : <View style={styles.contentContainer}>
                        {/* Fixed Header */}
                        <View style={styles.headerContainer}>
                            <Text style={[globalTextStyles.h2,{color:'#0F4243'}]}>
                                {currentStep === 1 ? 'Create new account' : currentStep== 3? 'Verification Code': 'Registration Info'}
                            </Text>
                        </View>

                        {/* Fixed Stepper */}
                        <View style={styles.stepperContainer}>
                            <Stepper
                                currentStep={currentStep}
                                totalSteps={4}
                                activeColor="#20B2AA"
                                inactiveColor="#E0E0E0"
                                barHeight={4}
                                barWidth={Platform.OS === 'ios' ? 60 : 50}
                                spacing={12}
                            />
                        </View>

                        {/* Scrollable Step Content */}
                        <View style={styles.stepContentContainer}>
                            {renderStepContent()}
                        </View>
                    </View>}
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eaf6f6',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    headerContainer: {
        height: 100,
        width: '100%',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },
    stepperContainer: {
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    stepContentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    stepContentScrollView: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    placeholderContainer: {
        flex: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    placeholderSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    previousButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: '#20B2AA',
    },
    previousButtonText: {
        color: '#20B2AA',
        fontSize: 16,
        fontWeight: '600',
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
    nextButtonDisabled: {
        backgroundColor: '#E0E0E0',
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

export default SignUpScreen;
