import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, I18nManager } from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
import Dropdown from '../common/Dropdown';
import { authService } from '../../services/api/authService';
import DropDownWithCheckbox from '../common/DropDownWithCheckbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
    const [language, setLanguage] = useState<string | number>('');
    const [dob, setDob] = useState('');
    const [date, setDate] = useState(new Date());
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

    const { t } = useTranslation();
    const isRTL = I18nManager.isRTL;

    useEffect(() => {
        getLanguages();
        getCountries();
    }, []);

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
        setErrors({ ...errors, dob: false });
        hideDatePicker();
    };

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(false);
        if (selectedDate) {
            // Format as DD/MM/YYYY for display
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            setDate(selectedDate);
            setDob(formattedDate);
            setErrors({ ...errors, dob: false });
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
        gender: false,
        country: false,
        nationality: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const validatePassword = (pwd: string) => {
        // At least 8 characters, at least one uppercase, one lowercase, one number, one special character
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(pwd);
    };


    const handleSubmit = async () => {
        if (fullNameEn.trim() === '' || !nameRegex.test(fullNameEn.trim())) {
            setErrors({ ...errors, fullNameEn: true });
            return;
        }
        if (fullNameAr.trim() === '') {
            setErrors({ ...errors, fullNameAr: true });
            return;
        }
        if (experience.trim() === '' || isNaN(Number(experience)) || Number(experience) < 0) {
            setErrors({ ...errors, experience: true });
            return;
        }
        console.log('language', language);
        if (language == "") {
            setErrors({ ...errors, language: true });
            return;
        }
        if (!dob.trim()) {
            setErrors({ ...errors, dob: true });
            return;
        }
        if (!gender) {
            setErrors({ ...errors, gender: true });
            return;
        }
        if (country === '') {
            setErrors({ ...errors, country: true });
            return;
        }
        if (nationality === '') {
            setErrors({ ...errors, nationality: true });
            return;
        }
        // if (!email.trim() || !emailRegex.test(email.trim())) {
        //     setErrors({ ...errors, email: true });
        //     return;
        // }
        if (password.trim() === '' || !validatePassword(password)) {
            setErrors({ ...errors, password: true });
            return;
        }
        if (confirmPassword.trim() === '' || confirmPassword !== password) {
            setErrors({ ...errors, confirmPassword: true });
            return;
        }

        console.log('errors', errors);

        if (Object.values(errors).every(value => value === true)) {
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
                    onSubmit(response.Userinfo);
                }
            }   
        
        } catch (error) {
            console.log('error', error);
        }
    };

    const nextButtonDisabled = useMemo(() => {
        return errors.fullNameEn || errors.fullNameAr || errors.experience || errors.language || errors.dob || errors.gender || errors.country || errors.nationality || errors.email || errors.password || errors.confirmPassword;
    }, [errors]);

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Full Name (In English)</Text>
                        <TextInput
                            style={[styles.input, errors.fullNameEn && styles.inputError]}
                            placeholder="Enter Name"
                            value={fullNameEn}
                            onChangeText={(text) => {
                                setFullNameEn(text);
                                setErrors({ ...errors, fullNameEn: false });
                            }}
                        />
                        {/* {errors.fullNameEn && <Text style={styles.errorText}>{errors.fullNameEn}</Text>} */}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Full Name (In Arabic)</Text>
                        <TextInput
                            style={[styles.input, errors.fullNameAr && styles.inputError]}
                            placeholder="ادخل الاسم"
                            value={fullNameAr}
                            onChangeText={(text) => {
                                setFullNameAr(text);
                                setErrors({ ...errors, fullNameAr: false });
                            }}
                        />
                        {/* {errors.fullNameAr && <Text style={styles.errorText}>{errors.fullNameAr}</Text>} */}
                    </View>
                    <View style={[styles.col, styles.colSmall]}>
                        <Text style={styles.label}>Experience</Text>
                        <View style={styles.experienceRow}>
                            <TextInput
                                style={[styles.input, styles.inputSmall, errors.experience && styles.inputError]}
                                keyboardType="numeric"
                                value={experience}
                                placeholder="0"
                                onChangeText={(text) => {
                                    setExperience(text);
                                    setErrors({ ...errors, experience: false });
                                }}
                            />
                            <Text style={styles.suffixText}>/ Year</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
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
                    <View style={styles.col}>
                        <Text style={styles.label}>Date Of Birth</Text>
                        <TouchableOpacity
                            onPress={showDatePicker}
                            style={[styles.input, errors.dob && styles.inputError, styles.datePickerButton]}
                        >
                            <Text style={[styles.dateText, !dob && styles.placeholderText]}>
                                {dob || "--/--/----"}
                            </Text>
                        </TouchableOpacity>

                        {/* Android date picker */}
                        {Platform.OS === 'android' && show && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChange}
                                maximumDate={new Date()}
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
                                            maximumDate={new Date()}
                                            style={styles.datePicker}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        )}
                        {/* {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>} */}
                    </View>
                    <View style={styles.col}>
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
                    <View style={styles.col}>
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
                    <View style={styles.col}>
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
                        <TextInput style={[styles.input, styles.readOnly]} editable={false} value={phoneNumber} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="syed@gmail.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ ...errors, email: false });
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {/* {errors.email && <Text style={styles.errorText}>{errors.email}</Text>} */}
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[
                            styles.passwordInput,
                            isRTL && styles.rtlInput,
                            errors.password && styles.inputError
                        ]}
                        placeholder={t('password')}
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

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[
                            styles.passwordInput,
                            isRTL && styles.rtlInput,
                            errors.confirmPassword && styles.inputError
                        ]}
                        placeholder={t('confirmPassword')}
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
        paddingHorizontal: 0,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    col: {
        flex: 1,
    },
    colSmall: {
        flex: 0.6,
    },
    label: {
        ...globalTextStyles.bodySmall,
        marginBottom: 6,
        color: '#000',
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        ...globalTextStyles.bodySmall,
        color: '#333',
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
        justifyContent: 'center',
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