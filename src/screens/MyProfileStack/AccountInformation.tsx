import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Modal, useColorScheme } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import CustomPhoneInput, { COUNTRIES } from '../../components/common/CustomPhoneInput';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import Dropdown from '../../components/common/Dropdown';
import moment from 'moment';
import { MediaBaseURL } from '../../shared/utils/constants';
import DropDownWithCheckbox from '../../components/common/DropDownWithCheckbox';
import { authService } from '../../services/api/authService';
import { useAlert } from '../../contexts/AlertContext';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EmailUpdateComponent, { VerificationCodeCompoent } from '../../components/emailUpdateComponent';
import { launchImageLibrary, launchCamera, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import DateTimePicker from '@react-native-community/datetimepicker';

const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
];

const AccountInformationScreen = () => {
    const { showAlert } = useAlert();
    const navigation = useNavigation();
    const [englishName, setEnglishName] = useState('');
    const [profileImage, setProfileImage] = useState<any>(null);
    const [arabicName, setArabicName] = useState('');
    const [englishNameInputError, setEnglishNameInputError] = useState(false);
    const [arabicNameInputError, setArabicNameInputError] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<any>();
    const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState('')
    const [openPhoneBottomSheet, setOpenPhoneBottomSheet] = useState(false)
    const [userInfo, setUserInfo] = useState<any>(null);
    const [gender, setGender] = useState('male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [openDateOfBirthPicker, setOpenDateOfBirthPicker] = useState(false)
    const user = useSelector((state: any) => state.root.user.user);
    const [nationalities, setNationalities] = useState<any[]>([]);
    const [nationality, setNationality] = useState<string | number>('');
    const [email, setEmail] = useState('');
    const [openEmailBottomSheet, setOpenEmailBottomSheet] = useState(false)
    const [updatedEmail, setUpdatedEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [confirmPasswordError, setConfirmPasswordError] = useState(false)
    const [languages, setLanguages] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [country, setCountry] = useState<string | number>('');
    const [language, setLanguage] = useState<any[]>([]);
    const [emailBottomSheetHeight, setEmailBottomSheetHeight] = useState("35%")
    const [phoneBottomSheetHeight, setPhoneBottomSheetHeight] = useState("35%")
    const [selectedCountryUpdated, setSelectedCountryUpdated] = useState<any>();
    const [updatedPhoneNumberError, setUpdatedPhoneNumberError] = useState(false);
    const [emailInputError, setEmailInputError] = useState(false)
    const [experience, setExperience] = useState('');
    const [openVerifyBottomSheet, setOpenVerifyBottomSheet] = useState(false)
    const [openVerifyBottomSheetHeight, setOpenVerifyBottomSheetHeight] = useState("63%")
    const [otpAPIError, setOTPAPIError] = useState(false)
    const [OTPForText, setOTPForText] = useState('')
    const [OTPFrom, setOTPFrom] = useState('')
    const [otpValue, setOtpValue] = useState('')
    const [otpValueError, setOtpValueError] = useState(false)
    const [resentCode, setResentCode] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFullPhoneNumber, setSelectedFullPhoneNumber] = useState('')
    const [phoneNumberAPIError, setPhoneNumberAPIError] = useState(false)
    const [phoneNumberAPIErrorMessage, setPhoneNumberAPIErrorMessage] = useState('')
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const scrollViewRef = useRef<ScrollView>(null)
    const confirmPasswordInputRef = useRef<TextInput>(null)
    const [openImagePickerBottomSheet, setOpenImagePickerBottomSheet] = useState(false)
    const [tempImageUri, setTempImageUri] = useState<string | null>(null)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [dob, setDob] = useState('');
    const [show, setShow] = useState(false);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    // Initialize date to 18 years ago (maximum selectable date)
    const getInitialDate = () => {
        const today = new Date();
        const initialDate = new Date();
        initialDate.setFullYear(today.getFullYear() - 18);
        return initialDate;
    };
    const [date, setDate] = useState(getInitialDate());
    const [selectedYear, setSelectedYear] = useState(date.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
    const [selectedDay, setSelectedDay] = useState(date.getDate());

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            if (Platform.OS === 'ios') {
                if (openVerifyBottomSheet) {
                    setOpenVerifyBottomSheetHeight('80%')
                }
                if (openPhoneBottomSheet) {
                    setPhoneBottomSheetHeight('60%')
                }
                if (openEmailBottomSheet) {
                    setEmailBottomSheetHeight('65%')
                }
            }
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (Platform.OS === 'ios') {
                if (openVerifyBottomSheet) {
                    setOpenVerifyBottomSheetHeight('63%')
                }
                if (openPhoneBottomSheet) {
                    setPhoneBottomSheetHeight('35%')
                }
                if (openEmailBottomSheet) {
                    setEmailBottomSheetHeight('35%')
                }
            }
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [openVerifyBottomSheet, openPhoneBottomSheet, openEmailBottomSheet]);

    // Keyboard listener for main form
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setIsKeyboardVisible(true);
            }
        );
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
            }
        );
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (user) {
            getUserInfoByUserId();
        }
    }, [user])

    const getNationalities = async () => {
        try {
            const response = await profileService.getNationalities();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setNationalities(response.Data.map((item: any) => ({ label: item.TitlePlang, value: item.Id })));
            }
        }
        catch (error: any) {
        }
    }

    useEffect(() => {
        getNationalities();
        getLanguages();
        getCountries();
    }, [])

    const getLanguages = async () => {
        const response = await authService.getAllLanguages();
        if (response.ResponseStatus.STATUSCODE) {
            const languages = response.list.map((item: any) => ({
                label: item.TitlePlang,
                value: item.Id
            }));
            setLanguages(languages);
        }
    };

    const getCountries = async () => {
        const response = await authService.getAllCountries();
        if (response.ResponseStatus.STATUSCODE) {
            const countries = response.Data.map((item: any) => ({
                label: item.TitlePlang,
                value: item.Id
            }));
            setCountries(countries);
        }
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
        if (userInfo) {
            console.log("userInfo", userInfo)
            setProfileImage(userInfo.ImagePath);
            setEnglishName(userInfo.FullNamePlang);
            setArabicName(userInfo.FullNameSlang);
            setExperience(userInfo.YearsOFExperience.toString() || '');
            setLanguage(userInfo.CatLanguageIds.split(",").map(Number));
            setCountry(Number(userInfo.CountryId));
            setNationality(Number(userInfo.CatNationalityId));
            const phoneInfo = extractPhoneInfo(userInfo.CellNumber || '');
            const getCountry = COUNTRIES.find(c => c.code === phoneInfo.countryCode);
            setSelectedCountry(getCountry);
            setSelectedCountryUpdated(getCountry);
            setUpdatedPhoneNumber(phoneInfo.phoneNumber);
            setMobileNumber(phoneInfo.phoneNumber);
            setDob(userInfo.DateofBirth ? moment(userInfo.DateofBirth).format('YYYY-MM-DD').toString() : '');
            setGender(userInfo.Gender == true ? 'male' : 'female');
            setEmail(userInfo.Email);
        }
    }, [userInfo])

    console.log("dob", dob)

    const getUserInfoByUserId = async () => {
        try {
            const payload = {
                UserlogiInfoId: user.Id,
            };
            const response = await profileService.getUserInfoByUserId(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setUserInfo(response.UserDetail[0]);
            }
        }
        catch (error: any) {
        }
    }

    const handlePhoneNumberChange = (text: string) => {
        setMobileNumber(text);
    };

    const handleCountryChange = (country: any) => {
        setSelectedCountry(country);
    };

    const HandleOpenPhoneBottomSheet = () => {
        setUpdatedPhoneNumber("")
        setOpenPhoneBottomSheet(true)
    }

    const HandleOpenDateOfBirthPicker = () => {
        setOpenDateOfBirthPicker(true)
    }

    const HandleOpenEmailBottomSheet = () => {
        setUpdatedEmail("")
        setOpenEmailBottomSheet(true)
    }

    const handleImagePickerPress = () => {
        setOpenImagePickerBottomSheet(true)
    }

    const handlePickFromCamera = async () => {
        setOpenImagePickerBottomSheet(false)
        try {
            // Request camera permission on iOS
            if (Platform.OS === 'ios') {
                const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
                if (cameraPermission !== RESULTS.GRANTED) {
                    showAlert({
                        title: 'Permission Denied',
                        message: 'Camera permission is required to take photos',
                        type: 'error',
                    });
                    return;
                }
            }

            const result: ImagePickerResponse = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                let errorMessage = 'Failed to open camera';
                if (result.errorCode === 'camera_unavailable') {
                    errorMessage = 'Camera is not available on this device';
                } else if (result.errorCode === 'permission') {
                    errorMessage = 'Camera permission was denied';
                }
                showAlert({
                    title: 'Error',
                    message: errorMessage,
                    type: 'error',
                });
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                await handleImageUpload(asset);
            }
        } catch (error: any) {
            showAlert({
                title: 'Error',
                message: error.message || 'Failed to open camera',
                type: 'error',
            });
        }
    }

    const handlePickFromLibrary = async () => {
        setOpenImagePickerBottomSheet(false)
        try {
            // Request photo library permission on iOS
            if (Platform.OS === 'ios') {
                const photoPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
                if (photoPermission !== RESULTS.GRANTED) {
                    showAlert({
                        title: 'Permission Denied',
                        message: 'Photo library permission is required to select images',
                        type: 'error',
                    });
                    return;
                }
            }

            const result: ImagePickerResponse = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                let errorMessage = 'Failed to open image library';
                if (result.errorCode === 'permission') {
                    errorMessage = 'Photo library permission was denied';
                }
                showAlert({
                    title: 'Error',
                    message: errorMessage,
                    type: 'error',
                });
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                await handleImageUpload(asset);
            }
        } catch (error: any) {
            showAlert({
                title: 'Error',
                message: error.message || 'Failed to open image library',
                type: 'error',
            });
        }
    }

    const handleImageUpload = async (asset: Asset) => {
        if (!asset.uri) {
            showAlert({
                title: 'Error',
                message: 'Invalid image selected',
                type: 'error',
            });
            return;
        }

        // Set temporary URI to show image immediately
        setTempImageUri(asset.uri);

        try {
            setIsUploading(true);

            // Create file object for upload
            const file = {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `profile_${Date.now()}.jpg`,
            };

            // Upload the image
            const uploadResponse = await profileService.uploadFile(file, user);

            if (uploadResponse?.ResponseStatus?.STATUSCODE === 200 || uploadResponse?.ResponseStatus?.STATUSCODE === '200') {
                const imagePath = uploadResponse?.Data?.Path || uploadResponse?.Path;
                setProfileImage(imagePath);
                setTempImageUri(null); // Clear temp URI after successful upload

            } else {
                setTempImageUri(null); // Clear temp URI on error
                showAlert({
                    title: 'Error',
                    message: 'Failed to upload image',
                    type: 'error',
                });
            }
        } catch (error: any) {
            setTempImageUri(null); // Clear temp URI on error
            showAlert({
                title: 'Error',
                message: error.message || 'Failed to upload image',
                type: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    }

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(false); // remove red border on edit
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (confirmPasswordError) setConfirmPasswordError(false); // remove red border on edit
    };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Personal Profile</Text>
        </View>
    );

    const updateUserProfileHandler = async () => {
        if (password.trim() !== '' && password !== confirmPassword) {
            setConfirmPasswordError(true)
            return;
        }

        const fullPhoneNumber = `${selectedCountryUpdated?.dialCode}${updatedPhoneNumber.replace(/\s+/g, "")}`
        const payload = {
            "FullNamePlang": englishName,
            "FullNameSlang": arabicName,
            "CellNumber": fullPhoneNumber,
            "Email": updatedEmail || email,
            "CatNationalityId": nationality.toString(),
            "IDNumber": user.IDNumber,
            "Gender": gender === 'male' ? '1' : '0',
            "DateofBirth": dob,
            "ImagePath": profileImage,
            "Password": password,
            "UserLoginInfoId": user.Id,
            YearsofExperience: experience,
            CountryId: country.toString(),
            LanguageIds: language.join(','),
        }

        if (password) {
            payload.Password = password;
        }

        try {
            const response = await profileService.updateServiceProviderPersonalProfile(payload);
            console.log("response", response)
            if (response.ResponseStatus.STATUSCODE === 200) {
                getUserInfoByUserId()
                showAlert({
                    title: 'Profile updated successfully',
                    message: '',
                    type: 'success',
                });
            }
        }
        catch (error: any) {
            console.log("error", error)
        }
    }

    const handleSave = async () => {
        const fullNumber = selectedCountry.dialCode + mobileNumber;
        const payload = {
            "FullNamePlang": englishName,
            "FullNameSlang": arabicName,
            "CellNumber": fullNumber,
            "Email": email,
            "CatNationalityId": nationality.toString(),
            "IDNumber": user.IDNumber,
            "Gender": gender === 'male' ? 1 : 0,
            "DateofBirth": dob,
            "ImagePath": profileImage,
            "Password": password,
            "UserLoginInfoId": user.Id,
            YearsofExperience: experience,
            CountryId: country.toString(),
            LanguageIds: language.join(','),
        }

        if (password.trim() !== '' && password !== confirmPassword) {
            setConfirmPasswordError(true)
            return;
        }

        if (password) {
            payload.Password = password;
        }

        try {
            const response = await profileService.updateServiceProviderPersonalProfile(payload);
            if (response.ResponseStatus.STATUSCODE === 200) {
                showAlert({
                    title: 'Profile updated successfully',
                    message: '',
                    type: 'success',
                });
            }
        }
        catch (error: any) {
        }
    }

    const handlePhoneNumberUpdate = (text: string) => {
        setPhoneNumberAPIError(false)
        setPhoneNumberAPIErrorMessage('')
        setUpdatedPhoneNumber(text);
    };

    const handleCountryUpdate = (country: any) => {
        setSelectedCountryUpdated(country);
    };

    const HandlePhoneUpdate = async () => {
        if (!updatedPhoneNumber || updatedPhoneNumber.trim() === '') {
            setUpdatedPhoneNumberError(true)
            return;
        }
        try {
            const fullPhoneNumber = `${selectedCountryUpdated?.dialCode}${updatedPhoneNumber.replace(/\s+/g, "")}`
            setIsUploading(true)
            const payload = {
                "Phonenumber": fullPhoneNumber,
                "UserId": user.Id
            }

            const response = await profileService.userUpdatedPhone(payload)
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                if (response?.StatusCode?.STATUSCODE == 3020) {
                    //   setOpenPhoneBottomSheet(false)
                    setPhoneNumberAPIError(true)
                    setPhoneNumberAPIErrorMessage(response.StatusCode.MESSAGE)
                    return;
                }
                setOpenPhoneBottomSheet(false)
                setSelectedFullPhoneNumber(fullPhoneNumber)
                setOTPFrom('phone')
                setOTPForText(fullPhoneNumber)
                setTimeout(() => {
                    setOpenVerifyBottomSheet(true)
                }, 500)
            }

        } catch (error) {
        } finally {
            setIsUploading(false)
        }
    }

    const HandleEmailUpdate = async () => {
        if (!updatedEmail) {
            setEmailInputError(true)
            return;
        }
        try {
            setIsUploading(true)
            const payload = {
                "Email": updatedEmail,
                "UserId": user.Id
            }

            const response = await profileService.userUpdatedEmail(payload)
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                if (response?.StatusCode?.STATUSCODE == 3002) {
                    setOpenEmailBottomSheet(false)
                    setTimeout(() => {
                        showAlert({
                            title: 'Email already exists',
                            message: '',
                            type: 'error',
                        });
                    }, 500)
                    return;
                }
                setOpenEmailBottomSheet(false)
                setOTPFrom('email')
                setOTPForText(updatedEmail)
                setTimeout(() => {
                    setOpenVerifyBottomSheet(true)
                }, 500)
            }

        } catch (error) {
        } finally {
            setIsUploading(false);
        }
    }

    const HandleCloseEmailModal = () => {
        setOpenEmailBottomSheet(false)
        setEmailBottomSheetHeight("35%")
    }

    const HandleCloseVerifyModal = () => {
        setOtpValue('')
        setOpenVerifyBottomSheet(false)
        setOpenVerifyBottomSheetHeight("63%")
    }

    const HandleOtpResendButton = async () => {
        try {
            setIsUploading(true)
            const payload = {
                "UserId": user?.Id,
            }

            const response = await profileService.resendOtp(payload)
            if (response?.ResponseStatus?.STATUSCODE == 3009) {
                setResentCode(true)
                setOtpValueError(false)
            }


        } catch (error) {
        } finally {
            setIsUploading(false)
        }
    }

    const HandleOtpSubmit = async () => {
        try {
            setOTPAPIError(false)
            if (otpValue == '' || otpValue.length < 4) {
                setOtpValueError(true)
                return;
            }

            setIsUploading(true)
            const payload = {
                "UserId": user?.Id,
                "VerificationCode": otpValue,
                "VerificationPlatformId": "1"
            }

            const response = await profileService.verifyUserUpdatedData(payload)
            if (response?.StatusCode?.STATUSCODE == 3007) {
                updateUserProfileHandler()
            }
            if (response?.StatusCode?.STATUSCODE == 3005) {
                setOTPAPIError(true)
                return;
            }
            setOpenVerifyBottomSheet(false)
            setOtpValue('')

        } catch (error) {
        } finally {
            setIsUploading(false)
        }

    }

    const formatPatternToExamplePlaceHolder = (pattern: string): string => {
        if (!pattern) return '';
        let digitCounter = 1;
        return pattern.replace(/#/g, '0');
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
        if (Platform.OS === 'android') {
            setShow(false);
        }
    };

    // Calculate maximum date (18 years ago from today)
    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 18);
        return maxDate;
    };

    // Calculate minimum date (100 years ago from today)
    // Note: Android DatePicker has a system limitation and cannot display dates before January 1, 1970
    // If 100 years ago is before 1970, Android will automatically limit to 1970
    const getMinDate = () => {
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 100);
        minDate.setHours(0, 0, 0, 0);
        return minDate;
    };

    const maxDate = getMaxDate();
    const minDate = getMinDate();

    // Generate year, month, and day arrays for custom Android picker
    const getYears = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 100;
        const maxYear = currentYear - 18;
        for (let year = maxYear; year >= minYear; year--) {
            years.push(year);
        }
        return years;
    };

    const getMonths = () => {
        return Array.from({ length: 12 }, (_, i) => i);
    };

    const getDays = (year: number, month: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const handleConfirm = (selectedDate: Date) => {
        // Format as DD/MM/YYYY for display
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        setDate(selectedDate);
        setDob(formattedDate);
        hideDatePicker();
    };

    const handleAndroidDateConfirm = () => {
        // Validate day based on selected month and year
        const daysInMonth = getDays(selectedYear, selectedMonth).length;
        const validDay = Math.min(selectedDay, daysInMonth);

        const selectedDate = new Date(selectedYear, selectedMonth, validDay);

        // Validate date is within range (18-100 years)
        if (selectedDate > maxDate) {
            // Date is too recent (less than 18 years ago)
            const adjustedDate = new Date(maxDate);
            handleConfirm(adjustedDate);
        } else if (selectedDate < minDate) {
            // Date is too old (more than 100 years ago)
            const adjustedDate = new Date(minDate);
            handleConfirm(adjustedDate);
        } else {
            handleConfirm(selectedDate);
        }
    };

    const showDatePicker = () => {
        if (Platform.OS === 'ios') {
            setDatePickerVisibility(true);
        } else {
            // For Android, use custom modal picker
            setSelectedYear(date.getFullYear());
            setSelectedMonth(date.getMonth());
            setSelectedDay(date.getDate());
            setDatePickerVisibility(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}> */}
            {renderHeader()}
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                <View style={{ height: 100, backgroundColor: '#23a2a4',paddingTop: 10 }} >
                    <Image 
                        source={require('../../assets/icons/logo.png')} 
                        style={{ 
                            width: 100, 
                            height: 100,
                            ...(Platform.OS === 'ios' ? { tintColor: '#5a898a' } : {tintColor: '#5a898a'})
                        }}  
                        resizeMode='contain'
                    />
                </View>
                <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -70 }}>
                    <View style={{ height: 80, marginTop: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', height: 100, borderWidth: 2, borderColor: '#fff', width: 100, bottom: 50, backgroundColor: '#999', borderRadius: 50, }}>
                            <Image
                                source={{ uri: tempImageUri || (profileImage ? `${MediaBaseURL}${profileImage}` : '') }}
                                style={{ width: '100%', height: '100%', borderRadius: 50 }}
                            />
                            {isUploading && (
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 12 }}>Uploading...</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={handleImagePickerPress}
                                style={{ position: 'absolute', height: 30, width: 30, backgroundColor: '#fff', borderRadius: 15, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Ionicons name="camera" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', bottom: -15 }}>Upload Image</Text>
                    </View>

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        <ScrollView
                            ref={scrollViewRef}
                            showsVerticalScrollIndicator={false}
                            style={styles.scrollContainer}
                            contentContainerStyle={{
                                paddingBottom: isKeyboardVisible ? 150 : 20
                            }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10 }}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Full Name <Text style={{ fontFamily: CAIRO_FONT_FAMILY.semiBold, fontSize: 14, fontWeight: '600', color: '#666666' }}>(In English)</Text></Text>
                                    <TextInput style={[styles.input, englishNameInputError && { borderWidth: 1, borderColor: 'red' }]} value={englishName} onChangeText={setEnglishName} placeholder="Name" />
                                </View>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                    {/* Name */}

                                    <View style={{ width: '65%' }} >
                                        <Text style={styles.label}>Full Name <Text style={{ fontFamily: CAIRO_FONT_FAMILY.semiBold, fontSize: 14, fontWeight: '600', color: '#666666' }}>(In Arabic)</Text></Text>
                                        <TextInput style={[styles.input, arabicNameInputError && { borderWidth: 1, borderColor: 'red' }]} value={arabicName} onChangeText={setArabicName} placeholder="Name" />
                                    </View>
                                    <View style={{ width: '33%' }} >
                                        <Text style={styles.label}>Experience</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                            <TextInput
                                                style={[styles.input, { width: '60%' }]}
                                                keyboardType="numeric"
                                                placeholderTextColor="#969696"
                                                value={experience}
                                                placeholder="0"
                                                maxLength={2}
                                                onChangeText={(text) => {
                                                    // Only allow numeric input and limit to 2 digits
                                                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                                                    setExperience(numericText);
                                                }}
                                            />
                                            <Text style={styles.suffixText}>/ Year</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.row, { marginTop: 10 }]}>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>I Speak The Following Languages:</Text>
                                        <DropDownWithCheckbox
                                            data={languages}
                                            value={Array.isArray(language) ? (language as any) : []}
                                            error={false}
                                            onChange={(vals) => {
                                                setLanguage(vals as any);
                                            }}
                                            placeholder="-- Select --"
                                            containerStyle={{ height: 44 }}
                                            dropdownStyle={[{ height: 44 }]}
                                        />
                                        {/* {errors.language && <Text style={styles.errorText}>{errors.language}</Text>} */}
                                    </View>
                                </View>

                                <View style={[styles.fieldGroup, styles.row, { marginTop: 10 }]}>

                                    <View style={{ width: '48%', }}>
                                        <Text style={styles.label}>Date of Birth</Text>
                                        <View style={[styles.input,{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                                            <Text style={{ fontSize: 15, color: '#000', fontFamily: CAIRO_FONT_FAMILY.regular, fontWeight: '400' }}>{dob}</Text>
                                            <TouchableOpacity onPress={showDatePicker} style={[styles.dateOfBirthBtn]}>
                                                <Icon name="calendar-month" size={18} color="#000" style={{ marginLeft: 4 }} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Android custom date picker modal */}
                                        {Platform.OS === 'android' && (
                                            <Modal
                                                animationType="slide"
                                                transparent={true}
                                                visible={isDatePickerVisible}
                                                onRequestClose={hideDatePicker}
                                            >
                                                <View style={styles.modalOverlay}>
                                                    <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                                                        <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                                                            <TouchableOpacity onPress={hideDatePicker}>
                                                                <Text style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}>Cancel</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={handleAndroidDateConfirm}>
                                                                <Text style={[styles.doneButton, isDarkMode && styles.doneButtonDark]}>Done</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={[styles.customPickerContainer, isDarkMode && styles.datePickerContainerDark]}>
                                                            {/* Year Picker */}
                                                            <View style={styles.pickerColumn}>
                                                                <Text style={[styles.pickerLabel, isDarkMode && styles.pickerLabelDark]}>Year</Text>
                                                                <ScrollView
                                                                    style={styles.pickerScrollView}
                                                                    showsVerticalScrollIndicator={false}
                                                                >
                                                                    {getYears().map((year) => (
                                                                        <TouchableOpacity
                                                                            key={year}
                                                                            style={[
                                                                                styles.pickerItem,
                                                                                selectedYear === year && styles.pickerItemSelected,
                                                                                isDarkMode && styles.pickerItemDark,
                                                                                selectedYear === year && isDarkMode && styles.pickerItemSelectedDark
                                                                            ]}
                                                                            onPress={() => {
                                                                                setSelectedYear(year);
                                                                                // Adjust day if needed
                                                                                const daysInMonth = getDays(year, selectedMonth).length;
                                                                                if (selectedDay > daysInMonth) {
                                                                                    setSelectedDay(daysInMonth);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Text style={[
                                                                                styles.pickerItemText,
                                                                                selectedYear === year && styles.pickerItemTextSelected,
                                                                                isDarkMode && styles.pickerItemTextDark,
                                                                                selectedYear === year && isDarkMode && styles.pickerItemTextSelectedDark
                                                                            ]}>
                                                                                {year}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </ScrollView>
                                                            </View>

                                                            {/* Month Picker */}
                                                            <View style={styles.pickerColumn}>
                                                                <Text style={[styles.pickerLabel, isDarkMode && styles.pickerLabelDark]}>Month</Text>
                                                                <ScrollView
                                                                    style={styles.pickerScrollView}
                                                                    showsVerticalScrollIndicator={false}
                                                                >
                                                                    {getMonths().map((month) => (
                                                                        <TouchableOpacity
                                                                            key={month}
                                                                            style={[
                                                                                styles.pickerItem,
                                                                                selectedMonth === month && styles.pickerItemSelected,
                                                                                isDarkMode && styles.pickerItemDark,
                                                                                selectedMonth === month && isDarkMode && styles.pickerItemSelectedDark
                                                                            ]}
                                                                            onPress={() => {
                                                                                setSelectedMonth(month);
                                                                                // Adjust day if needed
                                                                                const daysInMonth = getDays(selectedYear, month).length;
                                                                                if (selectedDay > daysInMonth) {
                                                                                    setSelectedDay(daysInMonth);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Text style={[
                                                                                styles.pickerItemText,
                                                                                selectedMonth === month && styles.pickerItemTextSelected,
                                                                                isDarkMode && styles.pickerItemTextDark,
                                                                                selectedMonth === month && isDarkMode && styles.pickerItemTextSelectedDark
                                                                            ]}>
                                                                                {moment().month(month).format('MMM')}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </ScrollView>
                                                            </View>

                                                            {/* Day Picker */}
                                                            <View style={styles.pickerColumn}>
                                                                <Text style={[styles.pickerLabel, isDarkMode && styles.pickerLabelDark]}>Day</Text>
                                                                <ScrollView
                                                                    style={styles.pickerScrollView}
                                                                    showsVerticalScrollIndicator={false}
                                                                >
                                                                    {getDays(selectedYear, selectedMonth).map((day) => (
                                                                        <TouchableOpacity
                                                                            key={day}
                                                                            style={[
                                                                                styles.pickerItem,
                                                                                selectedDay === day && styles.pickerItemSelected,
                                                                                isDarkMode && styles.pickerItemDark,
                                                                                selectedDay === day && isDarkMode && styles.pickerItemSelectedDark
                                                                            ]}
                                                                            onPress={() => setSelectedDay(day)}
                                                                        >
                                                                            <Text style={[
                                                                                styles.pickerItemText,
                                                                                selectedDay === day && styles.pickerItemTextSelected,
                                                                                isDarkMode && styles.pickerItemTextDark,
                                                                                selectedDay === day && isDarkMode && styles.pickerItemTextSelectedDark
                                                                            ]}>
                                                                                {day}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </Modal>
                                        )}

                                        {/* iOS date picker modal */}
                                        {Platform.OS === 'ios' && (
                                            <Modal
                                                animationType="slide"
                                                transparent={true}
                                                visible={isDatePickerVisible}
                                                onRequestClose={hideDatePicker}
                                            >
                                                <View style={styles.modalOverlay}>
                                                    <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                                                        <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                                                            <TouchableOpacity onPress={hideDatePicker}>
                                                                <Text style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}>Cancel</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    handleConfirm(date);
                                                                }}
                                                            >
                                                                <Text style={[styles.doneButton, isDarkMode && styles.doneButtonDark]}>Done</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={[styles.datePickerContainer, isDarkMode && styles.datePickerContainerDark]}>
                                                            <DateTimePicker
                                                                value={date}
                                                                mode="date"
                                                                display="spinner"
                                                                onChange={(event, selectedDate) => {
                                                                    if (selectedDate) {
                                                                        setDate(selectedDate);
                                                                    }
                                                                }}
                                                                maximumDate={maxDate}
                                                                minimumDate={minDate}
                                                                style={styles.datePicker}
                                                                textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                                                                themeVariant={isDarkMode ? 'dark' : 'light'}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </Modal>
                                        )}
                                    </View>
                                    <View style={{ width: '48%', }}>
                                        <Text style={styles.label}>Gender</Text>
                                        <Dropdown data={genders} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={gender} onChange={(value: string | number) => setGender(value.toString())} placeholder="الجنس" />
                                    </View>
                                </View>

                                <View style={[styles.row]}>
                                    <View style={{ width: '49%' }} >
                                        <Text style={styles.label}>Country</Text>
                                        <Dropdown
                                            data={countries}
                                            value={country}
                                            onChange={(value) => {
                                                setCountry(value);
                                            }}
                                            error={false}
                                            containerStyle={{ height: 44 }}
                                            dropdownStyle={[{ height: 44 }]}
                                            placeholder="--Select--"
                                        />
                                        {/* {errors.country && <Text style={styles.errorText}>{errors.country}</Text>} */}
                                    </View>
                                    <View style={{ width: '49%' }} >
                                        <Text style={styles.label}>Nationality</Text>
                                        <Dropdown
                                            data={countries}
                                            value={nationality}
                                            onChange={(value) => {
                                                setNationality(value);
                                            }}
                                            placeholder="--Select--"
                                            error={false}
                                            containerStyle={{ height: 44 }}
                                            dropdownStyle={[{ height: 44 }]}
                                        />
                                        {/* {errors.nationality && <Text style={styles.errorText}>{errors.nationality}</Text>} */}
                                    </View>
                                </View>

                                {/* Mobile */}
                                <View style={[styles.fieldGroup, { marginTop: 10 }]}>
                                    <Text style={styles.label}>Mobile Number</Text>
                                    <View style={styles.row}>
                                        <CustomPhoneInput
                                            value={mobileNumber}
                                            onChangeText={handlePhoneNumberChange}
                                            onCountryChange={handleCountryChange}
                                            placeholder="Mobile Number"
                                            error={false}
                                            disabled={true}
                                            initialCountry={selectedCountry}
                                        />
                                        <TouchableOpacity onPress={HandleOpenPhoneBottomSheet} style={[styles.updateBtn, { height: 40, top: 4 }]}>
                                            <Text style={styles.updateBtnText}>Update</Text>
                                            <Icon name="edit" size={18} color="#fff" style={{ marginLeft: 4 }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Email */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>User Name</Text>
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, textAlign: 'left' }]}
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="abcd@xyz.com"
                                            keyboardType="email-address"
                                            editable={false}
                                        />
                                        <TouchableOpacity onPress={HandleOpenEmailBottomSheet} style={styles.updateBtn}>
                                            <Text style={styles.updateBtnText}>Update</Text>
                                            <Icon name="edit" size={18} color="#fff" style={{ marginLeft: 4 }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Password Input */}
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[
                                            styles.passwordInput,
                                            passwordError && styles.inputError
                                        ]}
                                        placeholder={"********"}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        secureTextEntry={!showPassword}
                                        textContentType='oneTimeCode'
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        {showPassword ? (
                                            <Ionicons name="eye" size={22} color="#666666" />
                                        ) : (
                                            <Ionicons name="eye-off" size={22} color="#666666" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {/* Confirm Password */}
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        ref={confirmPasswordInputRef}
                                        style={[
                                            styles.passwordInput,
                                            confirmPasswordError && styles.inputError
                                        ]}
                                        placeholder={"********"}
                                        value={confirmPassword}
                                        textContentType='oneTimeCode'
                                        onChangeText={handleConfirmPasswordChange}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholderTextColor="#999"
                                        onFocus={() => {
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, Platform.OS === 'ios' ? 100 : 300);
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        {showConfirmPassword ? (
                                            <Ionicons name="eye" size={22} color="#666666" />
                                        ) : (
                                            <Ionicons name="eye-off" size={22} color="#666666" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {confirmPasswordError && <Text style={styles.errorText}>Password and Confirm Password do not match</Text>}
                            </View>

                            {/* <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10, marginTop: 10 }}> */}

                            {/* </View> */}
                        </ScrollView>
                    </KeyboardAvoidingView>
                    <View style={{ paddingVertical: 10 }}>
                        <TouchableOpacity onPress={updateUserProfileHandler} style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            <CustomBottomSheet
                visible={openPhoneBottomSheet}
                onClose={() => setOpenPhoneBottomSheet(false)}
                showHandle={false}
                maxHeight={phoneBottomSheetHeight}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={[styles.modalContainer]}>
                        <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: CAIRO_FONT_FAMILY.bold,
                                color: '#36454F',

                            }}>Change Phone</Text>
                            <TouchableOpacity onPress={() => {
                                setOpenPhoneBottomSheet(false)
                                setPhoneBottomSheetHeight("35%")
                            }}>
                                <AntDesign name="close" size={24} color="#979e9eff" />
                            </TouchableOpacity>

                        </View>
                        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                            <Text style={styles.label}>Enter your new phone No.</Text>
                            <CustomPhoneInput
                                value={updatedPhoneNumber}
                                onChangeText={handlePhoneNumberUpdate}
                                onCountryChange={handleCountryUpdate}
                                placeholder={formatPatternToExamplePlaceHolder(selectedCountry?.pattern)}
                                error={updatedPhoneNumberError}
                                initialCountry={selectedCountryUpdated}
                            />

                            {phoneNumberAPIError && <Text style={styles.errorText}>{phoneNumberAPIErrorMessage}</Text>}
                            <TouchableOpacity onPress={HandlePhoneUpdate} style={styles.saveBtn}>
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={openEmailBottomSheet}
                onClose={() => setOpenEmailBottomSheet(false)}
                showHandle={false}
                maxHeight={emailBottomSheetHeight}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={[styles.modalContainer]}>
                        <EmailUpdateComponent
                            HandleEmailUpdate={HandleEmailUpdate}
                            onChangeText={(text) => {
                                setUpdatedEmail(text)
                                setEmailInputError(false)
                            }}
                            value={updatedEmail}
                            onClosePress={HandleCloseEmailModal}
                            inputError={emailInputError}
                        />

                    </View>
                </TouchableWithoutFeedback>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={openVerifyBottomSheet}
                onClose={() => setOpenVerifyBottomSheet(false)}
                showHandle={false}
                maxHeight={openVerifyBottomSheetHeight}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={[styles.modalContainer]}>
                        <VerificationCodeCompoent
                            onClosePress={HandleCloseVerifyModal}
                            OTPFor={OTPForText}
                            OTPForText={OTPFrom == 'email' ? "Change Email" : "Change Number"}
                            OTPFrom={OTPFrom}
                            onChangeText={(text) => {
                                setOtpValue(text)
                                setOtpValueError(false)
                            }}
                            value={otpValue}
                            OtpSubmitButton={HandleOtpSubmit}
                            HandleResendPress={HandleOtpResendButton}
                            resentCode={resentCode}
                            otpError={otpValueError}
                            otpApiError={otpAPIError}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={openImagePickerBottomSheet}
                onClose={() => setOpenImagePickerBottomSheet(false)}
                showHandle={false}
                maxHeight="30%"
            >
                <View style={[styles.modalContainer]}>
                    <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: CAIRO_FONT_FAMILY.bold,
                            color: '#36454F',
                        }}>Select Image Source</Text>
                        <TouchableOpacity onPress={() => setOpenImagePickerBottomSheet(false)}>
                            <AntDesign name="close" size={24} color="#979e9eff" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
                        <TouchableOpacity
                            onPress={handlePickFromCamera}
                            style={[styles.imagePickerOption, { marginBottom: 12 }]}
                        >
                            <Ionicons name="camera-outline" size={24} color="#23a2a4" />
                            <Text style={styles.imagePickerOptionText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePickFromLibrary}
                            style={styles.imagePickerOption}
                        >
                            <Ionicons name="images-outline" size={24} color="#23a2a4" />
                            <Text style={styles.imagePickerOptionText}>Choose from Library</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomBottomSheet>
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
    scrollContainer: {
        marginTop: 10,
    },
    fieldGroup: {
        marginBottom: 12,
        flex: 1,
    },
    label: {
        fontSize: 15,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        marginBottom: 4,
        textAlign: 'left',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        height: 50,
        fontSize: 15,
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.regular,

    },
    row: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    updateBtn: {
        position: 'absolute',
        right: 0,
        top: 3,
        height: 43,
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
    },
    dateOfBirthBtn: {
        position: 'absolute',
        right: 8,
        top: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
    },
    updateBtnText: {
        color: '#fff',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        fontSize: 15,
    },
    passwordContainer: {
        position: 'relative',
        marginBottom: 4,
        height: 50,
    },
    passwordInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: '100%',
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -11 }],
    },
    rtlInput: {
        textAlign: 'right',
        paddingRight: 12,
        paddingLeft: 12,
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    suffixText: {
        ...globalTextStyles.bodySmall,
        color: '#239EA0',
        // marginLeft: 8,
        alignSelf: 'center',
    },
    col: {
        flex: 1,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'white',
        // padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    saveBtn: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
    },
    saveBtnText: {
        color: '#fff',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        // marginTop: 4,
    },
    imagePickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    imagePickerOptionText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#333',
        marginLeft: 12,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalContentDark: {
        backgroundColor: '#1C1C1E',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalHeaderDark: {
        borderBottomColor: '#38383A',
    },
    cancelButton: {
        color: '#999',
        fontSize: 16,
    },
    cancelButtonDark: {
        color: '#FFFFFF',
    },
    doneButton: {
        color: '#20B2AA',
        fontSize: 16,
        fontWeight: '600',
    },
    doneButtonDark: {
        color: '#20B2AA',
    },
    datePicker: {
        height: 200,
    },
    datePickerContainer: {
        backgroundColor: '#fff',
    },
    datePickerContainerDark: {
        backgroundColor: '#1C1C1E',
    },
    customPickerContainer: {
        flexDirection: 'row',
        height: 200,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    pickerColumn: {
        flex: 1,
        alignItems: 'center',
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    pickerLabelDark: {
        color: '#FFFFFF',
    },
    pickerScrollView: {
        flex: 1,
        width: '100%',
    },
    pickerItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: '#E0F7F5',
    },
    pickerItemDark: {
        backgroundColor: 'transparent',
    },
    pickerItemSelectedDark: {
        backgroundColor: '#2C2C2E',
    },
    pickerItemText: {
        fontSize: 16,
        color: '#333',
    },
    pickerItemTextSelected: {
        color: '#20B2AA',
        fontWeight: '600',
    },
    pickerItemTextDark: {
        color: '#FFFFFF',
    },
    pickerItemTextSelectedDark: {
        color: '#20B2AA',
    },
});

export default AccountInformationScreen