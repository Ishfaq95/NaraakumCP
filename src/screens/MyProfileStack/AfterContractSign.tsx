import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Platform, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { ROUTES } from '../../shared/utils/routes';
import { useSelector } from 'react-redux';

interface RouteParams {
    email?: string;
}

const AfterContractSign: React.FC = () => {
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);

    const handleBackToProfile = () => {
        navigation.navigate(ROUTES.PaymentProfileScreen as never);
    };

    // Handle Android hardware back button same as "Back To Profile"
    useEffect(() => {
        const onBackPress = () => {
            handleBackToProfile();
            return true; // prevent default behavior
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            subscription.remove();
        };
    }, []);

    // Disable iOS swipe-back gesture on this screen
    useEffect(() => {
        navigation.setOptions({
            // @ts-ignore - gestureEnabled exists on native stack / stack navigators
            gestureEnabled: false,
        } as any);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="checkmark-sharp" size={42} color="#33A281" />
                </View>

                <Text style={styles.title}>Thank you for your signature.</Text>
                <Text style={styles.subtitle}>
                   {user?.Email ? "The data will be reviewed and the contract file will be sent to your email." : "Your contract has been signed successfully."}
                </Text>
                {user?.Email && <Text style={styles.email}>{user?.Email}</Text>}

                <TouchableOpacity style={styles.button} onPress={handleBackToProfile} activeOpacity={0.9}>
                    <Text style={styles.buttonText}>Back To Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    iconWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#E7F3EF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 16,
        color: '#191919',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
        textAlign: 'center',
        marginBottom: 14,
    },
    email: {
        fontSize: 14,
        color: '#1F9DA3',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        width: '100%',
        backgroundColor: '#2E9DA4',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
});

export default AfterContractSign;

