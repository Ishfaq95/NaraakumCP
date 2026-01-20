import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Modal, Image, SafeAreaView, Platform } from 'react-native';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CheckIcon from '../../assets/icons/CheckIcon';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { ROUTES } from '../../shared/utils/routes';
import Stepper from '../../components/Stapper';
import Step1CatSpecialty from './BookingTabs/Step1CatSpecialty';
import Step2DoctorListing from './BookingTabs/Step2DoctorListing';
import Step3ReviewOrder from './BookingTabs/Step3ReviewOrder';
import { addCardItem, setSelectedLocation } from '../../shared/redux/reducers/bookingReducer';
import SuccessScreen from './SuccessScreen';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import LoaderKit from 'react-native-loader-kit';

const BookingScreen = ({ navigation, route }: any) => {
    const { Patient, VisitMainId } = route.params;
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const user = useSelector((state: any) => state.root.user.user);
    const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
    const dispatch = useDispatch();
    const steps = [1, 2, 3];

    const handleNext = () => {
        if (currentStep == 3) {
            dispatch(addCardItem([]))
            dispatch(setSelectedLocation(null))
            setCurrentStep(4);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleModalClose = () => {
        navigation.goBack();
    };

    const handleReloadNext = () => {
        setCurrentStep(5);
        setTimeout(() => {
            setCurrentStep(2);
        }, 1000);
    };

    const onPressAddMoreServices = () => {
        setCurrentStep(1);
    };

    console.log("VisitMainId===>main", VisitMainId)

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1CatSpecialty handleNext={handleNext} Patient={Patient} />;
            case 2: return <Step2DoctorListing handleNext={handleNext} handleReloadNext={handleReloadNext} Patient={Patient} onPressAddMoreServices={onPressAddMoreServices} />;
            case 3: return <Step3ReviewOrder handleNext={handleNext} Patient={Patient} VisitMainId={VisitMainId} />;
            case 5: return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoaderKit
                    style={{ width: 100, height: 100 }}
                    name={'BallSpinFadeLoader'}
                    color={'green'}
                />
            </View>
            default: return null;
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{currentStep == 1 ? 'Service Selection' : currentStep == 2 ? 'Provider Listing' : 'Confirmation'}</Text>
            </View>
            <TouchableOpacity onPress={backButtonPress} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    const backButtonPress = () => {
        if (existingCardItems.length > 0) {
            setShowWarningModal(true);
        } else {
            navigation.goBack();
        }
    };

    const handleYes = () => {
        setShowWarningModal(false);
    };

    const handleNo = () => {
        setShowWarningModal(false);
        // Clear data and go back
        dispatch(addCardItem([]));
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

            {/* Warning Bottom Sheet */}
            <CustomBottomSheet
                visible={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                maxHeight={200}
                showHandle={false}
                backdropClickable={false}
            >
                <View style={styles.warningBottomSheetContent}>
                    {/* Header */}
                    <View style={styles.warningModalHeader}>
                        <Text style={styles.warningTitle}>Warning</Text>
                        <TouchableOpacity
                            onPress={() => setShowWarningModal(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Question */}
                    <Text style={styles.warningQuestion}>
                        Do You Want To Keep The Data Before Exiting?
                    </Text>

                    {/* Buttons */}
                    <View style={styles.warningButtonContainer}>
                        <TouchableOpacity
                            onPress={handleYes}
                            style={styles.warningButton}
                        >
                            <Text style={styles.warningButtonText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleNo}
                            style={[styles.warningButton,{backgroundColor: '#6C757D'}]}
                        >
                            <Text style={styles.warningButtonText}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomBottomSheet>

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
        justifyContent: 'space-between',
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
        color: '#191919',
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
    warningBottomSheetContent: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    warningModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    warningTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000000',
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningQuestion: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: Platform.OS === 'ios' ? 22 : 24,
    },
    warningButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    warningButton: {
        flex: 1,
        backgroundColor: '#3AA8A8',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#FFFFFF',
        lineHeight: Platform.OS === 'ios' ? 0 : 22,
    },
});

export default BookingScreen; 