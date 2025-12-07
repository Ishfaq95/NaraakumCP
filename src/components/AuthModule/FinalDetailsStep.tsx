import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, I18nManager, TouchableWithoutFeedback, Image } from 'react-native';
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
    const [date, setDate] = useState(getInitialDate());
    const [gender, setGender] = useState<string | number>('Male');
    const [country, setCountry] = useState<string | number>('');
    const [nationality, setNationality] = useState<string | number>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [show, setShow] = useState(false);
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

    const { t } = useTranslation();
    const isRTL = I18nManager.isRTL;

    // Calculate maximum date (18 years ago from today)
    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 18);
        return maxDate;
    };

    const maxDate = getMaxDate();

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

    const showDatePicker = () => {
        if (Platform.OS === 'ios') {
            setDatePickerVisibility(true);
        } else {
            setShow(true);
        }
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
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

    const scrollToField = (fieldRef: React.RefObject<View | null>) => {
        if (fieldRef.current && scrollViewRef.current) {
            fieldRef.current.measure((x, y, width, height, pageX, pageY) => {
                // Calculate scroll position relative to ScrollView
                scrollViewRef.current?.scrollTo({
                    y: Math.max(0, pageY - 100),
                    animated: true
                });
            });
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

        if (fullNameEn.trim() === '') {
            newErrors.fullNameEn = true;
            if (!firstErrorRef) firstErrorRef = fullNameEnRef;
        }
        if (fullNameAr.trim() === '') {
            newErrors.fullNameAr = true;
            if (!firstErrorRef) firstErrorRef = fullNameArRef;
        }
        if (experience.trim() === '' || isNaN(Number(experience)) || Number(experience) < 0) {
            newErrors.experience = true;
            if (!firstErrorRef) firstErrorRef = experienceRef;
        }
        if (language == "" || (Array.isArray(language) && language.length === 0)) {
            newErrors.language = true;
            if (!firstErrorRef) firstErrorRef = languageRef;
        }
        if (!dob.trim()) {
            newErrors.dob = true;
            if (!firstErrorRef) firstErrorRef = dobRef;
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
                    if (!firstErrorRef) firstErrorRef = dobRef;
                }
            }
        }
        if (!gender) {
            newErrors.gender = true;
            if (!firstErrorRef) firstErrorRef = genderRef;
        }
        if (country === '') {
            newErrors.country = true;
            if (!firstErrorRef) firstErrorRef = countryRef;
        }
        if (nationality === '') {
            newErrors.nationality = true;
            if (!firstErrorRef) firstErrorRef = nationalityRef;
        }
        if (password.trim() === '') {
            newErrors.password = true;
            if (!firstErrorRef) firstErrorRef = passwordRef;
        }
        if(password.trim() !== '' && !validatePassword(password)) {
            newErrors.passwordInvalid = true;
            if (!firstErrorRef) firstErrorRef = passwordRef;
        }
        if (confirmPassword.trim() === '') {
            newErrors.confirmPassword = true;
            if (!firstErrorRef) firstErrorRef = confirmPasswordRef;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            newErrors.email = true;
            if (!firstErrorRef) firstErrorRef = emailRef;
        }

        if (confirmPassword !== password) {
            newErrors.passwordMatchError = true;
            setPasswordMatchError(true);
            if (!firstErrorRef) firstErrorRef = passwordMatchErrorRef;
        } else {
            setPasswordMatchError(false);
        }

        // Check if there are any errors
        if (Object.values(newErrors).some(value => value === true)) {
            setErrors(newErrors);
            // Scroll to first error field after a short delay to ensure state is updated
            if (firstErrorRef) {
                setTimeout(() => {
                    scrollToField(firstErrorRef!);
                }, 100);
            }
            return;
        }

        try {
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
                if (response.StatusCode.STATUSCODE == 11028) {
                    dispatch(setStep2PhoneNumber(null));    
                    onSubmit(response.Userinfo);
                }
            }

        } catch (error) {
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
                        <View style={styles.row} ref={fullNameEnRef}>
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
                            <View style={{ width: '65%' }} ref={fullNameArRef}>
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
                            <View style={{ width: '33%' }} ref={experienceRef}>
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

                        <View style={styles.row} ref={languageRef}>
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
                            <View style={{ width: '49%' }} ref={dobRef}>
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

                                {/* Android date picker */}
                                {Platform.OS === 'android' && show && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={onChange}
                                        maximumDate={maxDate}
                                    />
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
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <TouchableOpacity onPress={hideDatePicker}>
                                                        <Text style={styles.cancelButton}>Cancel</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            handleConfirm(date);
                                                        }}
                                                    >
                                                        <Text style={styles.doneButton}>Done</Text>
                                                    </TouchableOpacity>
                                                </View>
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
                                                    style={styles.datePicker}
                                                />
                                            </View>
                                        </View>
                                    </Modal>
                                )}
                                {/* {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>} */}
                            </View>
                            <View style={{ width: '49%' }} ref={genderRef}>
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
                            <View style={{ width: '49%' }} ref={countryRef}>
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
                            <View style={{ width: '49%' }} ref={nationalityRef}>
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

                        <View style={styles.row} ref={emailRef}>
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
                        <View style={styles.passwordContainer} ref={passwordRef}>
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
                                    setErrors({ ...errors, password: false });
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
                        <View style={styles.passwordContainer} ref={confirmPasswordRef}>
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
        paddingVertical: 16,
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    cancelButton: {
        color: '#999',
        fontSize: 16,
    },
    doneButton: {
        color: '#20B2AA',
        fontSize: 16,
        fontWeight: '600',
    },
    datePicker: {
        height: 200,
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