import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Modal, Image, SafeAreaView, Platform } from 'react-native';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckIcon from '../../assets/icons/CheckIcon';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { ROUTES } from '../../shared/utils/routes';
import Stepper from '../../components/Stapper';
import Step1CatSpecialty from './BookingTabs/Step1CatSpecialty';
import Step2DoctorListing from './BookingTabs/Step2DoctorListing';
import Step3ReviewOrder from './BookingTabs/Step3ReviewOrder';
import { addCardItem } from '../../shared/redux/reducers/bookingReducer';
import SuccessScreen from './SuccessScreen';

const BookingScreen = ({ navigation, route }: any) => {
    const { Patient } = route.params;
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const user = useSelector((state: any) => state.root.user.user);
    const dispatch = useDispatch();
    const steps = [1, 2, 3];

    const handleNext = () => {
        if(currentStep == 3){
            dispatch(addCardItem([]))
            setCurrentStep(4);
        }else{
            setCurrentStep(currentStep + 1);
        }
    };

    const handleModalClose = () => {
        navigation.goBack();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1CatSpecialty handleNext={handleNext} Patient={Patient} />;
            case 2: return <Step2DoctorListing handleNext={handleNext} />;
            case 3: return <Step3ReviewOrder handleNext={handleNext} Patient={Patient} />;
            default: return null;
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose Service</Text>
            </View>
            <TouchableOpacity onPress={backButtonPress} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    const backButtonPress = () => {
        dispatch(addCardItem([]))
        navigation.goBack();
    };

    const handleStepPress = (step: number) => {
        setCurrentStep(step);
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
                    <Stepper currentStep={currentStep} steps={steps} onStepPress={handleStepPress} />

                </View>
                <View style={styles.content}>
                    {renderStep()}
                </View>
            </LinearGradient>
            
            {/* Success Modal */}
            <Modal
                visible={currentStep === 4}
                animationType="slide"
                transparent={false}
                onRequestClose={handleModalClose}
            >
                <SuccessScreen onAgree={handleModalClose} />
            </Modal>
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
        justifyContent:'space-between',
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
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginLeft: 4,
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e82424',
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#e82424',
    },
});

export default BookingScreen; 