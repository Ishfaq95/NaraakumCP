import { useNavigation } from '@react-navigation/native';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { appointmentService } from '../../services/api/appointmentService';
import TaskDetailTab from './tabs/TaskDetailTab';
import MedicalHistoryTab from './tabs/MedicalHistoryTab';
import PatientRatingTab from './tabs/PatientRatingTab';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const VisitDetailScreen = ({ route }: any) => {
    const { taskId } = route.params;
    const navigation = useNavigation();
    const [taskDetail, setTaskDetail] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'taskDetail' | 'medicalHistory' | 'patientRating'>('taskDetail');

    useEffect(() => {
        if (taskId) {
            getTaskDetail();
        }
    }, [taskId]);

    const getTaskDetail = async () => {
        const payload = {
            TaskId: taskId,
        };
        const response = await appointmentService.getTaskDetail(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setTaskDetail(response.TaskDetail[0]);
        }
    }

    const callPatient = () => {
        Linking.openURL(`tel:${taskDetail.CellNumber}`);
      }

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{taskDetail?.LoginUserFullnamePlang || 'Visit Details'}</Text>
            </View>
            <View style={{}}>
                <TouchableOpacity onPress={() => callPatient()} style={{ backgroundColor: '#2ab318', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15,  alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome6 name="phone-volume" size={12} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'taskDetail' && styles.activeTab]}
                onPress={() => setActiveTab('taskDetail')}
            >
                <Text style={[styles.tabText, activeTab === 'taskDetail' && styles.activeTabText]}>
                    Task Details
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'medicalHistory' && styles.activeTab]}
                onPress={() => setActiveTab('medicalHistory')}
            >
                <Text style={[styles.tabText, activeTab === 'medicalHistory' && styles.activeTabText]}>
                    Medical History
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'patientRating' && styles.activeTab]}
                onPress={() => setActiveTab('patientRating')}
            >
                <Text style={[styles.tabText, activeTab === 'patientRating' && styles.activeTabText]}>
                    Patient Rating
                </Text>
            </TouchableOpacity>
        </View>
    );

    const RefreshData = () => {
        getTaskDetail();
    }

    const renderTabContent = () => {
        if (!taskDetail) {
            return (
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'taskDetail':
                return <TaskDetailTab data={taskDetail} RefreshData={RefreshData} />;
            case 'medicalHistory':
                return <MedicalHistoryTab data={taskDetail} />;
            case 'patientRating':
                return <PatientRatingTab data={taskDetail} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                {renderTabs()}
                <View style={{ flex: 1 }}>
                    {renderTabContent()}
                </View>
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
        justifyContent: 'space-between',
        height: 56,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        // padding: 5,
        // marginRight: 12,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
        paddingLeft: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#239EA0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
    },
    tabText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#ffffffa8',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default VisitDetailScreen;
