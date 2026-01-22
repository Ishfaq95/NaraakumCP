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
    Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { authService } from '../../services/api/authService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoaderKit from 'react-native-loader-kit';
import FullScreenLoader from '../FullScreenLoader';

interface OTPVerificationStepProps {
    phoneNumber: string;
    userInfo: any;
    onOTPVerified: (otp: string) => void;
    onEditPhoneNumber: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
    phoneNumber,
    userInfo,
    onOTPVerified,
    onEditPhoneNumber,
    setIsLoading
}) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputs = useRef<(TextInput | null)[]>([]);
    const [isResendSuccess, setIsResendSuccess] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpCodeExpired, setOTPCodeExpired] = useState(false);
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

        // Extract only digits from input
        const digitsOnly = value.replace(/\D/g, '');

        // If no digits, clear the current field
        if (!digitsOnly) {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        // Check if this is a paste operation (multiple digits detected)
        if (digitsOnly.length > 2) {
            // Extract first 4 digits from pasted text
            const digits = digitsOnly.split('').slice(0, 4);

            // Fill OTP fields with pasted digits
            const newOtp = ['', '', '', ''];
            digits.forEach((digit, i) => {
                if (i < 4) {
                    newOtp[i] = digit;
                }
            });

            setOtp(newOtp);

            // Blur all inputs and focus on the last filled input
            inputs.current.forEach(input => input?.blur());

            const lastFilledIndex = Math.min(digits.length - 1, 3);
            if (lastFilledIndex >= 0) {
                setTimeout(() => {
                    inputs.current[lastFilledIndex]?.focus();
                }, 100);
            }

            // Auto-verify if all 4 digits are pasted
            if (digits.length === 4) {
                setTimeout(() => {
                    handleVerifyOTP(digits.join(''));
                }, 200);
            }

            return;
        }

        // Single digit input (normal typing)
        // Only take the first digit if user types normally
        const singleDigit = digitsOnly.charAt(0);
        const newOtp = [...otp];
        newOtp[index] = singleDigit;
        setOtp(newOtp);

        // Auto-move to next input
        if (singleDigit && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        setIsLoading(true);
        try {
            const response = await authService.verifyOTP({
                "UserId": userInfo.userid,
                "VerificationCode": otp,
                "VerificationPlatformId": Platform.OS === 'ios' ? 3 : 2
            });

            if (response.StatusCode.STATUSCODE === 3007) {
                onOTPVerified(otp);
                return;
            }

            if (response.StatusCode.STATUSCODE === 3016) {
                setOTPCodeExpired(true);
                return;
            }
            if (response.StatusCode.STATUSCODE === 3005) {
                setOtpError(true);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResendCode = async () => {
        setOtpError(false);
        setOTPCodeExpired(false);
        // setIsResendDisabled(true);
        // setCountdown(60);
        setOtp(['', '', '', '']);
        // inputs.current[0]?.focus();

        try {
            setIsLoading(true);
            const response = await authService.resendOTP({
                "UserId": userInfo.userid,
            });
            if (response.StatusCode.STATUSCODE === 3009) {
                setIsResendSuccess(true);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const isOTPComplete = otp.every(digit => digit !== '');

    const handleNext = () => {
        setIsResendSuccess(false);
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
                                ref={ref => { inputs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOTPChange(index, value)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                                keyboardType="number-pad"
                                maxLength={4}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {otpError && <Text style={styles.otpErrorText}>{t('invalid_otp')}</Text>}
                    {otpCodeExpired && <Text style={styles.otpErrorText}>{'Verification Code Expired'}</Text>}
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
                <TouchableOpacity disabled={!isOTPComplete} style={[styles.nextButton, !isOTPComplete && styles.nextButtonDisabled]} onPress={handleNext}>
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
        paddingTop: 20,
    },
    scrollViewContent: {
        // paddingHorizontal: 16,
    },
    headerSection: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666666',
    },
    phoneNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    phoneNumber: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#239EA0',
        // marginBottom: 8,
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 8,
        height: 30,
        width: 40,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 16,
        fontWeight: '600',
        color: '#666',
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
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        // justifyContent: 'space-between',
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

    },
    otpInputFilled: {
        borderColor: '#20B2AA',
    },
    resendSection: {
        // alignItems: 'center',
    },
    resendButton: {
        // paddingVertical: 12,
        marginTop: 20,
        backgroundColor: '#E9F5F6',
        borderRadius: 8,
        width: 100,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendButtonText: {
        fontSize: 14,
        color: '#191919',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontWeight: '600',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
    resendSuccessText: {
        ...globalTextStyles.bodyMedium,
        textAlign: 'center',
        fontWeight: '500',
        color: '#198754',
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
        paddingVertical: 10,
        // paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        // marginLeft: 12,
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
