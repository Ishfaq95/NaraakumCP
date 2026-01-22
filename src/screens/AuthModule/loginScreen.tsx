import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  I18nManager,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { parsePhoneNumber, AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import CheckIcon from '../../assets/icons/CheckIcon';
import { authService } from '../../services/api/authService';
import { setUser, setToken, setRememberMeRedux } from '../../shared/redux/reducers/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenLoader from '../../components/FullScreenLoader';
import { signInWithGoogle } from '../../services/auth/googleAuthService';
import AuthHeader from '../../components/AuthHeader';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { globalTextStyles } from '../../styles/globalStyles';
import CustomPhoneInput, { COUNTRIES } from '../../components/common/CustomPhoneInput';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAlert } from '../../contexts/AlertContext';

const MIN_HEIGHT = 550; // Absolute minimum height
const OPTIMAL_HEIGHT = 750; // Height for medium screens

interface Country {
  code: string;
  name: string;
  nameAr: string;
  phoneCode: string;
  flag: string;
}

const LoginScreen = () => {
  const { height: windowHeight } = useWindowDimensions();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('mobile');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [formattedNumber, setFormattedNumber] = useState('');
  // const [fullNumber, setFullNumber] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = I18nManager.isRTL;
  const isLargeScreen = windowHeight > OPTIMAL_HEIGHT;
  const isSmallScreen = windowHeight < MIN_HEIGHT;
  const [isLoading, setIsLoading] = useState(false);
  const { rememberMeRedux } = useSelector((state: any) => state.root.user);
  const [phoneNumber, setPhoneNumber] = useState('');
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
  const { showAlert } = useAlert();
  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setError(false); // Clear error when user types
    if (apiError) setAPIError(false);
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
  };

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
    if (rememberMeRedux) {
      if (rememberMeRedux.Filter === "mob") {
        const phoneInfo = extractPhoneInfo(rememberMeRedux.Username || '');
        const getCountry = COUNTRIES.find(c => c.code === phoneInfo.countryCode);
        setSelectedCountry(getCountry);
        setPhoneNumber(phoneInfo.phoneNumber);
      } else {
        setEmailOrUsername(rememberMeRedux.Username);
      }
      setPassword(rememberMeRedux.Password);
      setActiveTab(rememberMeRedux.Filter === "mob" ? "mobile" : "email");
      setRememberMe(true);
    }
  }, [rememberMeRedux]);

  const handleLogin = async () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      let hasError = false;

      if (activeTab === 'email' && !emailOrUsername.trim()) {
        setEmailError(true);
        hasError = true;
      }

      if (activeTab === 'mobile' && !phoneNumber.trim()) {
        setError(true);
        hasError = true;
      }

      const digits = phoneNumber.replace(/\D/g, '');
      if (activeTab === 'mobile' && digits.length !== selectedCountry?.maxLength) {
        setError(true);
        hasError = true;
      }

      if (!password.trim()) {
        setPasswordError(true);
        hasError = true;
      }

      if (hasError) {
        setIsLoading(false);
        return;
      }

      const fullNumber = selectedCountry.dialCode + digits;

      let data = {
        "Username": activeTab === 'mobile' ? fullNumber : emailOrUsername,
        "Password": password,
        "Filter": activeTab === 'mobile' ? "mob" : "email"
      }

      const response = await authService.login(data);

      if (response?.ResponseStatus?.STATUSCODE == 200) {
        if (response?.Userinfo?.CatUserTypeId == 2 && response?.Userinfo?.CatUserRoleCategoryId == 2) {
          if (response.StatusCode.STATUSCODE == 200) {
            setIsLoading(false);
            dispatch(setUser(response.Userinfo));
            if (rememberMe) {
              const data = {
                "Username": activeTab === 'mobile' ? fullNumber : emailOrUsername,
                "Password": password,
                "Filter": activeTab === 'mobile' ? "mob" : "email"
              }
              dispatch(setRememberMeRedux(data));
            } else {
              dispatch(setRememberMeRedux(null));
            }
          } else {
            setAPIError(true);
          }
        } else {
          setAPIError(true);
        }


      } else {
        Alert.alert(
          "Error",
          response?.ResponseStatus?.MESSAGE,
          [{ text: "OK" }]
        );
      }
      setIsLoading(false);
    } catch (error: any) {
      setAPIError(true);
      setIsLoading(false);
      // Handle login error here (show error message, etc.)
    }
  };

  const handleEmailChange = (text: string) => {
    setEmailOrUsername(text);
    if (emailError) setEmailError(false);
    if (apiError) setAPIError(false);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(false);
    if (apiError) setAPIError(false);
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
        dispatch(setUser(response.Userinfo));
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
            style={[styles.socialButton, styles.googleButton]}
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

  const renderCountryItem = (item: any) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.flagText}>{item.flag}</Text>
        <Text style={styles.countryCodeText}>{item.phoneCode}</Text>
        <Text style={styles.countryNameText} numberOfLines={1}>
          {I18nManager.isRTL ? item.nameAr : item.name}
        </Text>
      </View>
    );
  };

  const formatPatternToExamplePlaceHolder = (pattern: string): string => {
    if (!pattern) return '';
    let digitCounter = 1;
    return pattern.replace(/#/g, '0');
  };

  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(ROUTES.welcomeScreen as never);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AuthHeader onBack={handleBack} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollView
            ]}
            bounces={false}
            showsVerticalScrollIndicator={isSmallScreen}>
            <View style={[
              styles.contentContainer
            ]}>
              <View style={{ height: 100, width: '100%', borderRadius: 12, padding: 16, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                <Text style={globalTextStyles.h2}>
                  {t('login')}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>
                <Text style={[{ textAlign: 'left', ...globalTextStyles.buttonMedium, color: '#666' }]}>{t('login_with')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setActiveTab('mobile')} style={[styles.tab, activeTab === 'mobile' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'mobile' && styles.activeTabText]}>{t('phone_username')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveTab('email')} style={[styles.tab, activeTab === 'email' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}> {t('email_username')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: 30 }}>
                  {/* Input Fields */}
                  {activeTab === 'email' ? (
                    <TextInput
                      style={[
                        styles.input,
                        styles.ltrInput,
                        emailError && styles.inputError
                      ]}
                      placeholder={"example@info.com"}
                      value={emailOrUsername}
                      onChangeText={handleEmailChange}
                      placeholderTextColor="#999"
                      textAlign="left"
                    />
                  ) : (
                    <CustomPhoneInput
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      onCountryChange={handleCountryChange}
                      placeholder={formatPatternToExamplePlaceHolder(selectedCountry?.pattern)}
                      error={error}
                      initialCountry={selectedCountry}
                    />
                  )}

                  {/* Password Input */}
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        isRTL && styles.rtlInput,
                        passwordError && styles.inputError
                      ]}
                      placeholder={t('password')}
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#999"
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeIcon width={22} height={22} color="#666666" />
                      ) : (
                        <EyeOffIcon width={22} height={22} color="#666666" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me and Forgot Password */}
                <View style={styles.rememberContainer}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}>
                    <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                      {rememberMe && <CheckIcon width={12} height={12} />}
                    </View>
                    <Text style={styles.rememberText}>{t('remember_me')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ForgotPassword as never)}>
                    <Text style={styles.forgotPassword}>{t('forgot_password')}</Text>
                  </TouchableOpacity>
                </View>

                {apiError &&
                  <Text style={{ color: 'red', fontSize: 16, marginTop: 10, textAlign: 'center', fontFamily: globalTextStyles.h5.fontFamily }}>{t("invalid_phone_or_password")}</Text>
                }

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.loginButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginButtonText}>{t('login')}</Text>
                </TouchableOpacity>

                {/* Bottom Section */}
                <View style={[
                  styles.bottomContainer,
                ]}>
                  <View style={[styles.orContainer]}>
                    <View style={styles.orLine} />
                    <Text style={[
                      styles.orText,
                      isLargeScreen && { fontSize: 14 }
                    ]}>{t('or_by')}</Text>
                    <View style={styles.orLine} />
                  </View>

                  {renderSocialButtons()}

                  <View style={[styles.signUpContainer]}>
                    <Text style={[
                      styles.signUpText,
                      isLargeScreen && { fontSize: 14 }
                    ]}>{t('dont_have_an_account')}</Text>
                    <TouchableOpacity style={{ paddingLeft: 5 }} onPress={() => navigation.navigate(ROUTES.SignUp)}>
                      <Text style={[
                        styles.signUpLink,
                        isLargeScreen && { fontSize: 14 }
                      ]}>{t('create_new_account')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>


            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      <FullScreenLoader visible={isLoading} />
    </View>
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
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    marginBottom: 8,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
  },
  createAccountText: {
    ...globalTextStyles.bodySmall,
    color: '#008080',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: { flexDirection: 'row', width: '48%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  tabText: {
    ...globalTextStyles.bodySmall,
    color: '#666',
  },
  activeTab: {
    backgroundColor: '#eaf6f6'
  },
  activeTabText: {
    ...globalTextStyles.bodySmall,
    color: '#008080',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 50,
    ...globalTextStyles.bodySmall,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mobileInputContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    ...globalTextStyles.caption,
    color: '#FF3B30',
    marginTop: 4,
    position: 'absolute',
    bottom: -20,
    left: 0,
  },
  dropdown: {
    height: '100%',
    minWidth: 110,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flagText: {
    ...globalTextStyles.bodyMedium,
    marginRight: 8,
  },
  countryCodeText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    marginRight: 8,
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  countryNameText: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    flex: 1,
  },
  mobileInput: {
    flex: 1,
    padding: 12,
    ...globalTextStyles.bodySmall,
    color: '#000',
    height: '100%',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 10,
    height: 50,
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    ...globalTextStyles.bodySmall,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: '100%',
    paddingRight: '10%',
    color: '#000'
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666666',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
    borderColor: '#008080',
  },
  rememberText: {
    ...globalTextStyles.caption,
    color: '#666666',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  forgotPassword: {
    ...globalTextStyles.label,
    textDecorationLine: 'underline',
    color: '#008080',
    fontFamily: globalTextStyles.h4.fontFamily,
  },
  loginButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 14,
    elevation: 2,
    zIndex: 1,
  },
  loginButtonText: {
    ...globalTextStyles.buttonMedium,
    color: '#FFFFFF',
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
  signUpText: {
    ...globalTextStyles.caption,
    color: '#666',
  },
  signUpLink: {
    ...globalTextStyles.caption,
    color: '#008080',
    fontFamily: globalTextStyles.h2.fontFamily,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  helpText: {
    ...globalTextStyles.caption,
    color: '#666',
  },
  ltrInput: {
    textAlign: 'left',
  },
  rtlInput: {
    textAlign: 'right',
    paddingRight: 12,
    paddingLeft: 12,
  },
  labelContainer: {
    width: '100%',
    marginBottom: 8,
  },
  inputLabel: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    marginTop: 10
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
    paddingHorizontal: Platform.OS === 'ios' ? 4 : 0,
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
    width: Platform.OS === 'android' ? '100%' : undefined,
  },
  appleButton: {
    backgroundColor: '#000000',
    flex: 1,
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
    flexShrink: 1,
    textAlign: 'center',
  },
  requiredStar: {
    ...globalTextStyles.bodySmall,
    color: '#FF3B30',
  },
});

export default LoginScreen; 