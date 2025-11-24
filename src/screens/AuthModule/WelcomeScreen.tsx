import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ImageBackground,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DoctorVectorsIcon from '../../assets/icons/DoctorVectors';
import Svg, { Path } from 'react-native-svg';
import { globalTextStyles } from '../../styles/globalStyles';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../shared/utils/routes';

const { width } = Dimensions.get('window');

const PRIMARY = '#008B62'; // from assets theme
const BG = '#EAF5F3';

const WelcomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const handleLogin = () => {
        // navigation.navigate('Login' as never);
    };

    const handleCreateAccount = () => {
        // navigation.navigate('Register' as never);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{width: '100%', alignItems: 'flex-end',paddingHorizontal: 16}}>
            <Image source={require('../../assets/images/lang.png')} style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                }} />
            </View>
            <View style={styles.logoWrap}>
                <Image source={require('../../assets/icons/logo.png')} style={{
                    width: width * 0.70,
                    height: width * 0.70 * (188 / 375),
                    resizeMode: 'contain',
                }} />
            </View>

            <View style={styles.illustrationWrap}>
                <Image source={require('../../assets/images/doctorvector.png')} style={{
                    width: width * 0.98,
                    height: width * 0.98 * (188 / 375),
                    resizeMode: 'contain',
                    marginBottom: 16,
                }} />
            </View>

            <View style={styles.actions}>
                <ImageBackground
                    source={require('../../assets/icons/buttonsBackground.png')}
                    resizeMode='stretch'
                    style={{
                        width: '100%',
                        height: '100%',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                    }}
                >
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.loginButton} onPress={() => navigation.navigate(ROUTES.Login as never)}>
                            <Text style={styles.loginButtonText}>{t('login')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.createButton} onPress={() => { navigation.navigate(ROUTES.SignUp as never) }}>
                            <Text style={styles.createButtonText}>{t('create_new_account')}</Text>
                        </TouchableOpacity>
                        
                    </View>
                    <View style={styles.bottomContainer}>
                            <Text style={styles.bottomText}>{'Version 1.0.0'}</Text>
                        </View>


                </ImageBackground>

            </View>


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationWrap: {
        width: '100%',
        marginBottom: -30,
        alignItems: "center"
    },
    actions: {
        width: '100%',
        height: '30%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    actionsContainer: {
        width: '100%',
        height: '85%',
        paddingTop: 16,
        justifyContent: 'center',
        alignItems: 'center',
        // paddingHorizontal: 16,
    },
    primaryBtn: {
        width: '100%',
        height: 50,
        backgroundColor: "#239EA0",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    primaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryBtn: {
        marginTop: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryText: {
        color: PRIMARY,
        fontSize: 16,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#239EA0',
        borderRadius: 8,
        width: width * 0.90,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    loginButtonText: {
        ...globalTextStyles.buttonLarge,
    },
    createButton: {
        borderWidth: 1.5,
        borderColor: '#239EA0',
        borderRadius: 8,
        width: width * 0.90,
        paddingVertical: 10,
        alignItems: 'center',
        // marginBottom: 16,
    },
    createButtonText: {
        ...globalTextStyles.buttonMedium,
        color: '#239EA0',
    },
    bottomContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomText: {
        ...globalTextStyles.bodySmall,
        color: '#ABABAB',
    },
});

export default WelcomeScreen;
