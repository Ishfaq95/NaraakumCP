import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, I18nManager, TouchableWithoutFeedback, Image, useColorScheme } from 'react-native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import Dropdown from '../common/Dropdown';
import { authService } from '../../services/api/authService';
import DropDownWithCheckbox from '../common/DropDownWithCheckbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomPhoneInput, { COUNTRIES } from '../common/CustomPhoneInput';
import { setStep2PhoneNumber } from '../../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';
import { useAlert } from '../../contexts/AlertContext';
import LoaderKit from 'react-native-loader-kit';

interface FinalDetailsStepProps {
    phoneNumber: string;
    userInfo: any;
    selectedProvider: any;
    onSubmit: (form: any) => void;
}

const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
];

const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
];

const countryOptions = [
    { label: 'Saudi Arabia', value: 'SA' },
    { label: 'United Arab Emirates', value: 'AE' },
    { label: 'Qatar', value: 'QA' },
];

const nationalityOptions = countryOptions;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z ]+$/;
const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/(19|20)\d\d$/; // DD/MM/YYYY

const FinalDetailsStep: React.FC<FinalDetailsStepProps> = ({ phoneNumber, userInfo, selectedProvider, onSubmit }) => {
    const [fullNameEn, setFullNameEn] = useState('');
    const [fullNameAr, setFullNameAr] = useState('');
    const [experience, setExperience] = useState('');
    const dispatch = useDispatch();
    const [language, setLanguage] = useState<string | number>('');
    const [dob, setDob] = useState('');
    // Initialize date to 18 years ago (maximum selectable date)
    const getInitialDate = () => {
        const today = new Date();
        const initialDate = new Date();
        initialDate.setFullYear(today.getFullYear() - 18);
        return initialDate;
    };
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(getInitialDate());
    const [gender, setGender] = useState<string | number>('Male');
    const [country, setCountry] = useState<string | number>('');
    const [nationality, setNationality] = useState<string | number>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [show, setShow] = useState(false);
    // Custom Android date picker state
    const [selectedYear, setSelectedYear] = useState(date.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
    const [selectedDay, setSelectedDay] = useState(date.getDate());
    const [languages, setLanguages] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<any>({
        code: 'SA',
        name: 'Saudi Arabia',
        nameAr: 'المملكة العربية السعودية',
        flag: '🇸🇦',
        dialCode: '+966',
        pattern: '## ### ####',
        maxLength: 9,
    });
    const [phoneNumberInput, setPhoneNumberInput] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    // Store field positions for reliable scrolling on Android
    const [fieldPositions, setFieldPositions] = useState<{ [key: string]: number }>({});
    const { showAlert } = useAlert();

    const { t } = useTranslation();
    const isRTL = I18nManager.isRTL;
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

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

    // Refs for scrolling to error fields
    const scrollViewRef = React.useRef<ScrollView>(null);
    const fullNameEnRef = React.useRef<View>(null);
    const fullNameArRef = React.useRef<View>(null);
    const experienceRef = React.useRef<View>(null);
    const languageRef = React.useRef<View>(null);
    const dobRef = React.useRef<View>(null);
    const genderRef = React.useRef<View>(null);
    const countryRef = React.useRef<View>(null);
    const nationalityRef = React.useRef<View>(null);
    const emailRef = React.useRef<View>(null);
    const passwordRef = React.useRef<View>(null);
    const confirmPasswordRef = React.useRef<View>(null);
    const passwordMatchErrorRef = React.useRef<Text>(null);
    useEffect(() => {
        getLanguages();
        getCountries();
    }, []);

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
        if (phoneNumber) {
            const phoneInfo = extractPhoneInfo(phoneNumber || '');
            const getCountry = COUNTRIES.find((c: any) => c.code === phoneInfo.countryCode);
            setSelectedCountry(getCountry);
            setPhoneNumberInput(phoneInfo.phoneNumber);
        }
    }, [phoneNumber]);

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

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
        if (Platform.OS === 'android') {
            setShow(false);
        }
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

    const handleConfirm = (selectedDate: Date) => {
        // Format as DD/MM/YYYY for display
        const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
        setDate(selectedDate);
        setDob(formattedDate);
        setErrors({ ...errors, dob: false, dobAge: false });
        hideDatePicker();
    };

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(false);
        if (selectedDate) {
            // Format as DD/MM/YYYY for display
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            setDate(selectedDate);
            setDob(formattedDate);
            setErrors({ ...errors, dob: false, dobAge: false });
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState({
        fullNameEn: false,
        fullNameAr: false,
        experience: false,
        language: false,
        dob: false,
        dobAge: false,
        gender: false,
        country: false,
        nationality: false,
        email: false,
        password: false,
        confirmPassword: false,
        passwordInvalid: false,
    });

    const validatePassword = (pwd: string) => {
        // At least 8 characters, at least one uppercase, one lowercase, one number, one special character
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(pwd);
    };

    // Helper to capture field position
    const captureFieldPosition = (fieldKey: string) => (event: any) => {
        const { y } = event.nativeEvent.layout;
        setFieldPositions(prev => ({ ...prev, [fieldKey]: y }));
    };

    const scrollToField = (fieldRef: React.RefObject<View | null>, fieldKey?: string) => {
        if (!scrollViewRef.current) return;

        // First try using stored position if available (most reliable, especially on Android)
        if (fieldKey && fieldPositions[fieldKey] !== undefined) {
            scrollViewRef.current.scrollTo({
                y: Math.max(0, fieldPositions[fieldKey] - 100),
                animated: true
            });
            return;
        }

        // Fallback to measure if position not stored yet
        if (fieldRef.current) {
            if (Platform.OS === 'android') {
                // For Android, use measureInWindow on the field and calculate offset
                fieldRef.current.measureInWindow((fieldX, fieldY, fieldWidth, fieldHeight) => {
                    // Try to get the ScrollView's content container position
                    // Since we can't measure ScrollView directly, use a workaround
                    // The stored positions should handle most cases, this is just a fallback
                    fieldRef.current?.measure((x, y, width, height, pageX, pageY) => {
                        // On Android, pageY includes status bar, so we need to adjust
                        // This is approximate and may need tuning
                        const approximateOffset = pageY - 100;
                        scrollViewRef.current?.scrollTo({
                            y: Math.max(0, approximateOffset),
                            animated: true
                        });
                    });
                });
            } else {
                // For iOS, use measure (works reliably)
                fieldRef.current.measure((x, y, width, height, pageX, pageY) => {
                    scrollViewRef.current?.scrollTo({
                        y: Math.max(0, pageY - 100),
                        animated: true
                    });
                });
            }
        }
    };

    const handleSubmit = async () => {
        const newErrors = {
            fullNameEn: false,
            fullNameAr: false,
            experience: false,
            language: false,
            dob: false,
            dobAge: false,
            gender: false,
            country: false,
            nationality: false,
            email: false,
            password: false,
            confirmPassword: false,
            passwordMatchError: false,
            passwordInvalid: false,
        };

        let firstErrorRef: React.RefObject<View | null> | null = null;
        let firstErrorKey: string | null = null;

        // Map refs to field keys for position tracking
        const refToKeyMap: { [key: string]: string } = {
            'fullNameEn': 'fullNameEn',
            'fullNameAr': 'fullNameAr',
            'experience': 'experience',
            'language': 'language',
            'dob': 'dob',
            'gender': 'gender',
            'country': 'country',
            'nationality': 'nationality',
            'email': 'email',
            'password': 'password',
            'confirmPassword': 'confirmPassword',
            'passwordMatchError': 'passwordMatchError',
        };

        if (fullNameEn.trim() === '') {
            newErrors.fullNameEn = true;
            if (!firstErrorRef) {
                firstErrorRef = fullNameEnRef;
                firstErrorKey = 'fullNameEn';
            }
        }
        if (fullNameAr.trim() === '') {
            newErrors.fullNameAr = true;
            if (!firstErrorRef) {
                firstErrorRef = fullNameArRef;
                firstErrorKey = 'fullNameAr';
            }
        }
        if (experience.trim() === '' || isNaN(Number(experience)) || Number(experience) < 0) {
            newErrors.experience = true;
            if (!firstErrorRef) {
                firstErrorRef = experienceRef;
                firstErrorKey = 'experience';
            }
        }
        if (language == "" || (Array.isArray(language) && language.length === 0)) {
            newErrors.language = true;
            if (!firstErrorRef) {
                firstErrorRef = languageRef;
                firstErrorKey = 'language';
            }
        }
        if (!dob.trim()) {
            newErrors.dob = true;
            if (!firstErrorRef) {
                firstErrorRef = dobRef;
                firstErrorKey = 'dob';
            }
        } else {
            // Validate age - must be at least 18 years old
            const dateParts = dob.split('/');
            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // month is 0-indexed in Date
                const year = parseInt(dateParts[2], 10);
                const birthDate = new Date(year, month, day);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                const dayDiff = today.getDate() - birthDate.getDate();

                // Calculate exact age
                let exactAge = age;
                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                    exactAge = age - 1;
                }

                if (exactAge < 18) {
                    newErrors.dob = true;
                    newErrors.dobAge = true;
                    if (!firstErrorRef) {
                        firstErrorRef = dobRef;
                        firstErrorKey = 'dob';
                    }
                }
            }
        }
        if (!gender) {
            newErrors.gender = true;
            if (!firstErrorRef) {
                firstErrorRef = genderRef;
                firstErrorKey = 'gender';
            }
        }
        if (country === '') {
            newErrors.country = true;
            if (!firstErrorRef) {
                firstErrorRef = countryRef;
                firstErrorKey = 'country';
            }
        }
        if (nationality === '') {
            newErrors.nationality = true;
            if (!firstErrorRef) {
                firstErrorRef = nationalityRef;
                firstErrorKey = 'nationality';
            }
        }
        if (password.trim() === '') {
            newErrors.password = true;
            if (!firstErrorRef) {
                firstErrorRef = passwordRef;
                firstErrorKey = 'password';
            }
        }
        if(password.trim() !== '' && !validatePassword(password)) {
            newErrors.passwordInvalid = true;
            if (!firstErrorRef) {
                firstErrorRef = passwordRef;
                firstErrorKey = 'password';
            }
        }
        if (confirmPassword.trim() === '') {
            newErrors.confirmPassword = true;
            if (!firstErrorRef) {
                firstErrorRef = confirmPasswordRef;
                firstErrorKey = 'confirmPassword';
            }
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-zA-Z]{2,3})+$/;
        if (email && !emailRegex.test(email)) {
            newErrors.email = true;
            if (!firstErrorRef) {
                firstErrorRef = emailRef;
                firstErrorKey = 'email';
            }
        }

        if (confirmPassword !== password) {
            newErrors.passwordMatchError = true;
            setPasswordMatchError(true);
            if (!firstErrorRef) {
                // Use confirmPasswordRef since the error is shown right after it
                firstErrorRef = confirmPasswordRef;
                firstErrorKey = 'confirmPassword';
            }
        } else {
            setPasswordMatchError(false);
        }

        // Check if there are any errors
        if (Object.values(newErrors).some(value => value === true)) {
            setErrors(newErrors);
            // Scroll to first error field after a delay to ensure state is updated and layout is complete
            if (firstErrorRef) {
                // Use requestAnimationFrame for better timing, especially on Android
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        scrollToField(firstErrorRef!, firstErrorKey || undefined);
                    }, Platform.OS === 'android' ? 300 : 100);
                });
            }
            return;
        }

        try {
            setIsLoading(true);
            // Convert date from DD/MM/YYYY to YYYY-MM-DD format
            const dateParts = dob.split('/');
            const formattedDob = dateParts.length === 3
                ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                : dob;

            // Convert language array to comma-separated string if it's an array
            const languageString = Array.isArray(language)
                ? language.join(',')
                : language.toString();

            const payload = {
                UserloginInfoId: userInfo.userid,
                CatuserRoleId: selectedProvider,
                Password: password,
                FullNamePlang: fullNameEn,
                FullNameSlang: fullNameAr,
                CellNumber: phoneNumber,
                Email: email,
                RegistrationPlatformId: Platform.OS === 'ios' ? 3 : 2,
                DeviceId: Platform.OS === 'ios' ? 'iOS' : 'Android',
                CatNationalityId: nationality,
                CountryId: country,
                DateofBirth: formattedDob,
                Gender: gender === 'Male' ? 1 : 0,
                YearsofExperience: experience,
                LanguageIds: languageString,
            }
            const response = await authService.addIndividualServiceProviderStep3(payload);
            if (response.ResponseStatus.STATUSCODE) {
                if(response.StatusCode.STATUSCODE == 3002) {
                    showAlert({
                        title: 'Error',
                        message: response.StatusCode.MESSAGE,
                        type: 'error'
                    });
                }
                if (response.StatusCode.STATUSCODE == 11028) {
                    dispatch(setStep2PhoneNumber(null));    
                    onSubmit(response.Userinfo);
                }
            }

        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const nextButtonDisabled = useMemo(() => {
        return errors.fullNameEn || errors.fullNameAr || errors.experience || errors.language || errors.dob || errors.gender || errors.country || errors.nationality || errors.email || errors.password || errors.confirmPassword || errors.passwordInvalid;
    }, [errors]);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollViewContainer}
                contentContainerStyle={styles.scrollViewContent}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <TouchableWithoutFeedback>
                    <View>
                        <View style={styles.row} ref={fullNameEnRef} onLayout={captureFieldPosition('fullNameEn')}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Full Name <Text style={{ fontFamily: CAIRO_FONT_FAMILY.semiBold, fontSize: 14, fontWeight: '600', color: '#666666' }}>(In English)</Text></Text>
                                <TextInput
                                    style={[styles.input, errors.fullNameEn && styles.inputError]}
                                    placeholder="Enter Name"
                                    maxLength={60}
                                    placeholderTextColor="#969696"
                                    value={fullNameEn}
                                    onChangeText={(text) => {
                                        setFullNameEn(text);
                                        setErrors({ ...errors, fullNameEn: false });
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ width: '65%' }} ref={fullNameArRef} onLayout={captureFieldPosition('fullNameAr')}>
                                <Text style={styles.label}>Full Name <Text style={{ fontFamily: CAIRO_FONT_FAMILY.semiBold, fontSize: 14, fontWeight: '600', color: '#666666' }}>(In Arabic)</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.arabicInput, errors.fullNameAr && styles.inputError]}
                                    textAlign="right"
                                    placeholder="ادخل الاسم"
                                    placeholderTextColor="#969696"
                                    maxLength={60}
                                    value={fullNameAr}
                                    onChangeText={(text) => {
                                        setFullNameAr(text);
                                        setErrors({ ...errors, fullNameAr: false });
                                    }}
                                />
                                {/* {errors.fullNameAr && <Text style={styles.errorText}>{errors.fullNameAr}</Text>} */}
                            </View>
                            <View style={{ width: '33%' }} ref={experienceRef} onLayout={captureFieldPosition('experience')}>
                                <Text style={styles.label}>Experience</Text>
                                <View style={styles.experienceRow}>
                                    <TextInput
                                        style={[styles.input, { width: '60%' }, errors.experience && styles.inputError]}
                                        keyboardType="numeric"
                                        placeholderTextColor="#969696"
                                        value={experience}
                                        placeholder="0"
                                        maxLength={2}
                                        onChangeText={(text) => {
                                            // Only allow numeric input and limit to 2 digits
                                            const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                                            setExperience(numericText);
                                            setErrors({ ...errors, experience: false });
                                        }}
                                    />
                                    <Text style={styles.suffixText}>/ Year</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row} ref={languageRef} onLayout={captureFieldPosition('language')}>
                            <View style={styles.col}>
                                <Text style={styles.label}>I Speak The Following Languages:</Text>
                                <DropDownWithCheckbox
                                    data={languages}
                                    value={Array.isArray(language) ? (language as any) : []}
                                    error={errors.language}
                                    onChange={(vals) => {
                                        setLanguage(vals as any);
                                        setErrors({ ...errors, language: false });
                                    }}
                                    placeholder="-- Select --"
                                    containerStyle={{ height: 44 }}
                                    dropdownStyle={[{ height: 44 }]}
                                />
                                {/* {errors.language && <Text style={styles.errorText}>{errors.language}</Text>} */}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ width: '49%' }} ref={dobRef} onLayout={captureFieldPosition('dob')}>
                                <Text style={styles.label}>Date Of Birth</Text>
                                <TouchableOpacity
                                    onPress={showDatePicker}
                                    style={[styles.input, errors.dob && styles.inputError, styles.datePickerButton]}
                                >
                                    <Text style={[styles.dateText, !dob && styles.placeholderText]}>
                                        {dob || "--/--/----"}
                                    </Text>
                                    <Image source={require('../../assets/images/calendarIcon.png')} style={{ width: 22, height: 22 }} />
                                </TouchableOpacity>
                                {/* {errors.dobAge && <Text style={{ color: '#ff3b30', fontSize: 12, fontFamily: CAIRO_FONT_FAMILY.regular, fontWeight: '400', marginTop: 4 }}>You must be at least 18 years old</Text>} */}

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
                                {/* {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>} */}
                            </View>
                            <View style={{ width: '49%' }} ref={genderRef} onLayout={captureFieldPosition('gender')}>
                                <Text style={styles.label}>Gender</Text>
                                <Dropdown
                                    data={genderOptions}
                                    value={gender}
                                    onChange={(value) => {
                                        setGender(value);
                                        setErrors({ ...errors, gender: false });
                                    }}
                                    placeholder="Select"
                                    containerStyle={{ height: 44 }}
                                    dropdownStyle={[{ height: 44 }]}
                                />
                                {/* {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>} */}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ width: '49%' }} ref={countryRef} onLayout={captureFieldPosition('country')}>
                                <Text style={styles.label}>Country</Text>
                                <Dropdown
                                    data={countries}
                                    value={country}
                                    onChange={(value) => {
                                        setCountry(value);
                                        setErrors({ ...errors, country: false });
                                    }}
                                    error={errors.country}
                                    containerStyle={{ height: 44 }}
                                    dropdownStyle={[{ height: 44 }]}
                                    placeholder="--Select--"
                                />
                                {/* {errors.country && <Text style={styles.errorText}>{errors.country}</Text>} */}
                            </View>
                            <View style={{ width: '49%' }} ref={nationalityRef} onLayout={captureFieldPosition('nationality')}>
                                <Text style={styles.label}>Nationality</Text>
                                <Dropdown
                                    data={countries}
                                    value={nationality}
                                    onChange={(value) => {
                                        setNationality(value);
                                        setErrors({ ...errors, nationality: false });
                                    }}
                                    placeholder="--Select--"
                                    error={errors.nationality}
                                    containerStyle={{ height: 44 }}
                                    dropdownStyle={[{ height: 44 }]}
                                />
                                {/* {errors.nationality && <Text style={styles.errorText}>{errors.nationality}</Text>} */}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <CustomPhoneInput
                                    value={phoneNumberInput}
                                    onChangeText={(text) => { }}
                                    onCountryChange={() => { }}
                                    error={false}
                                    disabled={true}
                                    
                                    initialCountry={selectedCountry}
                                />
                            </View>
                        </View>

                        <View style={styles.row} ref={emailRef} onLayout={captureFieldPosition('email')}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={[styles.input, errors.email && styles.inputError]}
                                    placeholder="info@info.com"
                                    placeholderTextColor="#969696"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors({ ...errors, email: false });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.email && <Text style={{ color: '#ff3b30', fontSize: 12, fontFamily: CAIRO_FONT_FAMILY.regular, fontWeight: '400' }}>Email is not valid</Text>}
                            </View>
                        </View>

                        {/* Password Input */}
                        <Text style={{
                            fontFamily: CAIRO_FONT_FAMILY.semiBold,
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#191919',
                        }}>Password</Text>
                        <View style={styles.passwordContainer} ref={passwordRef} onLayout={captureFieldPosition('password')}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    isRTL && styles.rtlInput,
                                    errors.password && styles.inputError
                                ]}
                                placeholder={'Password'}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    
                                    setErrors({ ...errors, password: false, passwordInvalid: false });
                                }}
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
                        {errors.passwordInvalid && <Text style={{ color: '#ff3b30', fontSize: 12,fontFamily: CAIRO_FONT_FAMILY.regular, fontWeight: '400' }}>Password must be minimum of 8 characters having alphabets, numeric, special character, an upper & lowercase letter.</Text>}

                        {/* Password Input */}
                        <Text style={{
                            fontFamily: CAIRO_FONT_FAMILY.semiBold,
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#191919',
                        }}>Confirm Password</Text>
                        <View style={styles.passwordContainer} ref={confirmPasswordRef} onLayout={captureFieldPosition('confirmPassword')}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    isRTL && styles.rtlInput,
                                    errors.confirmPassword && styles.inputError
                                ]}
                                placeholder={'Confirm Password'}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setPasswordMatchError(false);
                                    setErrors({ ...errors, confirmPassword: false });
                                }}
                                secureTextEntry={!showConfirmPassword}
                                placeholderTextColor="#999"
                                textAlign={isRTL ? 'right' : 'left'}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showConfirmPassword ? (
                                    <EyeIcon width={22} height={22} color="#666666" />
                                ) : (
                                    <EyeOffIcon width={22} height={22} color="#666666" />
                                )}
                            </TouchableOpacity>
                        </View>
                        {passwordMatchError && <Text style={{ color: '#ff3b30', fontSize: 12, fontFamily: CAIRO_FONT_FAMILY.regular, fontWeight: '400' }}>Password does not match</Text>}
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>

            <View style={styles.submitContainer}>
                <TouchableOpacity style={[styles.submitButton]} onPress={handleSubmit}>
                    <Ionicons name="checkmark-sharp" size={22} color="#fff" />
                    <Text style={styles.submitText}>{`Register`}</Text>

                </TouchableOpacity>
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
        paddingTop: 20,
    },
    scrollViewContainer: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20,
        minHeight: '100%',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    col: {
        flex: 1,
    },
    colSmall: {
        flex: 0.6,
    },
    label:
    {
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontSize: 14,
        fontWeight: '600',
        color: '#191919',
        marginBottom: 6,
    }
    ,
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
    },
    arabicInput: {
        fontFamily: CAIRO_FONT_FAMILY.regular,
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    inputSmall: {
        width: 90,
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    suffixText: {
        ...globalTextStyles.bodySmall,
        color: '#239EA0',
        marginLeft: 8,
        alignSelf: 'center',
    },
    experienceRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    readOnly: {
        backgroundColor: '#f5f5f5',
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eye: {
        fontSize: 18,
        marginLeft: 8,
        color: '#666',
    },
    errorText: {
        ...globalTextStyles.bodySmall,
        color: '#ff3b30',
        marginTop: 6,
    },
    submitContainer: {
        marginTop: 12,
        paddingBottom: 8,
    },
    submitButton: {
        flexDirection: 'row',
        gap: 6,
        backgroundColor: '#20B2AA',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitDisabled: {
        backgroundColor: '#E0E0E0',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 0,
    },
    dateText: {
        ...globalTextStyles.bodySmall,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
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
    rtlInput: {
        textAlign: 'right',
        paddingRight: 12,
        paddingLeft: 12,
    },
});

export default FinalDetailsStep; 