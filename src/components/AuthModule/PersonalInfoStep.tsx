import CustomPhoneInput, { COUNTRIES } from '../common/CustomPhoneInput';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { ROUTES } from '../../shared/utils/routes';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { signInWithGoogle } from '../../services/auth/googleAuthService';
import { authService } from '../../services/api/authService';
import { setStep2PhoneNumber, setUser } from '../../shared/redux/reducers/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LoaderKit from 'react-native-loader-kit';

const PersonalInfoStep: React.FC<{userRoleId: any, onNext: (userInfo: any, phoneNumber: string) => void}> = ({userRoleId, onNext}) => {
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const step2PhoneNumber = useSelector((state: any) => state.root.user.step2PhoneNumber);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [selectedCountry, setSelectedCountry] = useState<any>({
        code: 'SA',
        name: 'Saudi Arabia',
        nameAr: 'المملكة العربية السعودية',
        flag: '🇸🇦',
        dialCode: '+966',
        pattern: '## ### ####',
        maxLength: 9,
    });
    const [error, setError] = useState(false);
    const [apiError, setAPIError] = useState(false);

    // Function to extract country code and phone number from full number
    const extractPhoneInfo = (fullNumber: string) => {
        if (!fullNumber) return { countryCode: 'SA', phoneNumber: '' };

        // Remove any spaces or special characters
        const cleanNumber = fullNumber.replace(/\s/g, '');

        // Build country code map from COUNTRIES array
        // Sort by dial code length (longest first) to handle cases like +1268 before +1
        const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

        // Try to match the phone number with country dial codes
        for (const country of sortedCountries) {
            if (cleanNumber.startsWith(country.dialCode)) {
                const phoneNumber = cleanNumber.substring(country.dialCode.length);
                return { countryCode: country.code, phoneNumber };
            }
        }

        // Default to Saudi Arabia if no match found
        return { countryCode: 'SA', phoneNumber: cleanNumber.replace(/^\+/, '') };
    };

    useEffect(() => {
        if (step2PhoneNumber) {
            const phoneInfo = extractPhoneInfo(step2PhoneNumber || '');
            const getCountry = COUNTRIES.find((c: any) => c.code === phoneInfo.countryCode);
            setSelectedCountry(getCountry);
            setPhoneNumber(phoneInfo.phoneNumber);
        }
    }, [step2PhoneNumber]);

    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(text);
        setError(false); // Clear error when user types
        if (apiError) setAPIError(false);
    };

    const handleCountryChange = (country: any) => {
        setSelectedCountry(country);
    };

    const formatPatternToExample = (pattern: string): string => {
        if (!pattern) return '';
        let digitCounter = 1;
        return pattern.replace(/#/g, () => {
            const digit = digitCounter;
            digitCounter = (digitCounter % 9) + 1; // Cycle through 1-9
            return digit.toString();
        });
    };

    const formatPatternToExamplePlaceHolder = (pattern: string): string => {
        if (!pattern) return '';
        let digitCounter = 1;
        return pattern.replace(/#/g, '0');
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const googleUser = await signInWithGoogle();

            if (googleUser) {

                const data = {
                    "FullName": googleUser.name,
                    "Username": googleUser.name,
                    "Email": googleUser.email,
                    "UniqueSocialId": googleUser.id,
                    "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                    "RegistrationTypeId": 2,
                    "CatSocialServerId": 1,
                    "CatUserTypeId": 1,
                    "CatNationalityId": 1,
                    "CellNumber": "000000000",
                    "DeviceId": "DDRT56789",
                    "DateofBirth": "1984-09-09"
                }

                // // Call your API to save the Google user data
                const response = await authService.loginWithSocialMedia(data);

                if (response?.ResponseStatus?.STATUSCODE === 200) {
                    setIsLoading(false);
                    dispatch(setUser(response.Userinfo));
                } else {
                    Alert.alert(
                        "Error",
                        response?.ResponseStatus?.MESSAGE,
                        [{ text: "OK" }]
                    );
                }
            } else {
                Alert.alert(
                    "Error",
                    "Google login failed",
                    [{ text: "OK" }]
                );
            }

        } catch (error: any) {
            Alert.alert(
                t('error'),
                error.message || t('google_login_failed'),
                [{ text: t('ok') }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        try {
            // Dismiss any existing modals first
            setIsLoading(false);

            const appleAuthResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            if (!appleAuthResponse.identityToken) {
                throw new Error('Apple Sign-In failed - no identify token returned');
            }

            const { identityToken, nonce, fullName, email, user } = appleAuthResponse;

            // Get user info from the identity token
            const decodedToken = JSON.parse(atob(identityToken.split('.')[1]));

            const data = {
                "FullName": fullName?.givenName || decodedToken.email?.split('@')[0] || 'Apple User',
                "Username": email || decodedToken.email || `apple_user_${user}`,
                "Email": email || decodedToken.email,
                "UniqueSocialId": user,
                "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                "RegistrationTypeId": 2,
                "CatSocialServerId": 3, // Apple
                "CatUserTypeId": 1,
                "CatNationalityId": 1,
                "CellNumber": "000000000",
                "DeviceId": "DDRT56789",
                "DateofBirth": "1984-09-09"
            };

            // Show loading after Apple Sign In is complete
            setIsLoading(true);

            const response = await authService.loginWithSocialMedia(data);

            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setIsLoading(false);
                // dispatch(setUser(response.Userinfo));
            } else {
                Alert.alert(
                    "Error",
                    response?.ResponseStatus?.MESSAGE,
                    [{ text: "OK" }]
                );
            }
        } catch (error: any) {
            if (error.code === appleAuth.Error.CANCELED) {
            } else {
                Alert.alert(
                    t('error'),
                    error.message || t('apple_login_failed'),
                    [{ text: t('ok') }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderSocialButtons = () => {
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.socialButtonsRow}>
                    <TouchableOpacity
                        style={[styles.socialButton]}
                        onPress={handleGoogleLogin}
                    >
                        <GoogleIcon width={24} height={24} style={styles.socialIcon} />
                        <Text numberOfLines={1} style={styles.socialButtonText}>{t('continue_with_google')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.socialButton, styles.appleButton]}
                        onPress={handleAppleLogin}
                    >
                        <AntDesign name="apple1" size={20} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text numberOfLines={1} style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                            {t('continue_with_apple')}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.socialButton, styles.googleButton, styles.centerButton]}
                onPress={handleGoogleLogin}
            >
                <GoogleIcon width={24} height={24} style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>{t('continue_with_google')}</Text>
            </TouchableOpacity>
        );
    };

    const handleNext = async () => {
        setIsLoading(true);
        let hasError = false;
        if (!phoneNumber.trim()) {
            setError(true);
            hasError = true;
        }

        const digits = phoneNumber.replace(/\D/g, '');
        if (digits.length !== selectedCountry?.maxLength) {
            setError(true);
            hasError = true;
        }

        if (hasError) {
            setIsLoading(false);
            return;
        }

        const fullNumber = selectedCountry.dialCode + digits;

        try {
            const response = await authService.signUpStep1({
                "CellNumber": fullNumber,
                "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                "CatuserRoleId": userRoleId,
                "DeviceId": Platform.OS === 'ios' ? 'IOS' : 'Android',
            });

            if (response?.ResponseStatus?.STATUSCODE === 200) {
                if(response.StatusCode.STATUSCODE === 3020){
                    setAPIError(true);
                    setIsLoading(false);
                    return;
                }
                dispatch(setStep2PhoneNumber(fullNumber));
                onNext(response.Userinfo, fullNumber);
            }

        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Mobile Number</Text>
                <CustomPhoneInput
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    onCountryChange={handleCountryChange}
                    placeholder={formatPatternToExamplePlaceHolder(selectedCountry?.pattern)}
                    error={error}
                    initialCountry={selectedCountry}
                />
                <Text style={{fontSize: 12,fontFamily: CAIRO_FONT_FAMILY.semiBold, color: '#666'}}>{`e.g: ${formatPatternToExample(selectedCountry?.pattern)}`}</Text>
                {apiError && <Text style={styles.errorText}>{t('phone_number_already_exists')}</Text>}
            </View>
            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                    ]}
                    onPress={handleNext}
                    disabled={false}
                >
                    <Text style={styles.nextButtonText}>
                        {`Next ${2}/4`}
                    </Text>
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={[
                styles.bottomContainer,
            ]}>
                <View style={[styles.orContainer]}>
                    <View style={styles.orLine} />
                    <Text style={[
                        styles.orText,
                    ]}>{t('or_by')}</Text>
                    <View style={styles.orLine} />
                </View>

                {renderSocialButtons()}

                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>By Clicking Next Or Continue,</Text>
                </View>
                <View style={[styles.signUpContainerBelow]}>
                    <Text style={[
                        styles.signUpText,
                    ]}>{`You Agree To The`}</Text>
                    <TouchableOpacity  style={{ paddingLeft: 3 }} onPress={() => { navigation.navigate(ROUTES.PrivacyPolicy as never)}}>
                        <Text style={[
                            styles.signUpLink,
                        ]}>{`Terms And Conditions`}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && <Modal
                transparent={true}
                animationType="fade"
                visible={isLoading}
                statusBarTranslucent={true}
                onRequestClose={() => { }}
                hardwareAccelerated={Platform.OS === 'android'}
                presentationStyle="overFullScreen"
            >
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <LoaderKit
                        style={{ width: 100, height: 100 }}
                        name={'BallSpinFadeLoader'}
                        color={'green'}
                    />
                </View>
            </Modal>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        ...globalTextStyles.bodyMedium,
        fontWeight: '500',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
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
        width: '100%',
        borderRadius: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    bottomContainer: {
        marginTop: 30,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    orText: {
        marginHorizontal: 8,
        ...globalTextStyles.label,
        color: '#666',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    signUpContainerBelow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#666',
    },
    signUpLink: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        textDecorationLine: 'underline',
        lineHeight: 20,
        fontWeight: '600',
        color: '#000',
    },
    socialButtonsRow: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
        paddingHorizontal: 0,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Platform.OS === 'ios' ? 8 : 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 48,
        minWidth: Platform.OS === 'ios' ? 140 : undefined,
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        flex: Platform.OS === 'ios' ? 1 : undefined,
        width: '100%',
    },
    appleButton: {
        backgroundColor: '#000000',
        width: '100%',
    },
    centerButton: {
        alignSelf: 'center',
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    socialButtonText: {
        ...globalTextStyles.bodySmall,
        color: '#333333',
        fontFamily: globalTextStyles.h5.fontFamily,
        // flexShrink: 1,
        textAlign: 'center',
    },
    requiredStar: {
        ...globalTextStyles.bodySmall,
        color: '#FF3B30',
    },
    errorText: {
        ...globalTextStyles.bodySmall,
        color: '#FF3B30',
        marginTop: 5,
    },
});

export default PersonalInfoStep;
