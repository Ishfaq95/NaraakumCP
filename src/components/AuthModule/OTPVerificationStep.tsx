import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { globalTextStyles } from '../../styles/globalStyles';

interface OTPVerificationStepProps {
    phoneNumber: string;
    onOTPVerified: (otp: string) => void;
    onEditPhoneNumber: () => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({ 
    phoneNumber, 
    onOTPVerified, 
    onEditPhoneNumber 
}) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsResendDisabled(false);
        }
    }, [countdown]);

    const handleOTPChange = (index: number, value: string) => {
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
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
            onOTPVerified(newOtp.join(''));
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResendCode = () => {
        setIsResendDisabled(true);
        setCountdown(60);
        setOtp(['', '', '', '']);
        inputs.current[0]?.focus();
        // TODO: Implement resend OTP API call
        Alert.alert('Code Sent', 'A new verification code has been sent to your phone number.');
    };

    const isOTPComplete = otp.every(digit => digit !== '');

    return (
        <View style={styles.container}>
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
            </View>

            <View style={styles.resendSection}>
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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 8,
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 10,
    },
    editButtonText: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        color: '#666',
    },
    otpSection: {
        marginBottom: 40,
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
        marginBottom: 20,
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
        alignItems: 'center',
    },
    resendButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    resendButtonText: {
        fontSize: 14,
        color: '#20B2AA',
        fontWeight: '500',
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
});

export default OTPVerificationStep;
