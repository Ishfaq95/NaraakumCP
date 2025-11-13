import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Stepper from './tabs/Stepper';
import Step1PatientComplaint from './tabs/Step1PatientComplaint';
import Step2PatientHistory from './tabs/Step2PatientHistory';
import Step3PatientAssessment from './tabs/Step3PatientAssessment';
import Step4Treatment from './tabs/Step4Treatment';
import { appointmentService } from '../../services/api/appointmentService';
import { useDispatch, useSelector } from 'react-redux';
import { setVisitMainData, setVisitMainId } from '../../shared/redux/reducers/generalDataReducer';

interface Step1Data {
    chiefComplaint?: string;
    presentIllness?: string;
    durationValue?: string;
    durationUnit?: string;
    otherComplaint?: string;
}

interface Step2Data {
    pastMedicalHistory?: string[];
    pastSurgicalHistory?: string[];
    allergy?: string[];
    currentMeds?: string[];
}

interface Step3Data {
    vitalSigns?: any;
    oe?: any;
    labXRays?: any;
    dx?: any;
}

const AddSessionRecord = ({route}: {route: any}) => {
    const navigation = useNavigation();
    const patientData: any = route?.params?.patientData || null;
    const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
    const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
    const dispatch = useDispatch();

    useEffect(() => {
        if (visitmainId) {
            getVisitMainRecordDetail();
        }
    }, [visitmainId]);

    const getVisitMainRecordDetail = async () => {
        const payload = {
            VisitMainId: visitmainId,
        };
        const response = await appointmentService.getVisitMainRecordDetail(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            dispatch(setVisitMainData(response));
        }
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<{
        step1: Step1Data;
        step2: Step2Data;
        step3: Step3Data;
        step4: any;
    }>({
        step1: {},
        step2: {},
        step3: {},
        step4: {},
    });

    const handleStepPress = (step: number) => {
        setCurrentStep(step);
    };

    const handleNext = () => {
        getVisitMainRecordDetail();
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        // Handle form completion and save
        navigation.goBack();
    };

    const handleDataChange = (stepKey: string, data: any) => {
        setFormData(prev => ({
            ...prev,
            [stepKey]: data,
        }));
    };

    const backButtonPress = () => {
        dispatch(setVisitMainData(null as any));
        dispatch(setVisitMainId(null as any));
        navigation.goBack();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Session Record</Text>
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1PatientComplaint
                        patientData={patientData}
                        onNext={handleNext}
                    />
                );
            case 2:
                return (
                    <Step2PatientHistory
                        onNext={handleNext}
                        onSkip={handleNext}
                    />
                );
            case 3:
                return (
                    <Step3PatientAssessment
                        onNext={handleNext}
                        onSkip={handleNext}
                    />
                );
            case 4:
                return (
                    <Step4Treatment
                        onComplete={handleComplete}
                        onPrevious={handlePrevious}
                        data={formData.step4}
                        onDataChange={(data) => handleDataChange('step4', data)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <Stepper
                    currentStep={currentStep}
                    totalSteps={4}
                    onStepPress={handleStepPress}
                />
                {renderStepContent()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#fff',
        // paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
        // marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
});

export default AddSessionRecord;