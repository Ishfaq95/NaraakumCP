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
    const { height: windowHeight } = useWindowDimensions();
    const isLargeScreen = windowHeight > OPTIMAL_HEIGHT;
    const isSmallScreen = windowHeight < MIN_HEIGHT;
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('5163468753');
    const [otpVerified, setOtpVerified] = useState(false);
    const { t } = useTranslation();

    const handleProviderSelect = (providerId: string) => {
        setSelectedProvider(providerId);
    };

    const handleUserInfoData = (userInfo: any) => {
        if (userInfo.phoneNumber) {
            setPhoneNumber(userInfo.phoneNumber);
        }
        handleNext();
    };

    const handleOTPVerified = (otp: string) => {
        console.log('OTP Verified:', otp);
        setOtpVerified(true);
        // TODO: Implement OTP verification API call
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
        if (currentStep > 1) {
            if (currentStep === 3) {
                setOtpVerified(false);
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ServiceProviderSelection
                        selectedProvider={selectedProvider}
                        onProviderSelect={handleProviderSelect}
                    />
                );
            case 2:
                return <PersonalInfoStep userRoleId={selectedProvider} onNext={handleUserInfoData} />;
            case 3:
                return (
                    <OTPVerificationStep
                        phoneNumber={phoneNumber}
                        onOTPVerified={handleOTPVerified}
                        onEditPhoneNumber={handleEditPhoneNumber}
                    />
                );
            case 4:
                return (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderTitle}>Step 4</Text>
                        <Text style={styles.placeholderSubtitle}>Final step - Review and submit</Text>
                    </View>
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
                return otpVerified;
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader onBack={handlePrevious} />
            <FullScreenLoader visible={false} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.contentContainer}>
                        {/* Fixed Header */}
                        <View style={styles.headerContainer}>
                            <Text style={globalTextStyles.h3}>
                                {t('create_new_account')}
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
                                barWidth={60}
                                spacing={12}
                            />
                        </View>

                        {/* Scrollable Step Content */}
                        <View style={styles.stepContentContainer}>
                            <ScrollView
                                contentContainerStyle={styles.stepContentScrollView}
                                bounces={false}
                                showsVerticalScrollIndicator={isSmallScreen}>
                                {renderStepContent()}
                            </ScrollView>
                        </View>

                        {/* Fixed Navigation Buttons */}
                        {currentStep != 2 && <View style={styles.navigationContainer}>
                            {/* {currentStep > 1 && (
                                <TouchableOpacity
                                    style={styles.previousButton}
                                    onPress={handlePrevious}
                                >
                                    <Text style={styles.previousButtonText}>← Previous</Text>
                                </TouchableOpacity>
                            )} */}

                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    !canProceed() && styles.nextButtonDisabled
                                ]}
                                onPress={handleNext}
                                disabled={!canProceed()}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentStep === 4 ? 'Complete' : `Next ${currentStep}/4`}
                                </Text>
                                {currentStep < 4 && <Text style={styles.nextButtonArrow}>→</Text>}
                            </TouchableOpacity>
                        </View>}
                    </View>
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
