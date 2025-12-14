import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, Keyboard } from 'react-native'
import React, { useState } from 'react'
import CustomScreensHeader from '../../components/common/CustomScreensHeader'
import colors from '../../styles/colors'
import { ROBOTO_FONTS } from '../../styles/fonts'
import Icon from 'react-native-vector-icons/Ionicons'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import GoogleIcon from '../../assets/icons/GoogleIcon';
import AppleIcon from '../../assets/icons/AppleIcon';
import { signInWithGoogle } from '../../services/auth/googleAuthService';
import appleAuth from '@invertase/react-native-apple-authentication';
import { authService } from '../../services/api/authService'
import WebSocketService from '../../components/WebSocketService'
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer'

const DeleteAccountScreen = () => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('')
    const [secure, setSecure] = useState(true)
    const user = useSelector((state: any) => state.root.user.user);
    const [isLoading, setIsLoading] = useState(false);
    const webSocketService = WebSocketService.getInstance();
    const [passwordError, setPasswordError] = useState(false);
    const [deleteAccountError, setDeleteAccountError] = useState(false);
    const dispatch = useDispatch();
    const onDelete = () => {
        // Hook into your delete API flow here
    }

    const handleBack = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Delete My Account</Text>
        </View>
    );

    const isDisabled = password.trim().length === 0

    const handleDeleteAccount = async () => {
        // Dismiss keyboard immediately
        Keyboard.dismiss();

        try {
            setIsLoading(true);
            let hasError = false;

            if (!password.trim()) {
                setPasswordError(true);
                hasError = true;
            }

            if (hasError) {
                setIsLoading(false);
                return;
            }

            let data = {
                "Username": user?.Id,
                "Password": password,
                "Filter": "userId"
            }

            const response = await authService.deleteAccount(data);

            if (response?.StatusCode?.STATUSCODE == 3010) {
                setIsLoading(false);
                setDeleteAccountError(true);


            } else if (response?.StatusCode?.STATUSCODE == 3032) {
                setDeleteAccountError(true);
            } else {
                dispatch(setUser(null));
                dispatch(setTopic(null));
                webSocketService.disconnect();
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            // Handle login error here (show error message, etc.)
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const googleUser = await signInWithGoogle();

            await deleteSocialAccount(googleUser.id);

        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Google login failed",
                [{ text: "OK" }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSocialAccount = async (UniqueSocialId: string | undefined) => {
        try {
            const payload = {
                "UniqueSocialId": UniqueSocialId,
                "Username": user?.Id,
                "Filter": "socialId"
            }

            const response = await authService.deleteAccount(payload);

            if (response?.StatusCode?.STATUSCODE == 3010) {
                Alert.alert(
                    "Error",
                    response?.StatusCode?.MESSAGE,
                    [{ text: "OK" }]
                );
            } else if (response?.StatusCode?.STATUSCODE == 3032) {
                Alert.alert(
                    "Error",
                    response?.StatusCode?.MESSAGE,
                    [{ text: "OK" }]
                );
            } else {
                dispatch(setUser(null));
                dispatch(setTopic(null));
                webSocketService.disconnect();
            }
        } catch (error: any) {
        }
    }

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

            await deleteSocialAccount(user);

        } catch (error: any) {
            if (error.code === appleAuth.Error.CANCELED) {
            } else {
                Alert.alert(
                    "Error",
                    error.message || "Apple login failed",
                    [{ text: "OK" }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(false);
        if (deleteAccountError) setDeleteAccountError(false);
    };

    const renderSocialButtons = () => {
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.socialButtonsRow}>
                    {user.CatSocialServerId == 1 ? <TouchableOpacity
                        style={[styles.socialButton, styles.googleButton]}
                        onPress={handleGoogleLogin}
                    >
                        <GoogleIcon width={24} height={24} style={styles.socialIcon} />
                        <Text style={[globalTextStyles.bodySmall, styles.socialButtonText]}>Continue with Google</Text>
                    </TouchableOpacity>
                        : <TouchableOpacity
                            style={[styles.socialButton, styles.appleButton]}
                            onPress={handleAppleLogin}
                        >
                            <AppleIcon
                                width={24}
                                height={24}
                                style={styles.socialIcon}
                                color="#FFFFFF"
                            />
                            <Text style={[globalTextStyles.bodySmall, styles.socialButtonText, { color: '#FFFFFF' }]}>
                                Continue with Apple
                            </Text>
                        </TouchableOpacity>}
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.socialButton, styles.googleButton, styles.centerButton]}
                onPress={handleGoogleLogin}
            >
                <GoogleIcon width={24} height={24} style={styles.socialIcon} />
                <Text style={[globalTextStyles.bodySmall, styles.socialButtonText]}>Continue with Google</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                <View style={{ width: '100%', marginTop: 20 }}>
                    <Text style={styles.title}>Are you sure you want to permanently delete the account?</Text>
                    <Text style={styles.subtitle}>Please note the following before proceeding:</Text>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            All your data and personal information associated with the account will be deleted. You will not be able to recover the account or access any of the content linked to it after deletion.
                        </Text>
                    </View>

                    <Text style={styles.label}>To Confirm Deletion, Enter Your Password.</Text>
                    {(user.UniqueSocialId != null && user.UniqueSocialId != "" && user.UniqueSocialId != undefined) ? (
                        renderSocialButtons()
                    ) :
                        <View>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, passwordError && styles.inputError]}
                                    placeholder="Password"
                                    placeholderTextColor="#9A9FA5"
                                    secureTextEntry={secure}
                                    value={password}
                                    onChangeText={handlePasswordChange}
                                />
                                <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeBtn}>
                                    <Icon name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primary[600]} />
                                </TouchableOpacity>
                                
                            </View>
                            {deleteAccountError && <Text style={[globalTextStyles.bodySmall, { color: 'red',  textAlign: 'center' }]}>Password is incorrect</Text>}
                            <TouchableOpacity
                                disabled={isDisabled}
                                onPress={handleDeleteAccount}
                                style={[styles.deleteBtn, isDisabled && styles.deleteBtnDisabled]}
                            >
                                <Text style={[styles.deleteBtnText, isDisabled && styles.deleteBtnTextDisabled]}>Delete Account</Text>
                            </TouchableOpacity>
                            
                        </View>}
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: '#E4F1EF',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    subtitle: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#666',
    },
    warningBox: {
        marginTop: 12,
        backgroundColor: '#FFF2CC',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F6E3A1',
    },
    warningText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#666',
    },
    label: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginTop: 30,
    },
    inputWrapper: {
        marginTop: 10,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DADADA',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        ...globalTextStyles.bodyMedium,
    },
    eyeBtn: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    deleteBtn: {
        marginTop: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D9534F',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    deleteBtnDisabled: {
        borderColor: '#E5B9B8',
    },
    deleteBtnText: {

        color: '#D9534F',
    },
    deleteBtnTextDisabled: {
        color: '#E5B9B8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000'
    },
    backButton: {
        padding: 5,
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 20,
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
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    socialButtonText: {
        color: '#333333',
        flexShrink: 1,
        textAlign: 'center',
    },
    centerButton: {
        alignSelf: 'center',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
})

export default DeleteAccountScreen