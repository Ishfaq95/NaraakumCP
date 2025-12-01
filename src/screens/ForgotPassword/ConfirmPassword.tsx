import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, TextInput, Platform, I18nManager, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../services/api/authService';
import { ROUTES } from '../../shared/utils/routes';
import ResetPasswordIcon from '../../assets/icons/ResetPasswordIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import FullScreenLoader from '../../components/FullScreenLoader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// Define the navigation param list type
type RootStackParamList = {
  [ROUTES.Login]: undefined;
};

const ConfirmPassword = ({ route }: any) => {
  const UserId = route.params.UserId;
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [PasswordNotMatch, setPasswordNotMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = I18nManager.isRTL;
  const handleBack = () => {
    navigation.goBack();
  }

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text numberOfLines={1} style={[globalTextStyles.h5, styles.headerTitle]}>{'Change Password'}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const handleConfirmPassword = async () => {
    
    if (newPassword.trim() === '') {
      setNewPasswordError('New password is required');
      return;
    } else {
      setNewPasswordError('');
    }
    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('Confirm password is required');
      return;
    } else {
      setConfirmPasswordError('');
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotMatch(true);
      return;
    } else {
      setPasswordNotMatch(false);
    }

    try {
      setIsLoading(true);
      const payload = {
        "UserloginInfoId": UserId,
        "Password": newPassword,
      }
      const response = await authService.resetPassword(payload);
      if (response.ResponseStatus.STATUSCODE == 200) {
        navigation.navigate(ROUTES.Login);
      } else {
      }
    } catch (error) {
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <ResetPasswordIcon />
              </View>

              {/* Main Heading */}
              <Text style={styles.mainHeading}>
              Set New Password
              </Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.questionRow}>
                  <Text style={styles.questionText}>{'New Password'}</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                {/* Password Input */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isRTL && styles.rtlInput,
                      newPasswordError && styles.inputError
                    ]}
                    placeholder={t('password')}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (newPasswordError) setNewPasswordError('');
                    }}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor="#999"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showNewPassword ? (
                      <EyeIcon width={22} height={22} color="#666666" />
                    ) : (
                      <EyeOffIcon width={22} height={22} color="#666666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.questionRow}>
                  <Text style={styles.questionText}>{'Confirm Password'}</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                {/* Password Input */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isRTL && styles.rtlInput,
                      confirmPasswordError && styles.inputError
                    ]}
                    placeholder={t('password')}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
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
              </View>

              {PasswordNotMatch && <Text style={styles.errorText}>{'Confirm password and new password do not match'}</Text>}

              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleConfirmPassword} style={styles.button}>
                  <Text style={styles.buttonText}>{'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {/* <FullScreenLoader visible={isLoading} /> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    ...globalTextStyles.h2,
    color: '#008080', // Teal color as shown in the image
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  subText: {
    ...globalTextStyles.bodyLarge,
    fontWeight: 'bold',
    color: '#666', // Gray color as shown in the image
    textAlign: 'left',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000', // Teal color to match the main heading
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 50,
  },
  inputGroup: {
    marginBottom: 15,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  questionText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    marginBottom: 8,
  },
  textInput: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonWithBorder: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
  },
  buttonTextWithBorder: {
    ...globalTextStyles.bodySmall,
    color: '#008080',
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
  errorText: {
    color: 'red',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center'
  }
})

export default ConfirmPassword