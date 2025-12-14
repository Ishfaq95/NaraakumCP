import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, FlatList, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { appointmentService } from '../../../services/api/appointmentService';
import CurrentRecordsList from './CurrentRecordsList';
import OtherRecordsList from './OtherRecordsList';
import ComplaintReportCard from './ComplaintReportCard';
import { ROUTES } from '../../../shared/utils/routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { setVisitMainId } from '../../../shared/redux/reducers/generalDataReducer';
import { useDispatch } from 'react-redux';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';

interface MedicalHistoryTabProps {
    data: any;
}

const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'current' | 'other'>('current');
    const [visitRecordList, setVisitRecordList] = useState<any[]>([]);
    const [currentRecords, setCurrentRecords] = useState<any[]>([]);
    const [otherRecords, setOtherRecords] = useState<any[]>([]);
    const [patientMedicalHistoryReports, setPatientMedicalHistoryReports] = useState<any[]>([]);
    const [patientMedicalHistory, setPatientMedicalHistory] = useState<any[]>([]);
    const [isPatientMedicalHistoryReportsBottomSheetVisible, setIsPatientMedicalHistoryReportsBottomSheetVisible] = useState(false);
    const [isPatientComplaintBottomSheetVisible, setIsPatientComplaintBottomSheetVisible] = useState(false);
    const [reportsBottomSheetHeight, setReportsBottomSheetHeight] = useState<string>('35%');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    useEffect(() => {
        if (data?.PatientUserProfileInfoId) {
            getVisitRecordList();
            getPatientMedicalHistoryReports();
            getPatientMedicalHistory();
        }
    }, [data, isFocused]);

    const getPatientMedicalHistoryReports = async () => {
        const payload = {
            PatientId: data?.PatientUserProfileInfoId,
            OrderId: data?.OrderID,
        };
        const response = await appointmentService.getPatientMedicalHistoryReports(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setPatientMedicalHistoryReports(response.PatientFiles);
        }
    };

    const getPatientMedicalHistory = async () => {
        const payload = {
            PatientId: data?.PatientUserProfileInfoId,
            OrderId: data?.OrderID,
        };
        const response = await appointmentService.getPatientMedicalHistory(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setPatientMedicalHistory(response.Patient);
        }
    };

    const getVisitRecordList = async () => {
        const payload = {
            PatientUserProfileInfoId: data?.PatientUserProfileInfoId,
        };
        const response = await appointmentService.getVisitRecordList(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setVisitRecordList(response.Data);
        }
    };

    useEffect(() => {
        if (visitRecordList?.length > 0) {
            setCurrentRecords(visitRecordList.filter((item: any) => item.TaskMainId == data?.Detail[0]?.TaskMainId));
            setOtherRecords(visitRecordList.filter((item: any) => item.TaskMainId != data?.Detail[0]?.TaskMainId));
        }
    }, [visitRecordList]);

    // Dynamically control reports bottom sheet height based on item count
    useEffect(() => {
        const count = patientMedicalHistoryReports.length;
        if (count === 0) {
            setReportsBottomSheetHeight('20%');
        } else if (count === 1) {
            setReportsBottomSheetHeight('32%');
        } else if (count === 2) {
            setReportsBottomSheetHeight('55%');
        } else if (count === 3) {
            setReportsBottomSheetHeight('70%');
        } else {
            setReportsBottomSheetHeight('85%');
        }
    }, [patientMedicalHistoryReports]);

    const handleVisitRecordPress = (item: any) => {
        dispatch(setVisitMainId(item.Id));
        navigation.navigate(ROUTES.AddSessionRecord, { patientData: data, step: 5 });
    };

    const handleOtherVisitRecordPress = (item: any) => {
        navigation.navigate(ROUTES.PrescriptionView, { prescriptionData: item });
    };

    return (
        <View style={styles.container}>
            {/* Patient Info Section */}
            <View style={{ backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 15, borderRadius: 8 }}>
                <View style={styles.patientInfoSection}>
                    <View >
                        <Text style={styles.patientLabel}>Patient Name</Text>
                        <Text style={styles.patientName}>{data.PatientPlang || ''}</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person-outline" size={24} color="#666" />
                    </View>
                    {/* Action Buttons */}

                </View>
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsPatientMedicalHistoryReportsBottomSheetVisible(true)}>
                        <Text style={styles.actionButtonText}>Complaint Related{'\n'}Reports</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsPatientComplaintBottomSheetVisible(true)}>
                        <Text style={styles.actionButtonText}>Patient Complaint</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Visit/Session Records Header */}
            <View style={styles.recordsHeader}>
                <Text style={styles.recordsTitle}>
                    Visit / Session Records ({activeTab === 'current' ? currentRecords.length : otherRecords.length})
                </Text>
            </View>

            <View style={{ height: 1, backgroundColor: '#00000033', marginHorizontal: 12, marginBottom: 12, }} />

            {/* Tab Pills */}
            <View style={styles.tabPillsContainer}>
                <TouchableOpacity
                    style={[styles.tabPill, activeTab === 'current' && styles.activeTabPill]}
                    onPress={() => setActiveTab('current')}
                >
                    <Text style={[styles.tabPillText, activeTab === 'current' && styles.activeTabPillText]}>
                        Current
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabPill, activeTab === 'other' && styles.activeTabPill]}
                    onPress={() => setActiveTab('other')}
                >
                    <Text style={[styles.tabPillText, { color: '#000' }, activeTab === 'other' && styles.activeTabPillText]}>
                        Other
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Records List */}
            <View style={styles.recordsListContainer}>
                {activeTab === 'current' ? (
                    <CurrentRecordsList records={currentRecords} onVisitRecordPress={handleVisitRecordPress} />
                ) : (
                    <OtherRecordsList records={otherRecords} onVisitRecordPress={handleOtherVisitRecordPress} />
                )}
            </View>

            {/* Add Session Record Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AddSessionRecord, { patientData: data })} disabled={currentRecords.length > 0} style={[styles.addButton, currentRecords.length > 0 && { backgroundColor: '#ccc' }]}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Session Record</Text>
                </TouchableOpacity>
            </View>


            {/* Patient Medical History Reports */}
            <CustomBottomSheet
                visible={isPatientMedicalHistoryReportsBottomSheetVisible}
                onClose={() => setIsPatientMedicalHistoryReportsBottomSheetVisible(false)}
                maxHeight={reportsBottomSheetHeight}
                showHandle={false}
                backdropClickable={true}
            >
                <View style={styles.reportsBottomSheetContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, width: '100%', height: 50, backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} >
                        <Text style={styles.reportsBottomSheetTitle}>Complaint related Reports</Text>
                        <TouchableOpacity onPress={() => setIsPatientMedicalHistoryReportsBottomSheetVisible(false)}>
                            <Ionicons name="close-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1,marginTop: 12 }}>
                    <FlatList
                        data={patientMedicalHistoryReports}
                        keyExtractor={(item) => `${item.Id}`}
                        contentContainerStyle={styles.reportsListContent}
                        renderItem={({ item }) => {
                            const fileName = item.FileName || 'اسم الملف';
                            // Fallback to a generic label if API doesn't provide a file type field
                            const fileType =
                                item.FileTypePlang ||
                                item.CategoryPlang ||
                                'Lab Reports';

                            return (
                                <ComplaintReportCard
                                    item={item}
                                    fileName={fileName}
                                    fileType={fileType}
                                />
                            );
                        }}
                        ListEmptyComponent={<View style={styles.reportsListEmptyComponent}>
                            <Text style={styles.reportsListEmptyComponentText}>No reports found</Text>
                        </View>}
                    />
                    </View>
                </View>
            </CustomBottomSheet>

             {/* Patient Complaint Details */}
            <CustomBottomSheet
                visible={isPatientComplaintBottomSheetVisible}
                onClose={() => setIsPatientComplaintBottomSheetVisible(false)}
                maxHeight={ patientMedicalHistory?.length > 0 ? '70%' : '60%'}
                showHandle={false}
                backdropClickable={true}
            >
                <View style={styles.complainBottomSheetContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, width: '100%', height: 50, backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} >
                        <Text style={styles.reportsBottomSheetTitle}>Patient complaint</Text>
                        <TouchableOpacity onPress={() => setIsPatientComplaintBottomSheetVisible(false)}>
                            <Ionicons name="close-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                     <ScrollView
                         style={{ flex: 1 }}
                         contentContainerStyle={styles.patientComplaintContent}
                         showsVerticalScrollIndicator={false}
                     >
                         {(() => {
                             const complaint = patientMedicalHistory?.[0];

                             const yesNo = (value: any) => {
                                 if (value === null || value === undefined) return '';
                                 return value === true || value === 1 ? 'Yes' : 'No';
                             };

                             return (
                                 <>
                                     {/* Chief Complaint */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>Chief Complaint ?</Text>
                                         {complaint && !!complaint.MedicalComplaint && (
                                             <Text style={styles.complaintAnswer}>
                                                 {complaint.MedicalComplaint}
                                             </Text>
                                         )}
                                     </View>
                                     <View style={styles.complaintDivider} />

                                     {/* How long have you been the complaining? */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>How long have you been the complaining?</Text>
                                         {complaint && !!complaint.MedicalComplaintSufferingLast && (
                                             <Text style={styles.complaintAnswer}>
                                                 {complaint.MedicalComplaintSufferingLast}
                                             </Text>
                                         )}
                                     </View>
                                     <View style={styles.complaintDivider} />

                                     {/* Is it frequent? */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>Is it frequent?</Text>
                                         {complaint && (
                                             <Text style={styles.complaintAnswer}>
                                                 {yesNo(complaint.isRepetitive)}
                                             </Text>
                                         )}
                                     </View>
                                     <View style={styles.complaintDivider} />

                                     {/* Do you smoke ? */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>Do you smoke ?</Text>
                                         {complaint && (
                                             <Text style={styles.complaintAnswer}>
                                                 {yesNo(complaint.isSmoke)}
                                             </Text>
                                         )}
                                     </View>
                                     <View style={styles.complaintDivider} />

                                     {/* Do you have allergies? */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>Do you have allergies?</Text>
                                         {complaint && !!complaint.Allergies && (
                                             <Text style={styles.complaintAnswer}>
                                                 {complaint.Allergies}
                                             </Text>
                                         )}
                                     </View>
                                     <View style={styles.complaintDivider} />

                                     {/* Family History */}
                                     <View style={styles.complaintItem}>
                                         <Text style={styles.complaintQuestion}>Family History</Text>
                                         {complaint && !!complaint.FamilyMedicalHistory && (
                                             <Text style={styles.complaintAnswer}>
                                                 {complaint.FamilyMedicalHistory}
                                             </Text>
                                         )}
                                     </View>
                                 </>
                             );
                         })()}
                     </ScrollView>
                </View>
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4f1ef',
    },
    patientInfoSection: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
    },
    patientLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
    },
    patientName: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        textAlign: 'left',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        // backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#ddd',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#23a2a4',
        textAlign: 'center',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    recordsHeader: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    recordsTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#000',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    tabPillsContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabPill: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#23a2a4',
    },
    activeTabPill: {
        backgroundColor: '#23a2a4',
        borderColor: '#23a2a4',
    },
    tabPillText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#23a2a4',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    activeTabPillText: {
        color: '#fff',
    },
    recordsListContainer: {
        flex: 1,
    },
    addButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#e4f1ef',
    },
    addButton: {
        backgroundColor: '#23a2a4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    // Patient medical history reports styles
    reportsBottomSheetContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    complainBottomSheetContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    reportsBottomSheetTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    reportsListContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    reportCard: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    reportHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reportLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        marginBottom: 2,
    },
    reportFileName: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#111827',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textAlign: 'left',
    },
    reportMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reportMetaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportMetaLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        marginLeft: 6,
    },
    reportMetaValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#111827',
    },
    reportDownloadButton: {
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportDownloadButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#23a2a4',
    },
    reportsListEmptyComponent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    reportsListEmptyComponentText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#6B7280',
    },
    // Patient complaint Q&A styles
    patientComplaintContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
    },
    complaintItem: {
        paddingVertical: 10,
    },
    complaintQuestion: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#111827',
        marginBottom: 4,
    },
    complaintAnswer: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#000000',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textAlign: 'left',
    },
    complaintDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 10,
    },
});

export default MedicalHistoryTab;

