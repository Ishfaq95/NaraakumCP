import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, SafeAreaView, TouchableOpacity, Alert, Linking, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { appointmentService } from '../../services/api/appointmentService';
import { MediaBaseURL } from '../../shared/utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const PrescriptionView = ({ route }: { route: any }) => {
    const prescriptionData = route.params?.prescriptionData;
    const [visitRecordData, setVisitRecordData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    console.log('visitMainData', visitRecordData);
    const navigation = useNavigation();
    useEffect(() => {
        if (prescriptionData) {
            getVisitMainRecordDetail();
        }
    }, [prescriptionData]);

    const getVisitMainRecordDetail = async () => {
        try {
            setIsLoading(true);
            const payload = {
                VisitMainId: prescriptionData.Id,
            };
            const response = await appointmentService.getVisitMainRecordDetail(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setVisitRecordData(response);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#000" />
    }

    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const formatDuration = (duration: number, catTimeUnitId: number) => {
        if (!duration) return '';
        const timeUnits: { [key: number]: string } = {
            1: 'Day',
            2: 'Week',
            3: 'Month',
            4: 'Year',
            5: 'Hour',
            6: 'Minutes',
        };
        const unit = timeUnits[catTimeUnitId] || '';
        return `${duration} ${unit}`;
    };

    const renderHospitalSection = () => {
        const hospitalInfo = visitRecordData?.HospitalInfo?.[0];

        return (
            <View style={styles.section}>
                {renderSectionHeader('Hospital')}
                <View style={styles.hospitalContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: 20, color: '#666', marginBottom: 4 }}>Care Provider</Text>
                            <Text style={styles.valueBold}>{hospitalInfo?.FullnamePlang || hospitalInfo?.FullnameSlang}</Text>
                        </View>
                        {hospitalInfo?.LogoImagePath ? (
                            <Image
                                source={{ uri: `${MediaBaseURL}${hospitalInfo?.LogoImagePath}` }}
                                style={styles.hospitalImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.hospitalImagePlaceholder}>
                                <Ionicons name="business" size={24} color="#ccc" />
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',marginTop: 8 }}>
                        <View style={styles.detailRow}>
                            <Ionicons name="business-outline" size={20} color="#666" />
                            <Text style={styles.label}>Hospital</Text>
                        </View>
                        <Text style={styles.hospitalName}>{hospitalInfo?.TitlePlang || hospitalInfo?.TitleSlang}</Text>
                    </View>


                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',marginTop: 4 }}>

                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <Text style={styles.label}>Session Date</Text>
                        </View>

                        <Text style={styles.sessionDate}>{moment.utc(hospitalInfo?.VisitDate).local().format('DD/MM/YYYY')}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderPatientComplaintSection = () => {
        const complaint = visitRecordData?.PatientComplaint?.[0];

        return (
            <View style={styles.section}>
                {renderSectionHeader('Patient complaint')}
                <View style={styles.sectionContent}>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Chief Complaint "CC"</Text>
                        <Text style={styles.fieldValue}>{complaint?.ChiefComplaint || ''}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Description Of Complaint</Text>
                        <Text style={styles.fieldValue}>{complaint?.PresentIllness || ''}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Duration Of Complaint</Text>
                        <Text style={styles.fieldValue}>
                            {formatDuration(complaint?.DurationOfComplaint, complaint?.CatTimeUnitId)}
                        </Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Other Complaint</Text>
                        <Text style={styles.fieldValue}>{complaint?.OtherComplaint || ''}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderPatientHistorySection = () => {
        const history = visitRecordData?.PatientHistory?.[0];

        const renderHistoryField = (title: string, value: string) => {
            if (!value || value.trim() === '' || value === '-') {
                return (
                    <View style={styles.historySubSection}>
                        <Text style={styles.historySubTitle}>{title}</Text>

                        <Text style={styles.historyLine}>{""}</Text>

                        <View style={styles.separator} />
                    </View>
                );
            }

            const lines = value.split('#').filter(line => line.trim() !== '');
            if (lines.length === 0) return null;

            return (
                <View style={styles.historySubSection}>
                    <Text style={styles.historySubTitle}>{title}</Text>
                    {lines.map((line, index) => (
                        <Text key={index} style={styles.historyLine}>{line}</Text>
                    ))}
                    <View style={styles.separator} />
                </View>
            );
        };

        const pmhField = renderHistoryField('Past Medical History', history ? history.PMH : '-');
        const pshField = renderHistoryField('Past Surgical History', history ? history.PSH : '-');
        const allergyField = renderHistoryField('Allergy', history ? history.Allergy : '-');
        const currentMedsField = renderHistoryField('Current Meds', history ? history.CurrentMeds : '-');

        // Only render section if there's at least one field to show
        if (!pmhField && !pshField && !allergyField && !currentMedsField) return null;

        return (
            <View style={styles.section}>
                {renderSectionHeader('Patient History')}
                <View style={styles.sectionContent}>
                    {pmhField}
                    {pshField}
                    {allergyField}
                    {currentMedsField}
                </View>
            </View>
        );
    };

    const renderVitalSigns = () => {
        const vitalSigns = visitRecordData?.PatientAssessment?.[0]?.VitalSigns?.[0];

        return (
            <View style={styles.vitalSignsContainer}>
                <View style={styles.vitalSignsHeader}>
                    <Text style={styles.vitalSignsHeaderText}>Vital Signs</Text>
                </View>
                <View style={styles.vitalSignsGrid}>
                    <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>Tem</Text>
                        <Text style={styles.vitalSignValue}>{vitalSigns?.Tem || ''}</Text>
                    </View>
                    <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>H/R</Text>
                        <Text style={styles.vitalSignValue}>{vitalSigns?.HR || ''}</Text>
                    </View>
                    <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>P4 O2</Text>
                        <Text style={styles.vitalSignValue}>{vitalSigns?.P4O2 || ''}</Text>
                    </View>
                    <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>R/R</Text>
                        <Text style={styles.vitalSignValue}>{vitalSigns?.RR || ''}</Text>
                    </View>
                    <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>Bp</Text>
                        <Text style={styles.vitalSignValue}>{vitalSigns?.Bp || ''}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const groupOEByTitle = (oeArray: any[]) => {
        const grouped: { [key: string]: any[] } = {};
        oeArray?.forEach((item) => {
            const title = item.Title || 'Other';
            if (!grouped[title]) {
                grouped[title] = [];
            }
            grouped[title].push(item);
        });
        return grouped;
    };

    const renderOESection = () => {
        const sequenceArray = ['General Inspection', 'Skin', 'LN', 'Eye', 'Thyroid', 'Cardiovascular signs'];
        const oeArray = visitRecordData?.PatientAssessment?.[0]?.OE || [];
        // if (oeArray.length === 0) return null;

        const groupedOE = groupOEByTitle(oeArray);
        const allTitles = Object.keys(groupedOE);

        // Sort titles according to sequenceArray, then append any titles not in sequence
        const sortedTitles = allTitles.sort((a, b) => {
            const indexA = sequenceArray.indexOf(a);
            const indexB = sequenceArray.indexOf(b);

            // If both are in sequence array, sort by their index
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // If only A is in sequence, A comes first
            if (indexA !== -1) return -1;
            // If only B is in sequence, B comes first
            if (indexB !== -1) return 1;
            // If neither is in sequence, maintain original order
            return 0;
        });

        return (
            <View style={styles.oeContainer}>
                <View style={styles.vitalSignsHeader}>
                    <Text style={styles.vitalSignsHeaderText}>O/E</Text>
                </View>
                {sortedTitles.map((title) => (
                    <View key={title} style={styles.oeGroup}>
                        <Text style={styles.oeGroupTitle}>{title}</Text>
                        {groupedOE[title].map((item, index) => (
                            <View key={index} style={styles.oeFieldRow}>
                                <Text style={styles.oeFieldLabel}>{item.BodyAnatomyTitle}</Text>
                                <Text style={styles.oeFieldValue}>{item.InputValue || '-'}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const renderPatientAssessmentSection = () => {
        const assessment = visitRecordData?.PatientAssessment?.[0];

        const vitalSigns = renderVitalSigns();
        const oeSection = renderOESection();

        return (
            <View style={styles.section}>
                {renderSectionHeader('Patient assessment')}
                <View style={styles.sectionContent}>
                    {vitalSigns}
                    {oeSection}
                </View>
            </View>
        );
    };

    const renderDiagnosisSection = () => {
        const diagnosis = visitRecordData?.PatientAssessment?.[0]?.Diagnosis || [];

        const provisional = diagnosis?.find((d: any) => d.CatDxType === 1);
        const differential = diagnosis?.find((d: any) => d.CatDxType === 2);

        const hasProvisionalDetail = provisional?.Detail && Array.isArray(provisional?.Detail) && provisional?.Detail?.length > 0;
        const hasDifferentialDetail = differential?.Detail && Array.isArray(differential?.Detail) && differential?.Detail?.length > 0;

        return (
            <View style={styles.section}>
                <View style={styles.dxHeader}>
                    <Text style={styles.dxHeaderText}>DX</Text>
                </View>
                <View style={styles.sectionContent}>
                    {provisional && hasProvisionalDetail && (
                        <View style={styles.diagnosisGroup}>
                            <Text style={styles.diagnosisGroupTitle}>Provisional Dx</Text>
                            {provisional?.Detail?.map((detail: any, index: number) => (
                                <View key={index}>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>Specialty</Text>
                                        <Text style={styles.diagnosisFieldValue}>
                                            {provisional?.DiagnosisSpecialtyTitle || '-'}
                                        </Text>
                                    </View>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>ICD 10 Code</Text>
                                        <Text style={styles.diagnosisFieldValue}>{detail.Code || '-'}</Text>
                                    </View>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>Diagnosis</Text>
                                        <Text style={styles.diagnosisFieldValue}>{detail.Diagnosis || '-'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                    {differential && hasDifferentialDetail && (
                        <View style={styles.diagnosisGroup}>
                            <Text style={styles.diagnosisGroupTitle}>Differential Dx</Text>
                            {differential?.Detail?.map((detail: any, index: number) => (
                                <View key={index}>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>Specialty</Text>
                                        <Text style={styles.diagnosisFieldValue}>
                                            {differential?.DiagnosisSpecialtyTitle || '-'}
                                        </Text>
                                    </View>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>ICD 10 Code</Text>
                                        <Text style={styles.diagnosisFieldValue}>{detail.Code || '-'}</Text>
                                    </View>
                                    <View style={styles.diagnosisFieldRow}>
                                        <Text style={styles.diagnosisFieldLabel}>Diagnosis</Text>
                                        <Text style={styles.diagnosisFieldValue}>{detail.Diagnosis || '-'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const handleDownload = async (filePath: string, fileName: string) => {
        try {
            const url = `${MediaBaseURL}${filePath}`;
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open file');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const renderLabXRaysSection = () => {
        const labXRays = visitRecordData?.PatientAssessment?.[0]?.LabXRays || [];
        // if (labXRays.length === 0) return null;

        const groupedFiles: { [key: string]: any[] } = {};
        labXRays?.forEach((file: any) => {
            const category = file.FileTypeTitlePlang || 'Others';
            if (!groupedFiles[category]) {
                groupedFiles[category] = [];
            }
            groupedFiles[category].push(file);
        });

        return (
            <View style={styles.section}>
                <View style={styles.labHeader}>
                    <Text style={styles.labHeaderText}>Lab & X-Rays</Text>
                </View>
                <View style={styles.sectionContent}>
                    {Object.keys(groupedFiles)?.map((category) => (
                        <View key={category} style={styles.labFileRow}>
                            <Text style={styles.labFileCategory}>File Category : {category}</Text>
                            <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={() => {
                                    const file = groupedFiles?.[category]?.[0];
                                    handleDownload(file.FilePath, file.FileName || '');
                                }}
                            >
                                <Text style={styles.downloadButtonText}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderTreatmentPlanSection = () => {
        const treatmentPlan = visitRecordData?.TreatmentPlan?.[0];

        return (
            <View style={styles.section}>
                {renderSectionHeader('Treatment Plan')}
                <View style={styles.sectionContent}>
                    <View style={styles.procedureContainer}>
                        <View style={styles.procedureHeader}>
                            <Text style={styles.procedureHeaderText}>Procedures</Text>
                        </View>
                        <View style={styles.procedureContent}>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>Procedure</Text>
                                <Text style={styles.fieldValue}>{treatmentPlan?.Procedure[0]?.Procedurees || 'NA'}</Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>Comment</Text>
                                <Text style={styles.fieldValue}>{treatmentPlan?.Procedure[0]?.Comments || 'NA'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.prescriptionContainer}>
                        <View style={styles.prescriptionHeader}>
                            <Text style={styles.prescriptionHeaderText}>Prescription</Text>
                        </View>
                        {treatmentPlan?.Medicines?.map((medicine: any, index: number) => (
                            <View key={index} style={styles.medicineCard}>
                                <View style={styles.medicineHeader}>
                                    <Ionicons name="medical" size={20} color="#14b8a6" />
                                    <View>
                                        <Text style={{ marginLeft: 8, color: '#1a3c40' }}>{'Medicine Name'}</Text>
                                        <Text style={styles.medicineName}>{medicine?.MedicineName || '-'}</Text>
                                    </View>
                                </View>
                                <View style={styles.medicineFields}>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Drug Type</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Title || '-'}</Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Duration</Text>
                                        <Text style={styles.medicineFieldValue}>
                                            {medicine?.Duration} {medicine?.TimeUnitPlang || ''}
                                        </Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Quantity</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Quantity || '-'}</Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Dose</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Dose || '-'}</Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Unit</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Unit || '-'}</Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Frequency</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Frequency || '-'}</Text>
                                    </View>
                                    <View style={styles.medicineFieldRow}>
                                        <Text style={styles.medicineFieldLabel}>Route</Text>
                                        <Text style={styles.medicineFieldValue}>{medicine?.Route || '-'}</Text>
                                    </View>
                                    {medicine?.Description && (
                                        <View style={{}}>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Description</Text>
                                            <Text style={{ color: '#1a3c40' }}>{medicine?.Description}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const renderAdditionalSections = () => {
        const treatmentPlan = visitRecordData?.TreatmentPlan?.[0];
        const sections: React.ReactNode[] = [];

        // Patient Instructions
        const instructions = treatmentPlan?.Notes?.[0]?.Instructions;
        sections.push(
            <View key="instructions" style={styles.section}>
                <View style={styles.subSectionHeader}>
                    <Text style={styles.subSectionHeaderText}>Patient Instructions</Text>
                </View>
                <View style={styles.sectionContent}>
                    <Text style={styles.notesText}>{instructions || 'NA'}</Text>
                </View>
            </View>
        );

        // New Service
        const addedServices = visitRecordData?.AddedService;
        sections.push(
            <View key="newService" style={styles.section}>
                <View style={styles.subSectionHeader}>
                    <Text style={styles.subSectionHeaderText}>New Service</Text>
                </View>
                <View style={styles.sectionContent}>
                    {addedServices?.map((service: any, index: number) => (
                        <View key={index} style={styles.serviceItem}>
                            <Text style={styles.serviceText}>
                                {service?.TitlePlang || service?.TitleSlang}
                            </Text>
                            <View style={styles.serviceBadge}>
                                <Text style={styles.serviceBadgeText}>{service?.Quantity || 1}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );

        // Referral / Consultation
        const referData = treatmentPlan?.Refer;
        sections.push(
            <View key="referral" style={styles.section}>
                <View style={styles.subSectionHeader}>
                    <Text style={styles.subSectionHeaderText}>Referral / Consultation</Text>
                </View>
                <View style={styles.sectionContent}>
                    <View>
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Specialization</Text>
                            <Text style={styles.fieldValue}>
                                {referData && referData.length > 0 ? referData[0]?.Title?.trim() : 'NA'}
                            </Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Organization</Text>
                            <Text style={styles.fieldValue}>{referData && referData.length > 0 ? referData[0]?.Organization : 'NA'}</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Reason Of Refer</Text>
                            <Text style={styles.fieldValue}>{referData && referData.length > 0 ? referData[0]?.ReferTo : 'NA'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );

        // Notes
        const notes = treatmentPlan?.Notes?.[0]?.Notes;
        sections.push(
            <View key="notes" style={styles.section}>
                <View style={styles.subSectionHeader}>
                    <Text style={styles.subSectionHeaderText}>Notes</Text>
                </View>
                <View style={styles.sectionContent}>
                    <Text style={styles.notesText}>{notes || 'NA'}</Text>
                </View>
            </View>
        );

        return <>{sections}</>;
    };

    const backButtonPress = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{prescriptionData?.CatCategoryId == "42" ? 'Session Record' : 'Visit Record'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <View style={styles.mainContent}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderHospitalSection()}
                        {renderPatientComplaintSection()}
                        {renderPatientHistorySection()}
                        {renderPatientAssessmentSection()}
                        {renderDiagnosisSection()}
                        {renderLabXRaysSection()}
                        {renderTreatmentPlanSection()}
                        {renderAdditionalSections()}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    )
}

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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        backgroundColor: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#23a2a4',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        color: '#fff',
    },
    editIconButton: {
        padding: 4,
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    hospitalContent: {
        padding: 16,
    },
    hospitalLeft: {
        flex: 1,
    },
    hospitalRight: {
        alignItems: 'flex-end',
        marginLeft: 16,
    },
    label: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#666',
        paddingLeft: 8,
    },
    valueBold: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 12,
    },
    hospitalImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
    },
    hospitalImagePlaceholder: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    hospitalName: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        // marginBottom: 8,
    },
    sessionDate: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    fieldRow: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        paddingVertical: 8,
    },
    fieldLabel: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        flex: 1,
    },
    fieldValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#333',
        paddingTop: 4,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    historySubSection: {
        // marginBottom: 16,
    },
    historySubTitle: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        paddingVertical: 6,
    },
    historyLine: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#000',
        marginBottom: 4,
    },
    vitalSignsContainer: {
        // marginBottom: 20,
    },
    vitalSignsHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    vitalSignsHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    vitalSignsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    vitalSignItem: {
        width: '18%',
        alignItems: 'center',
        marginBottom: 12,
    },
    vitalSignLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#666',
        marginBottom: 4,
    },
    vitalSignValue: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    oeContainer: {
        marginTop: 8,
    },
    oeTitle: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        marginBottom: 12,
    },
    oeGroup: {
        marginBottom: 16,
    },
    oeGroupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    oeFieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    oeFieldLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#000',
        flex: 1,
    },
    oeFieldValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
    },
    dxHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
    },
    dxHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        color: '#000',
    },
    diagnosisGroup: {
        marginBottom: 20,
    },
    diagnosisGroupTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        marginBottom: 12,
    },
    diagnosisFieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    diagnosisFieldLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#666',
        flex: 1,
    },
    diagnosisFieldValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#000',
        flex: 1,
        textAlign: 'right',
    },
    labHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
    },
    labHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        color: '#000',
    },
    labFileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    labFileCategory: {
        fontSize: 14,
        color: '#000',
        flex: 1,
    },
    downloadButton: {
        borderWidth: 1.5,
        borderColor: '#14b8a6',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    downloadButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#14b8a6',
    },
    procedureContainer: {
        marginBottom: 20,
    },
    procedureHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    procedureHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    procedureContent: {
        marginBottom: 12,
    },
    prescriptionContainer: {
        marginTop: 16,
    },
    prescriptionHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    prescriptionHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    medicineCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    medicineName: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        marginLeft: 8,
    },
    medicineFields: {
        marginTop: 8,
    },
    medicineFieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    medicineFieldLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#666',
        flex: 1,
    },
    medicineFieldValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        flex: 1,
        textAlign: 'right',
    },
    subSectionHeader: {
        backgroundColor: '#e0f2f1',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
    },
    subSectionHeaderText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    serviceText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#000',
        flex: 1,
    },
    serviceBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceBadgeText: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#fff',
    },
    notesText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#666',
    },
    ratingBottomSheetContainer: {
        flex: 1,
    },
    ratingBottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ratingBottomSheetTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    ratingBottomSheetContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    ratingSection: {
        marginBottom: 12,
        alignItems: 'center',
    },
    ratingStarsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    commentSection: {
        marginBottom: 12,
    },
    commentSectionTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
        marginBottom: 12,
    },
    commentInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 140,
        position: 'relative',
    },
    commentInput: {
        fontSize: 14,
        color: '#000',
        minHeight: 120,
        paddingRight: 40,
        textAlignVertical: 'top',
    },
    micButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmSaveButton: {
        backgroundColor: '#14b8a6',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 10,
    },
    confirmSaveButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#fff',
    },
});

export default PrescriptionView