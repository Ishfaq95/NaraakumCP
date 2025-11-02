import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import CustomPhoneInput, { COUNTRIES } from '../../components/common/CustomPhoneInput';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import Dropdown from '../../components/common/Dropdown';
import moment from 'moment';

const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
];

const AccountInformationScreen = () => {
    const navigation = useNavigation();
    const [englishName, setEnglishName] = useState('');
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
            console.log('error', error)
        }
    }

    useEffect(() => {
        getNationalities();
    }, [])

    // Function to extract country code and phone number from full number
    const extractPhoneInfo = (fullNumber: string) => {
        if (!fullNumber) return { countryCode: 'SA', phoneNumber: '' };

        // Remove any spaces or special characters
        const cleanNumber = fullNumber.replace(/\s/g, '');

        // Check for Saudi Arabia number (+966)
        if (cleanNumber.startsWith('+966')) {
            const phoneNumber = cleanNumber.substring(4); // Remove +966
            return { countryCode: 'SA', phoneNumber };
        }

        // Check for other country codes (you can add more as needed)
        const countryCodeMap: { [key: string]: string } = {
            '+971': 'AE', // UAE
            '+973': 'BH', // Bahrain
            '+964': 'IQ', // Iraq
            '+98': 'IR',  // Iran
            '+962': 'JO', // Jordan
            '+965': 'KW', // Kuwait
            '+961': 'LB', // Lebanon
            '+968': 'OM', // Oman
            '+970': 'PS', // Palestine
            '+974': 'QA', // Qatar
            '+963': 'SY', // Syria
            '+90': 'TR',  // Turkey
            '+967': 'YE'  // Yemen
        };

        for (const [code, country] of Object.entries(countryCodeMap)) {
            if (cleanNumber.startsWith(code)) {
                const phoneNumber = cleanNumber.substring(code.length);
                return { countryCode: country, phoneNumber };
            }
        }

        // Default to Saudi Arabia if no match found
        return { countryCode: 'SA', phoneNumber: cleanNumber.replace(/^\+/, '') };
    };

    useEffect(() => {
        if (userInfo) {
            setEnglishName(userInfo.FullNamePlang);
            setArabicName(userInfo.FullNameSlang);
            const phoneInfo = extractPhoneInfo(userInfo.CellNumber || '');
            const getCountry = COUNTRIES.find(c => c.code === phoneInfo.countryCode);
            setSelectedCountry(getCountry);
            setUpdatedPhoneNumber(phoneInfo.phoneNumber);
            setMobileNumber(phoneInfo.phoneNumber);
            setDateOfBirth(userInfo.DateofBirth ? moment(userInfo.DateofBirth).format('DD/MM/YYYY') : '');
            setGender(userInfo.Gender == true ? 'male' : 'female');
            setEmail(userInfo.Email);
        }
    }, [userInfo])

    useEffect(() => {
        if (userInfo && nationalities.length > 0) {
            const nationality = nationalities.find((item: any) => item.value == parseInt(userInfo.CatNationalityId));
            setNationality(nationality?.value || '');
            console.log('nationality', nationality)
        }
    }, [userInfo, nationalities])

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
            console.log('error', error)
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
                <Ionicons name="chevron-back" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Personal Profile</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}> */}
            {renderHeader()}
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
                <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -70 }}>
                    <View style={{ height: 80, marginTop: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', height: 100, borderWidth: 2, borderColor: '#fff', width: 100, bottom: 50, backgroundColor: '#999', borderRadius: 50, padding: 10 }}>

                            <View style={{ position: 'absolute', height: 30, width: 30, backgroundColor: '#fff', borderRadius: 15, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="camera" size={20} color="#333" />
                            </View>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', bottom: -15 }}>Upload Image</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                {/* Name */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Name in English</Text>
                                    <TextInput style={[styles.input, englishNameInputError && { borderWidth: 1, borderColor: 'red' }]} value={englishName} onChangeText={setEnglishName} placeholder="Name" />
                                </View>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Name in Arabic</Text>
                                    <TextInput style={[styles.input, arabicNameInputError && { borderWidth: 1, borderColor: 'red' }]} value={arabicName} onChangeText={setArabicName} placeholder="Name" />
                                </View>
                            </View>
                            {/* Mobile */}
                            <View style={styles.fieldGroup}>
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
                                    <TouchableOpacity onPress={HandleOpenPhoneBottomSheet} style={[styles.updateBtn, { height: 46, top: 5 }]}>
                                        <Text style={styles.updateBtnText}>Update</Text>
                                        <Icon name="edit" size={18} color="#fff" style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.fieldGroup, styles.row]}>

                                <View style={{ width: '48%', }}>
                                    <Text style={styles.label}>Date of Birth</Text>
                                    <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="Date of Birth" keyboardType="numeric" />
                                    <TouchableOpacity onPress={HandleOpenDateOfBirthPicker} style={[styles.dateOfBirthBtn]}>
                                        <Icon name="calendar-month" size={18} color="#000" style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '48%', }}>
                                    <Text style={styles.label}>Gender</Text>
                                    <Dropdown data={genders} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={gender} onChange={(value: string | number) => setGender(value.toString())} placeholder="الجنس" />
                                </View>
                            </View>

                            <View style={{ width: '100%', }}>
                                <Text style={styles.label}>Nationality</Text>
                                <Dropdown data={nationalities} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={nationality} onChange={(value: string | number) => setNationality(value)} placeholder="Nationality" />
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10, marginTop: 10 }}>
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
                        </View>
                    </ScrollView>
                    <View style={{ paddingVertical: 10 }}>
                        <TouchableOpacity style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
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
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.medium,
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
        top: '50%',
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
        marginBottom: 12,
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
});

export default AccountInformationScreen