import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';

interface MedicalLicense {
    Id: number;
    UserLoginInfoId: string;
    LicenseNo: string;
    ExpiryDate: string;
    PlaceOfIssue: string;
    SpecialityId: number;
    isActive: boolean;
    FileName: string;
    FilePath: string;
    Specialty: string;
}

const MedicalLicenseScreen = () => {
    const navigation = useNavigation();
    const [licenses, setLicenses] = useState<MedicalLicense[]>([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: any) => state.root.user.user);
    // Mock data - replace with actual API call
    useEffect(() => {
        getServiceProviderMedicalLicense();
    }, []);

    const getServiceProviderMedicalLicense = async () => {
        try {
            setLoading(true);
            const payload = {
                UserloginInfoId: user?.Id,
            };
            const response = await profileService.getServiceProviderMedicalLicense(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setLicenses(response?.ServiceProvidersInfoMedicalLicense);
            }
        }
        catch (error: any) {
            console.log('error',error)
        }
        finally {
            setLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleViewFile = (license: MedicalLicense) => {
        // Handle view file action
        console.log('View file:', license.FilePath);
    };

    const handleDelete = (license: MedicalLicense) => {
        // Handle delete action
        console.log('Delete license:', license.Id);
    };

    const handleAddLicense = () => {
        // Handle add new license
        console.log('Add new license');
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Medical License</Text>
        </View>
    );

    const renderEmptyHeader = () => (
        <View style={styles.emptyHeaderContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={40} color="#00A896" />
            <Text style={styles.emptyHeaderTitle}>Medical License</Text>
            <Text style={styles.emptyHeaderSubtitle}>Please upload your valid license to practice</Text>
        </View>
    );

    const renderLicenseItem = ({ item }: { item: MedicalLicense }) => (
        <View style={styles.licenseCard}>
            <View style={styles.licenseDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>License No</Text>
                    <Text style={styles.detailValue}>{item.LicenseNo}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expiry Date</Text>
                    <Text style={styles.detailValue}>{formatDate(item.ExpiryDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Speciality</Text>
                    <Text style={styles.detailValue}>{item.Specialty}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, styles.statusValid]}>
                        {item.isActive ? 'Valid' : 'Invalid'}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewFile(item)}
                >
                    <Text style={styles.viewButtonText}>View File</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                {renderHeader()}
                <View style={styles.contentContainer}>
                    {renderEmptyHeader()}
                    <FlatList
                        data={licenses}
                        renderItem={renderLicenseItem}
                        keyExtractor={(item) => item.Id.toString()}
                        // ListHeaderComponent={renderEmptyHeader}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}>No licenses found</Text>
                            </View>
                        }
                    />
                    
                   
                </View>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 4 }}>
                    <TouchableOpacity 
                        style={{ backgroundColor: '#00A896', borderRadius: 12, paddingVertical: 10, alignItems: 'center'}}
                        onPress={handleAddLicense}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add License</Text>
                    </TouchableOpacity>
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
    mainContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyHeaderContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    emptyHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
    },
    emptyHeaderSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    licenseCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    licenseHeader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    licenseCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
    },
    licenseCardSubtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    licenseDetails: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '400',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    statusValid: {
        color: '#00A896',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    viewButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00A896',
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#00A896',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF6B6B',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
    },
    addButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#00A896',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MedicalLicenseScreen