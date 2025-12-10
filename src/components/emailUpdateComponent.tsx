import React, { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { CAIRO_FONT_FAMILY } from "../styles/globalStyles";
import PhoneNumberInput from "./common/CustomPhoneInput";
import { t } from "i18next";
import Dropdown from "./common/Dropdown";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface EmailUpdateProps {
  value: string;
  onChangeText: (text: string) => void;
  HandleEmailUpdate: () => void;
  onClosePress: () => void,
  inputError: boolean
}

const EmailUpdateComponent: React.FC<EmailUpdateProps> = ({ HandleEmailUpdate, onChangeText, value, onClosePress, inputError = false }) => {
  const inputRef = React.useRef<TextInput>(null);

  const validateAndSubmit = () => {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !emailRegex.test(value)) {
      Alert.alert("خطأ", "الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    // If email is valid, proceed with the update
    HandleEmailUpdate();
  };

  return (
    <View style={styles.mainContainer}>
      <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
        <Text style={{
          fontSize: 16,
          fontFamily: CAIRO_FONT_FAMILY.bold,
          color: '#36454F',

        }}>تغيير البريد الإلكتروني</Text>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={24} color="#979e9eff" />
        </TouchableOpacity>

      </View>
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
        <Text style={styles.emailTitle}>أدخل بريدك الإلكتروني الجديد</Text>
        <TouchableOpacity
          style={inputError ? { ...styles.inputView, borderWidth: 1, borderColor: 'red', borderRadius: 8 } : styles.inputView}
          activeOpacity={1}
          onPress={() => inputRef.current && inputRef.current.focus()}
        >
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder="البريد الالكترونى"
            placeholderTextColor="#d9d9d9"
            style={styles.inputText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={validateAndSubmit} style={styles.sheetButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}



export default EmailUpdateComponent

interface PhoneUpdateProps {
  mobileNumber: string;
  handlePhoneNumberChange: (data: {
    phoneNumber: string;
    isValid: boolean;
    countryCode: string;
    fullNumber: string;
  }) => void;
  HandleEmailUpdate: () => void;
  onClosePress: () => void,
  inputError: boolean
}


export const PhoneUpdateComponent: React.FC<PhoneUpdateProps> = ({ HandleEmailUpdate, handlePhoneNumberChange, mobileNumber, onClosePress, inputError = false }) => {
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.sheetHeaderContainer, { backgroundColor: '#fff' }]}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>تغيير رقم الهااتف</Text>
      </View>
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
        <Text style={styles.emailTitle}>أدخل رقم هاتفك الجديد</Text>
        <PhoneNumberInput
          value={mobileNumber}
          onChangePhoneNumber={handlePhoneNumberChange}
          placeholder={t('mobile_number')}
          errorText={t('mobile_number_not_valid')}
          containerStyle={inputError ? { marginVertical: 7, borderWidth: 1, borderColor: 'red', borderRadius: 8 } : { marginVertical: 7 }}
        />
        <TouchableOpacity onPress={HandleEmailUpdate} style={styles.sheetButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface smsProps {
  onClosePress: () => void;
  OTPFor: string;
  OTPForText: string;
  headerText?: string;
  onChangeText: (text: string) => void;
  value: string;
  OtpSubmitButton: () => void;
  HandleResendPress: () => void
  resentCode: boolean
  otpError?: boolean
  otpApiError?: boolean
  isLoading?: boolean
  OTPFrom: string
}

export const VerificationCodeCompoent: React.FC<smsProps> = ({ onClosePress, OTPFor, OTPForText, headerText = "", onChangeText, value, OtpSubmitButton, HandleResendPress, resentCode, otpError = false, otpApiError = false, isLoading = false, OTPFrom }) => {
  console.log("OTPFor", OTPFor)
  return (
    <View style={[styles.mainContainer]}>
      <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
        <Text style={{
          fontSize: 16,
          fontFamily: CAIRO_FONT_FAMILY.bold,
          color: '#36454F',

        }}>{headerText}</Text>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={24} color="#979e9eff" />
        </TouchableOpacity>

      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        {OTPFrom == 'email' ? <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}><MaterialIcons name="email" size={53} color="#23a2a4" /></View> : <Image source={require('../assets/images/sms.png')} style={{ width: 53, height: 53, resizeMode: 'contain', alignSelf: 'center', marginVertical: 10 }} />}
        <Text style={styles.optHeaderText}>Verification code has been sent to your mobile number</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[styles.optHeaderText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{OTPFor}</Text>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={onClosePress}
          >
            <Text style={{
              color: '#23a2a4',
              fontSize: 15,
              padding: 5,
              fontFamily: CAIRO_FONT_FAMILY.bold,
              textAlign: 'center',
            }}>
              {OTPForText}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputHeaderText}>
          Enter Verification Code <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <View style={[styles.otpView, (otpError || otpApiError) && { borderWidth: 1, borderColor: 'red', borderRadius: 8 }]}>
          <TextInput returnKeyType='done' value={value} onChangeText={onChangeText} placeholder="ضع الرمز" style={[styles.inputText, { textAlign: 'center', width: '90%' },]} />
        </View>
        {otpApiError && <Text style={{ color: 'red', fontSize: 12, marginTop: -10, fontFamily: CAIRO_FONT_FAMILY.medium, textAlign: 'left' }}>Invalid Code</Text>}
        <TouchableOpacity onPress={OtpSubmitButton} style={styles.optButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Verify</Text>}
        </TouchableOpacity>
        {resentCode && (
          <Text style={{ color: '#198754', fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.medium, textAlign: 'center' }}>Verification code has been resent successfully</Text>
        )}

        <View style={styles.resendOptTextContainer}>
          <Text style={styles.optNotGet}>I did not receive the code</Text>
          <TouchableOpacity onPress={HandleResendPress}>
            <Text style={styles.resendPress}>Resend</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

interface AddressProps {
  onClosePress: () => void;
  setRiginValue: (text: string) => void;
  riginValue: string;
  setCityValue: (text: string) => void;
  cityValue: string;
  setNeighbearhoodValue: (text: string) => void;
  neighbearhoodValue: string;
  setDescriptionValue: (text: string) => void;
  descriptionValue: string;
  saveAddressButton: () => void;
  GoogleMapButton: () => void
  setFocusedField: (value: string) => void;
}

export const VisitLocationComponent: React.FC<AddressProps> = ({
  onClosePress,
  setRiginValue,
  riginValue,
  setCityValue,
  cityValue,
  setDescriptionValue,
  descriptionValue,
  setNeighbearhoodValue,
  neighbearhoodValue,
  saveAddressButton,
  GoogleMapButton,
  setFocusedField
}) => {
  const descriptionInputRef = useRef<TextInput>(null);
  const [fieldErrors, setFieldErrors] = useState({
    rigin: false,
    city: false,
    neighborhood: false,
    description: false,
  });

  const Rigin = [
    { label: 'اختر من فضلك', value: '' },
    { label: 'الرياض', value: '1' },
  ];

  const City = [
    { label: 'اختر من فضلك', value: '' },
    { label: 'الرياض', value: '1' },
  ];

  const Neighbearhood = [
    { label: 'اختر من فضلك', value: '' },
    { label: 'حي الربيع', value: '1' },
    { label: ' حي الندى', value: '2' },
    { label: ' حي الصحافة', value: '3' },
    { label: ' حي النرجس', value: '4' },
    { label: ' حي العارض', value: '5' },
    { label: ' حي النفل', value: '6' },
    { label: ' حي العقيق', value: '7' },
    { label: ' حي الوادي', value: '8' },
    { label: ' حي الغدير', value: '9' },
    { label: ' حي الياسمين', value: '10' },
    { label: ' حي الفلاح', value: '11' },
    { label: ' حي بنبان', value: '12' },
    { label: ' حي القيروان', value: '13' },
    { label: ' حي حطين', value: '14' },
    { label: ' حي الملقا', value: '15' },
    { label: ' حي الروضة', value: '16' },
    { label: ' حي الرمال', value: '17' },
    { label: ' حي المونسية', value: '18' },
    { label: ' حي قرطبة', value: '19' },
    { label: ' حي الجنادرية', value: '20' },
    { label: ' حي القادسية', value: '21' },
    { label: ' حي اليرموك', value: '22' },
    { label: ' حي غرناطة', value: '23' },
    { label: ' حي أشبيلية', value: '24' },
    { label: ' حي الحمراء', value: '25' },
    { label: ' حي المعيزلية', value: '26' },
    { label: ' حي الخليج', value: '27' },
    { label: ' حي الملك فيصل', value: '28' },
    { label: ' حي القدس', value: '29' },
    { label: ' حي النهضة', value: '30' },
    { label: ' حي الأندلس', value: '31' },
    { label: ' حي العليا', value: '32' },
    { label: ' حي السليمانية', value: '33' },
    { label: ' حي الملك عبد العزيز', value: '34' },
    { label: ' حي الملك عبد الله', value: '35' },
    { label: ' حي الورود', value: '36' },
    { label: ' حي صلاح الدين', value: '37' },
    { label: ' حي الملك فهد', value: '38' },
    { label: ' حي المرسلات', value: '39' },
    { label: ' حي النزهة', value: '40' },
    { label: ' حي المغرزات', value: '41' },
    { label: ' حي المروج', value: '42' },
    { label: ' حي المصيف', value: '43' },
    { label: ' حي التعاون', value: '44' },
    { label: ' حي الإزدهار', value: '45' },
    { label: ' حي المعذر', value: '46' },
    { label: ' حي المحمدية', value: '47' },
    { label: ' حي الرحمانية', value: '48' },
    { label: ' حي الرائد', value: '49' },
    { label: ' حي النخيل', value: '50' },
    { label: ' حي أم الحمام الشرقي', value: '51' },
    { label: ' حي أم الحمام الغربي', value: '52' },
    { label: ' حي السفارات', value: '53' },
    { label: ' حي المهدية', value: '54' },
    { label: ' حي عرقة', value: '55' },
    { label: ' حي ظهرة لبن', value: '56' },
    { label: ' حي الخزامى', value: '57' },
    { label: ' حي النسيم الشرقي', value: '58' },
    { label: ' حي النسيم الغربي', value: '59' },
    { label: ' حي السلام', value: '60' },
    { label: ' حي الريان', value: '61' },
    { label: ' حي الروابي', value: '62' },
    { label: ' حي النظيم', value: '63' },
    { label: ' حي المنار', value: '64' },
    { label: ' حي الندوة', value: '65' },
    { label: ' حي جرير', value: '66' },
    { label: ' حي الربوة', value: '67' },
    { label: ' حي الزهراء', value: '68' },
    { label: ' حي الصفا', value: '69' },
    { label: ' حي الضباط', value: '70' },
    { label: ' حي الملز', value: '71' },
    { label: ' حي الوزارات', value: '72' },
    { label: ' حي الفاروق', value: '73' },
    { label: ' حي العمل', value: '74' },
    { label: ' حي ثليم', value: '75' },
    { label: ' حي المربع', value: '76' },
    { label: ' حي الفوطة', value: '77' },
    { label: ' حي الرفيعة', value: '78' },
    { label: ' حي الهدا', value: '79' },
    { label: ' حي الشرقية', value: '80' },
    { label: ' حي الناصرية', value: '81' },
    { label: ' حي صياح', value: '82' },
    { label: ' حي الوشام', value: '83' },
    { label: ' حي النموذجية', value: '84' },
    { label: ' حي المعذر', value: '85' },
    { label: ' حي المؤتمرات', value: '86' },
    { label: ' حي البديعة', value: '87' },
    { label: ' حي أم سليم', value: '88' },
    { label: ' حي الشميسي', value: '89' },
    { label: ' حي الجرادية', value: '90' },
    { label: ' حي الفاخرية', value: '91' },
    { label: ' حي عليشة', value: '92' },
    { label: ' هجرة وادي لبن', value: '93' },
    { label: ' حي العريجاء', value: '94' },
    { label: ' حي العريجاء الوسطى', value: '95' },
    { label: ' حي العريجاء الغربية', value: '96' },
    { label: ' حي الدريهمية', value: '97' },
    { label: ' حي شبرا', value: '98' },
    { label: ' حي السويدي', value: '99' },
    { label: ' حي السويدي الغربي', value: '100' },
    { label: ' حي ظهرة البديعة', value: '101' },
    { label: ' حي سلطانة', value: '102' },
    { label: ' حي الزهرة', value: '103' },
    { label: ' هجرة وادي لبن', value: '104' },
    { label: ' حي ظهرة نمار', value: '105' },
    { label: ' حي ديراب', value: '106' },
    { label: ' حي نمار', value: '107' },
    { label: ' حي الحزم', value: '108' },
    { label: ' حي أحد', value: '109' },
    { label: ' حي عكاظ', value: '110' },
    { label: ' حي الشفاء', value: '111' },
    { label: ' حي المروة', value: '112' },
    { label: ' حي بدر', value: '113' },
    { label: ' حي المصانع', value: '114' },
    { label: ' حي المنصورية', value: '115' },
    { label: ' حي عريض', value: '116' },
    { label: ' حي العماجية', value: '117' },
    { label: ' حي خشم العان', value: '118' },
    { label: ' حي الدفاع', value: '119' },
    { label: ' حي المناخ', value: '120' },
    { label: ' حي السلي', value: '121' },
    { label: ' حي النور (الرياض)', value: '122' },
    { label: ' حي الإسكان', value: '123' },
    { label: ' حي الصناعية الجديدة', value: '124' },
    { label: ' حي الفيحاء', value: '125' },
    { label: ' حي الجزيرة', value: '126' },
    { label: ' حي السعادة', value: '127' },
    { label: ' حي هيت', value: '128' },
    { label: ' حي البرية', value: '129' },
    { label: ' حي المشاعل', value: '130' },
    { label: ' حي الدوبية', value: '131' },
    { label: ' حي القرى', value: '132' },
    { label: ' حي الصناعية', value: '133' },
    { label: ' حي الوسيطاء', value: '134' },
    { label: ' حي معكال', value: '135' },
    { label: ' حي الفيصلية', value: '136' },
    { label: ' حي منفوحة', value: '137' },
    { label: ' حي المنصورة', value: '138' },
    { label: ' حي اليمامة', value: '139' },
    { label: ' حي سلام', value: '140' },
    { label: ' حي جبرة', value: '141' },
    { label: ' حي عتيقة', value: '142' },
    { label: ' حي غبيراء', value: '143' },
    { label: ' حي البطيحا', value: '144' },
    { label: ' حي الخالدية', value: '145' },
    { label: ' حي الديرة', value: '146' },
    { label: ' حي العود', value: '147' },
    { label: ' حي المرقب', value: '148' },
    { label: ' حي منفوحة الجديدة', value: '149' },
    { label: ' حي العزيزية', value: '150' },
    { label: ' حي طيبة', value: '151' },
    { label: ' حي المصفاة', value: '152' },
    { label: ' حي الدار البيضاء', value: '153' },
    { label: ' حي المصانع', value: '154' },
    { label: ' حي المنصورة', value: '155' },
    { label: ' حي الحاير', value: '156' },
    { label: ' حي الغنامية', value: '157' },
    { label: 'As Sulimaniyah', value: '158' },
    { label: 'Al Hada', value: '159' },
  ];

  const handleSave = () => {
    const errors = {
      rigin: !riginValue,
      city: !cityValue,
      neighborhood: !neighbearhoodValue,
      description: !descriptionValue,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    saveAddressButton();
  };

  return (
    <>
      
      <Text style={styles.addressTitle}>نقدم خدماتنا فى المناطق والمدن التالية</Text>
      <View style={styles.whiteContainer}>

        <Text style={styles.titleText}>أختر المنطقة <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={Rigin}
          containerStyle={{ height: 50 }}
          dropdownStyle={[{ height: 50 }, fieldErrors.rigin && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
          value={riginValue}
          onChange={(value: string | number) => {
            setFieldErrors(prev => ({ ...prev, rigin: false }));
            setRiginValue(value.toString());
          }}
          placeholder=""
        />

        <Text style={styles.titleText}>أختر المدينة <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={City}
          containerStyle={{ height: 50 }}
          dropdownStyle={[{ height: 50 }, fieldErrors.city && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
          value={cityValue}
          disabled={riginValue === ''}
          onChange={(value: string | number) => {
            setFieldErrors(prev => ({ ...prev, city: false }));
            setCityValue(value.toString());
          }}
          placeholder=""
        />

        <Text style={styles.titleText}>أختر الحى <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={Neighbearhood}
          containerStyle={{ height: 50 }}
          dropdownStyle={[{ height: 50 }, fieldErrors.neighborhood && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
          value={neighbearhoodValue}
          disabled={cityValue === ''}
          onChange={(value: string | number) => {
            setFieldErrors(prev => ({ ...prev, neighborhood: false }));
            setNeighbearhoodValue(value.toString());
          }}
          placeholder="اختر الجنس"
        />

        <Text style={styles.titleText}>وصف العنوان <Text style={{ color: 'red' }}>*</Text></Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => descriptionInputRef.current && descriptionInputRef.current.focus()}
          style={[styles.inputView, fieldErrors.description && { borderColor: 'red' }]}
        >
          <TextInput
            ref={descriptionInputRef}
            style={[styles.fullWidthInput]}
            placeholder="اسم المستفيد"
            value={descriptionValue}
            onChangeText={text => {
              setFieldErrors(prev => ({ ...prev, description: false }));
              setDescriptionValue(text);
            }}
            placeholderTextColor={'#d9d9d9'}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField('')}
          />
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity onPress={handleSave} style={styles.optButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={GoogleMapButton} style={styles.googleButton}>
          <Text style={[styles.saveBtnText, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.regular }]}>استخدم خرائط Google</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};


interface beneficiaryProps {
  onChangeTextName: (text: string) => void;
  nameValue: string;
  onChangeTextRelation: (text: string) => void;
  relationValue: string;
  onChangeTextAge: (text: string) => void;
  ageValue: string;
  onChangeTextGender: (text: string) => void;
  genderValue: string;
  onChangeTextInsurance: (text: string) => void;
  insuranceValue: string;
  PressNationality: (item: string) => void;
  nationality: string;
  SubmitButton: () => void;
  idNumberValue: string;
  onChangeTextIdNumber: (text: string) => void;
  setFocusedField: (field: string) => void;
  isLoading: boolean
}

export const AddBeneficiaryComponent: React.FC<beneficiaryProps> = ({
  onChangeTextName,
  nameValue,
  onChangeTextRelation,
  relationValue,
  onChangeTextAge,
  ageValue,
  onChangeTextGender,
  genderValue,
  onChangeTextInsurance,
  insuranceValue,
  PressNationality,
  nationality,
  SubmitButton,
  idNumberValue,
  onChangeTextIdNumber,
  setFocusedField,
  isLoading
}) => {
  const idNumberInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const ageInputRef = useRef<TextInput>(null);
  const [nameError, setNameError] = React.useState(false);
  const [relationError, setRelationError] = React.useState(false);
  const [genderError, setGenderError] = React.useState(false);
  const [idNumberError, setIdNumberError] = React.useState(false);
  const nationalities = [
    { label: 'مواطن (معفى من الضريبة)', value: 'citizen' },
    { label: 'مقيم', value: 'resident' },
  ];

  const genders = [
    { label: 'اختر الجنس', value: '' },
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' },
  ];

  const insurances = [
    { label: 'اختر شركة التأمين', value: '' },
    { label: 'Arabia Insurance', value: '1' },
    { label: 'Bupa Arabia', value: '2' },
    { label: 'Al Rajhi Takaful', value: '3' },
    { label: 'Tawuniya', value: '4' },
  ];

  const Relation = [
    { label: 'اختر من فضلك', value: '' },
    { label: 'أب', value: '1' },
    { label: 'الأم', value: '2' },
    { label: 'ابن', value: '3' },
    { label: 'زوجة', value: '4' },
    { label: 'بنت', value: '5' },
    { label: 'صديق', value: '6' },
  ];

  // Custom submit handler to validate fields before calling SubmitButton
  const handleSubmit = () => {
    if (isLoading) return;
    let hasError = false;
    if (!nameValue) {
      setNameError(true);
      hasError = true;
    }
    if (!relationValue) {
      setRelationError(true);
      hasError = true;
    }
    if (!genderValue) {
      setGenderError(true);
      hasError = true;
    }

    if (nationality === 'citizen' && !idNumberValue) {
      setIdNumberError(true);
      hasError = true;
    }
    if (hasError) return;
    SubmitButton();
  };

  return (
    <View style={styles.whiteContainer}>
      {/* Name */}
      <Text style={styles.titleText}>اسم المستفيد <Text style={{ color: 'red' }}>*</Text></Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => nameInputRef.current && nameInputRef.current.focus()}
        style={[styles.inputView, nameError && { borderColor: 'red' }]}
      >
        <TextInput
          ref={nameInputRef}
          style={[styles.fullWidthInput]}
          placeholder="اسم المستفيد"
          value={nameValue}
          onChangeText={text => {
            setNameError(false);
            onChangeTextName(text);
          }}
          placeholderTextColor="#d9d9d9"
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField('')}
        />
      </TouchableOpacity>

      {/* Relation */}
      <Text style={styles.titleText}>صلة القرابة <Text style={{ color: 'red' }}>*</Text></Text>
      <Dropdown
        data={Relation}
        containerStyle={{ height: 50 }}
        dropdownStyle={[{ height: 50 }, relationError && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
        value={relationValue}
        onChange={value => {
          setRelationError(false);
          onChangeTextRelation(value.toString());
        }}
        placeholder="اختر الجنس"
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Age */}
        <View style={{ width: '48%' }}>
          <Text style={styles.titleText}>العمر / سنة</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => ageInputRef.current && ageInputRef.current.focus()}
            style={[styles.inputView, { alignItems: 'flex-end' }]}
          >
            <TextInput
              ref={ageInputRef}
              style={styles.fullWidthInput}
              placeholder="0"
              placeholderTextColor="#1e2525ff"
              keyboardType="numeric"
              maxLength={2}
              value={ageValue}
              onChangeText={text => {
                // Keep only digits
                const digitsOnly = text.replace(/[^0-9]/g, '');
                if (digitsOnly === '') {
                  onChangeTextAge('');
                  return;
                }
                // Clamp to range 0..99
                const n = Math.min(99, Math.max(0, parseInt(digitsOnly, 10)));
                onChangeTextAge(String(n));
              }}
              onFocus={() => setFocusedField('age')}
              onBlur={() => setFocusedField('')}
            />
          </TouchableOpacity>
        </View>
        {/* Gender Dropdown */}
        <View style={{ width: '48%' }}>
          <Text style={styles.titleText}>الجنس</Text>
          <Dropdown
            data={genders}
            containerStyle={{ height: 50 }}
            dropdownStyle={[{ height: 50 }, genderError && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
            value={genderValue}
            onChange={value => {
              setGenderError(false);
              onChangeTextGender(value.toString());
            }}
            placeholder="اختر الجنس"
          />
        </View>
      </View>

      {/* Insurance Dropdown */}
      <Text style={styles.titleText}>شركة التأمين</Text>
      <Dropdown
        data={insurances}
        containerStyle={{ height: 50 }}
        dropdownStyle={{ height: 50 }}
        value={insuranceValue}
        onChange={(value: string | number) => onChangeTextInsurance(value.toString())}
        placeholder="اختر شركة التأمين"
      />

      {/* Nationality Radio */}
      <View style={styles.fieldGroup}>
        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
          {nationalities.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.radioContainer}
              onPress={() => PressNationality(item.value)}
            >
              <View style={[styles.radioOuter, nationality === item.value && styles.radioOuterSelected]}>
                {nationality === item.value && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {nationality === 'citizen' && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => idNumberInputRef.current && idNumberInputRef.current.focus()}
          style={[styles.inputView, idNumberError && { borderColor: 'red' }]}
        >
          <TextInput
            ref={idNumberInputRef}
            style={[styles.fullWidthInput]}
            placeholder="ضع رقم الهوية (إجبارى)"
            value={idNumberValue}
            onChangeText={text => {
              setIdNumberError(false);
              onChangeTextIdNumber(text);
            }}
            onFocus={() => setFocusedField('idNumber')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#d9d9d9"
            underlineColorAndroid="transparent"
          />
        </TouchableOpacity>
      )}

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.optButton}>
        <Text style={styles.saveBtnText}>حفظ</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  sheetHeaderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F1EF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  emailTitle: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.light,
    color: '#000',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 10,

  },
  inputView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0dedeff',
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  inputText: {
    textAlign: 'right',
    width: '100%',
    marginLeft: 10,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 16,
    color: '#000'
  },
  sheetButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 7
  },
  bottomSheetHeaderText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#36454F',

  },
  saveBtnText: {
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 14,
  },
  optHeaderText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000'
  },
  inputHeaderText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    textAlign: 'left',
    color: '#000'
  },
  otpView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#999',
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#dcfafcff'
  },
  optButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 7
  },
  googleButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#23a2a4',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 20,
    backgroundColor: '#FAFAFA'
  },
  resendOptTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginTop: 15
  },
  optNotGet: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
    marginRight: 5
  },
  resendPress: {
    color: '#23a2a4',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold
  },
  mainContainer: {
    width: '100%',
    paddingBottom: 10
  },
  whiteContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#36454F',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginVertical: 10,
    marginBottom: 2
  },
  inputViewWithDropdown: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
    marginVertical: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  fieldGroup: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginLeft: 0,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  radioOuterSelected: {
    borderColor: '#23a2a4',
    backgroundColor: '#e4f1ef',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#23a2a4',
  },
  radioLabel: {
    fontSize: 14,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.medium,
  },
  fullWidthInput: {
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
    textAlign: 'right'
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    color: '#36454F',
    marginVertical: 12,
    textAlign: 'center'
  }
})