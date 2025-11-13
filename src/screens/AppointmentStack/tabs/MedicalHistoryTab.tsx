import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appointmentService } from '../../../services/api/appointmentService';
import CurrentRecordsList from './CurrentRecordsList';
import OtherRecordsList from './OtherRecordsList';
import { ROUTES } from '../../../shared/utils/routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { setVisitMainId } from '../../../shared/redux/reducers/generalDataReducer';
import { useDispatch } from 'react-redux';

interface MedicalHistoryTabProps {
    data: any;
}

const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'current' | 'other'>('current');
    const [visitRecordList, setVisitRecordList] = useState<any[]>([]);
    const [currentRecords, setCurrentRecords] = useState<any[]>([]);
    const [otherRecords, setOtherRecords] = useState<any[]>([]);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    useEffect(() => {
        if (data?.PatientUserProfileInfoId) {
            getVisitRecordList();
        }
    }, [data,isFocused]);

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

    const handleVisitRecordPress = (item: any) => {
        dispatch(setVisitMainId(item.Id));
        navigation.navigate(ROUTES.AddSessionRecord, { patientData: data });
    };

    return (
        <View style={styles.container}>
            {/* Patient Info Section */}
            <View style={{ backgroundColor: '#fff', margin: 8, borderRadius: 8 }}>
                <View style={styles.patientInfoSection}>
                    <View >
                        <Text style={styles.patientLabel}>Patient Name</Text>
                        <Text style={styles.patientName}>{data.PatientPlang || 'دادود'}</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person-outline" size={24} color="#666" />
                    </View>
                    {/* Action Buttons */}

                </View>
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Complaint Related{'\n'}Reports</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
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
                    <Text style={[styles.tabPillText, activeTab === 'other' && styles.activeTabPillText]}>
                        Other
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Records List */}
            <View style={styles.recordsListContainer}>
                {activeTab === 'current' ? (
                    <CurrentRecordsList records={currentRecords} onVisitRecordPress={handleVisitRecordPress} />
                ) : (
                    <OtherRecordsList records={otherRecords} />
                )}
            </View>

            {/* Add Session Record Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AddSessionRecord, { patientData: data })} disabled={currentRecords.length > 0} style={[styles.addButton, currentRecords.length > 0 && { backgroundColor: '#ccc' }]}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Session Record</Text>
                </TouchableOpacity>
            </View>
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
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
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
        borderWidth: 1.5,
        borderColor: '#14b8a6',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#14b8a6',
        textAlign: 'center',
        lineHeight: 20,
    },
    recordsHeader: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    recordsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
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
        borderColor: '#14b8a6',
    },
    activeTabPill: {
        backgroundColor: '#14b8a6',
        borderColor: '#14b8a6',
    },
    tabPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#14b8a6',
    },
    activeTabPillText: {
        color: '#fff',
    },
    recordsListContainer: {
        flex: 1,
    },
    addButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#e4f1ef',
    },
    addButton: {
        backgroundColor: '#14b8a6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default MedicalHistoryTab;

