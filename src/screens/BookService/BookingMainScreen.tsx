import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Modal, Image, SafeAreaView } from 'react-native';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckIcon from '../../assets/icons/CheckIcon';
import { globalTextStyles } from '../../styles/globalStyles';
import { ROUTES } from '../../shared/utils/routes';
import Stepper from '../../components/Stapper';
import Step1CatSpecialty from './BookingTabs/Step1CatSpecialty';
import Step2DoctorListing from './BookingTabs/Step2DoctorListing';
import Step3ReviewOrder from './BookingTabs/Step3ReviewOrder';

const BookingScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const user = useSelector((state: any) => state.root.user.user);
    const dispatch = useDispatch();
    const steps = [1, 2, 3];

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1CatSpecialty />;
            case 2: return <Step2DoctorListing />;
            case 3: return <Step3ReviewOrder />;
            default: return null;
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prescription List</Text>
        </View>
    );

    const backButtonPress = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['rgba(39,165,153,0.47)', '#54b196']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.515, y: 0.5 }}
                style={styles.container}
            >
                {renderHeader()}
                <View style={{ backgroundColor: '#fff' }}>
                    <Stepper currentStep={currentStep} steps={steps} />

                </View>
                <View style={styles.content}>
                    {renderStep()}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
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
        paddingHorizontal: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        ...globalTextStyles.h5,
        marginLeft: 8,
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
});

export default BookingScreen; 