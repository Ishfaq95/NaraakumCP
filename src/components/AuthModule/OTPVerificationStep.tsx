import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { globalTextStyles } from '../../styles/globalStyles';
import { authService } from '../../services/api/authService';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OTPVerificationStepProps {
    phoneNumber: string;
    userInfo: any;
    onOTPVerified: (otp: string) => void;
    onEditPhoneNumber: () => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
    phoneNumber,
    userInfo,
    onOTPVerified,
    onEditPhoneNumber
}) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputs = useRef<(TextInput | null)[]>([]);
    const [isResendSuccess, setIsResendSuccess] = useState(false);
    const [otpError, setOtpError] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsResendDisabled(false);
        }
    }, [countdown]);

    const handleOTPChange = (index: number, value: string) => {
        setOtpError(false);
        // Only allow numeric input
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-move to next input
        if (value && index < 3) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-verify when all fields are filled
        // if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
        //     handleVerifyOTP(newOtp.join(''));
        // }
    };

    const handleVerifyOTP = async (otp: string) => {
        try {
            const response = await authService.verifyOTP({
                "UserId": userInfo.userid,
                "VerificationCode": otp,
                "VerificationPlatformId": Platform.OS === 'ios' ? 3 : 2
            });

            if(response.StatusCode.STATUSCODE === 3007){
                onOTPVerified(otp);
                return;
            }

            if(response.StatusCode.STATUSCODE === 3016 || response.StatusCode.STATUSCODE === 3005){
               setOtpError(true);
            }
        } catch (error) {
        }
    }

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResendCode = async () => {
        // setIsResendDisabled(true);
        // setCountdown(60);
        setOtp(['', '', '', '']);
        // inputs.current[0]?.focus();

        try {
            const response = await authService.resendOTP({
                "UserId": userInfo.userid,
            });
            if (response.StatusCode.STATUSCODE === 3009) {
                setIsResendSuccess(true);
            }
        } catch (error) {
        }
    };

    const isOTPComplete = otp.every(digit => digit !== '');

    const handleNext = () => {
        if (isOTPComplete) {
            handleVerifyOTP(otp.join(''));
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>   
            <View style={styles.headerSection}>
                <Text style={styles.title}>
                    Enter the verification code sent to the number
                </Text>

                <View style={styles.phoneNumberContainer}>
                    <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                    <TouchableOpacity onPress={onEditPhoneNumber} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter OTP</Text>

                <View style={styles.otpInputContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputs.current[index] = ref}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOTPChange(index, value)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {otpError && <Text style={styles.otpErrorText}>{t('invalid_otp')}</Text>}
            </View>

            <TouchableOpacity
                onPress={handleResendCode}
                disabled={isResendDisabled}
                style={styles.resendButton}
            >
                <Text style={[
                    styles.resendButtonText,
                    isResendDisabled && styles.resendButtonTextDisabled
                ]}>
                    {isResendDisabled ? `Resend code (${countdown}s)` : 'Resend code'}
                </Text>
            </TouchableOpacity>

            {isResendSuccess && <Text style={styles.resendSuccessText}>{t('code_sent_successfully')}</Text>}
            </ScrollView>
            <View style={styles.navigationContainer}>
                <TouchableOpacity style={[styles.nextButton, !isOTPComplete && styles.nextButtonDisabled]} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{`Next 3/4`}</Text>
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
    },
    headerSection: {
        marginBottom: 40,
    },
    title: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        marginBottom: 8,
    },
    phoneNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    phoneNumber: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        color: '#239EA0',
        // marginBottom: 8,
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#239EA0',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 10,
    },
    editButtonText: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        color: '#239EA0',
    },
    otpSection: {
        // marginBottom: 10,
    },
    otpLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'left',
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        backgroundColor: '#F8F8F8',
    },
    otpInputFilled: {
        borderColor: '#20B2AA',
        backgroundColor: '#F0FFFE',
    },
    resendSection: {
        // alignItems: 'center',
    },
    resendButton: {
        // paddingVertical: 12,
        borderColor: '#20B2AA',
        borderWidth: 1,
        borderRadius: 8,
        width: 100,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendButtonText: {
        fontSize: 14,
        color: '#20B2AA',
        fontWeight: '500',
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
    resendSuccessText: {
        ...globalTextStyles.bodyMedium,
        textAlign: 'center',
        fontWeight: '500',
        color: '#20B2AA',
        marginTop: 10,
    },
    otpErrorText: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        color: 'red',
        marginBottom: 10,
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

export default OTPVerificationStep;
