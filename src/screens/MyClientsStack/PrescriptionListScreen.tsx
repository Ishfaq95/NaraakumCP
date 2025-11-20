import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalTextStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { appointmentService } from '../../services/api/appointmentService';
import { MediaBaseURL } from '../../shared/utils/constants';
import moment from 'moment';

const PrescriptionListScreen = ({route}: {route: any}) => {
    const Patient = route.params?.Patient;
    console.log('Patient',Patient);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [prescriptionList, setPrescriptionList] = useState<any[]>([]);
    useEffect(() => {
        if (Patient?.PatientUserProfileInfoId) {
            getVisitRecordList();
        }
    }, [Patient,isFocused]);

    const getVisitRecordList = async () => {
        const payload = {
            PatientUserProfileInfoId: Patient?.PatientUserProfileInfoId,
        };
        const response = await appointmentService.getVisitRecordList(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setPrescriptionList(response.Data);
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

    const renderPatientInfoCard = () => {
        if (!Patient) return null;

        console.log('patientInfo', Patient);

        const imageUrl = Patient.ImagePath 
            ? `${MediaBaseURL}${Patient.ImagePath}` 
            : null;

        return (
            <View style={styles.patientCard}>
                <View style={styles.patientHeader}>
                    <Text style={styles.patientHeaderTitle}>Patient Information</Text>
                </View>
                <View style={styles.patientContent}>
                    {imageUrl ? (
                        <Image 
                            source={{ uri: imageUrl }}
                            style={styles.patientAvatar}
                        />
                    ) : (
                        <View style={[styles.patientAvatar, styles.patientAvatarPlaceholder]}>
                            <Ionicons name="person" size={32} color="#999" />
                        </View>
                    )}
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{Patient.FullnamePlang?.trim()}</Text>
                        <View style={styles.patientMeta}>
                            <Text style={styles.patientGender}>
                                {Patient.Gender ? 'Male' : 'Female'}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#FFA500" />
                                <Text style={styles.ratingText}>
                                    {Patient.AccumulativeRatingAvg?.toFixed(2)}
                                </Text>
                                <Text style={styles.ratingCount}>
                                    ({Patient.AccumulativeRatingNum} Person)
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderPrescriptionItem = ({ item }: { item: any }) => {
        

        const handleDetailsPress = () => {
            // Navigate to prescription details screen
            // You can add navigation logic here
            console.log('Details pressed for:', item);
        };

        return (
            <View style={styles.prescriptionItem}>
                {/* Prescribed By */}
                <View style={styles.prescriptionField}>
                    <Text style={styles.prescriptionLabelVertical}>Prescribed by</Text>
                    <Text style={styles.prescriptionValueLeft}>
                        {item.FullnamePlang?.trim() || 'N/A'}
                    </Text>
                </View>

                {/* Hospital */}
                <View style={styles.prescriptionRow}>
                    <Text style={styles.prescriptionLabel}>Hospital</Text>
                    <Text style={styles.prescriptionValueRight}>
                        {item.TitlePlang?.trim() || 'N/A'}
                    </Text>
                </View>

                {/* Date */}
                <View style={styles.prescriptionRow}>
                    <Text style={styles.prescriptionLabel}>Date</Text>
                    <Text style={styles.prescriptionValueRight}>
                        {item?.VisitDate ? moment.utc(item?.VisitDate).local().format('DD/MM/YYYY') : 'N/A'}
                    </Text>
                </View>

                {/* Separator */}
                <View style={styles.separator} />

                {/* Details Button */}
                <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={handleDetailsPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {renderPatientInfoCard()}
                    
                    {prescriptionList.length > 0 && (
                        <View style={styles.bookingDetailsSection}>
                            <Text style={styles.sectionTitle}>{`${prescriptionList.length} Prescription`}</Text>
                            <FlatList
                                data={prescriptionList}
                                renderItem={renderPrescriptionItem}
                                keyExtractor={(item) => item.OrderID}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f4f3',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#e8f4f3',
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    // Patient Information Card
    patientCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    patientHeader: {
        backgroundColor: '#E8F4F3',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    patientHeaderTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    patientContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    patientAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
    },
    patientAvatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    patientInfo: {
        marginLeft: 16,
        flex: 1,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        textAlign: 'left',
    },
    patientMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientGender: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    ratingCount: {
        fontSize: 13,
        color: '#666',
        marginLeft: 4,
    },
    bookingDetailsSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    // Prescription Item Card
    prescriptionItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    prescriptionField: {
        marginBottom: 12,
    },
    prescriptionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    prescriptionLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#999',
    },
    prescriptionLabelVertical: {
        fontSize: 14,
        fontWeight: '400',
        color: '#999',
        marginBottom: 4,
    },
    prescriptionValueLeft: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    prescriptionValueRight: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        textAlign: 'right',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    detailsButton: {
        borderWidth: 1,
        borderColor: '#00A79D',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    detailsButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#00A79D',
    },
})

export default PrescriptionListScreen