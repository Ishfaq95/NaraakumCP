import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
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
            console.log('userInfo', userInfo)
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
            setDateOfBirth(userInfo.DateofBirth ? moment(userInfo.DateofBirth).format('DD/MM/YYYY') : '');
            setGender(userInfo.Gender == true ? 'male' : 'female');
            setEmail(userInfo.Email);
        }
    }, [userInfo])

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
                <Ionicons name="arrow-back-outline" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Personal Profile</Text>
        </View>
    );

    const updateUserProfileHandler = async () => {
        const fullPhoneNumber = `${selectedCountryUpdated?.dialCode}${updatedPhoneNumber.replace(/\s+/g, "")}`
        const payload = {
            "FullNamePlang": englishName,
            "FullNameSlang": arabicName,
            "CellNumber": fullPhoneNumber,
            "Email": updatedEmail,
            "CatNationalityId": nationality.toString(),
            "IDNumber": user.IDNumber,
            "Gender": gender === 'male' ? 1 : 0,
            "DateofBirth": dateOfBirth,
            "ImagePath": profileImage,
            "Password": password,
            "UserLoginInfoId": user.Id,
            YearsofExperience: experience,
            CountryId: country.toString(),
            LanguageIds: language.join(','),
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
            console.log('error', error)
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
            "DateofBirth": dateOfBirth,
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
            if (response.ResponseStatus.STATUSCODE === 200) {
                showAlert({
                    title: 'Profile updated successfully',
                    message: '',
                    type: 'success',
                });
            }
        }
        catch (error: any) {
            console.log('error', error)
        }
    }

    const handlePhoneNumberUpdate = (text: string) => {
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
              setOpenPhoneBottomSheet(false)
                setTimeout(() => {
                    showAlert({
                        title: 'Phone number already exists',
                        message: '',
                        type: 'error',
                    });
                }, 500)
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
          console.log(error)
        } finally {
          setIsUploading(false)
        }
    }

    const HandleEmailUpdate = async () => {
        // if (!updatedEmail) {
        //   setEmailInputError(true)
        //   return;
        // }
        // try {
        //   setIsUploading(true)
        //   const payload = {
        //     "Email": updatedEmail,
        //     "UserId": user.Id
        //   }

        //   const response = await profileService.userUpdatedEmail(payload)
        //   if (response?.ResponseStatus?.STATUSCODE === 200) {
        //     if (response?.StatusCode?.STATUSCODE == 3002) {
        //       setOpenEmailBottomSheet(false)
        //       setTimeout(() => {
        //         setAlertModalVisible(true)
        //         setAlertModalMessage("البريد الالكتروني موجود بالفعل")
        //       }, 500)
        //       return;
        //     }
        //     setOpenEmailBottomSheet(false)
        //     setOTPFrom('email')
        //     setOTPForText(updatedEmail)
        //     setTimeout(() => {
        //       setOpenVerifyBottomSheet(true)
        //     }, 500)
        //   }

        // } catch (error) {
        // } finally {
        //   setIsUploading(false);
        // }
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
        // try {
        //   setIsUploading(true)
        //   const payload = {
        //     "UserId": user?.Id,
        //   }

        //   const response = await profileService.resendOtp(payload)
        //   if (response?.ResponseStatus?.STATUSCODE == 3009) {
        //     setResentCode(true)
        //   }


        // } catch (error) {
        // } finally {
        //   setIsUploading(false)
        // }
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

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}> */}
            {renderHeader()}
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
                <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -70 }}>
                    <View style={{ height: 80, marginTop: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', height: 100, borderWidth: 2, borderColor: '#fff', width: 100, bottom: 50, backgroundColor: '#999', borderRadius: 50, }}>
                            <Image source={{ uri: `${MediaBaseURL}${profileImage}` }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                            <TouchableOpacity style={{ position: 'absolute', height: 30, width: 30, backgroundColor: '#fff', borderRadius: 15, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="camera" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', bottom: -15 }}>Upload Image</Text>
                    </View>

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
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

                            {/* <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10, marginTop: 10 }}> */}

                            {/* </View> */}
                        </ScrollView>
                    </KeyboardAvoidingView>
                    <View style={{ paddingVertical: 10 }}>
                        <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
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
});

export default AccountInformationScreen