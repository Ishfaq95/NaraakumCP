import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import Dropdown from '../../components/common/Dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFetchBlob from 'react-native-blob-util';
import { MediaBaseURL } from '../../shared/utils/constants';

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
    const [isAddLicenseBottomSheetVisible, setIsAddLicenseBottomSheetVisible] = useState(false);
    const [nationalities, setNationalities] = useState<any[]>([]);
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Form state
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [uploadedFileData, setUploadedFileData] = useState<any>(null);
    const [licenseNo, setLicenseNo] = useState('');
    const [placeOfIssue, setPlaceOfIssue] = useState<string | number>('');
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [speciality, setSpeciality] = useState<string | number>('');
    const [editingLicenseId, setEditingLicenseId] = useState<number | null>(null);

    // Validation error states
    const [fileError, setFileError] = useState(false);
    const [licenseNoError, setLicenseNoError] = useState(false);
    const [placeOfIssueError, setPlaceOfIssueError] = useState(false);
    const [specialityError, setSpecialityError] = useState(false);
    // Mock data - replace with actual API call
    useEffect(() => {
        getServiceProviderMedicalLicense();
    }, []);

    const getNationalities = async () => {
        try {
            const response = await profileService.getNationalities();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setNationalities(response.Data.map((item: any) => ({ label: item.TitlePlang, value: item.Id })));
            }
        }
        catch (error: any) {
            console.log('error', error)
        }
    }

    const getSpecialties = async () => {
        try {
            const response = await profileService.getSpecialties();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setSpecialties(response.list.map((item: any) => ({ label: item.TitlePlang, value: item.Id })));
            }
        }
        catch (error: any) {
            console.log('error', error)
        }
    }

    useEffect(() => {
        getNationalities();
        getSpecialties();
    }, [])

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
            console.log('error', error)
        }
        finally {
            setLoading(false);
        }
    }

    const formatDateString = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getFileNameFromUrl = (url: string) => {
        const parts = url.split('/');
        return parts.pop() || 'document';
    }

    const handleViewFile = (license: MedicalLicense) => {
        const fileName = getFileNameFromUrl(license.FilePath);
        const completeUrl = `${MediaBaseURL}${license.FilePath}`;
        if(Platform.OS === 'ios'){
            downloadFIleForIOS(completeUrl, fileName);
        }else{
            downloadFile(completeUrl, fileName);
        }
        
    };

    const downloadFIleForIOS = async (url: string, fileName: string) => {
        const {config, fs} = RNFetchBlob;
        const DocumentDir = fs.dirs.DocumentDir;
        const filePath = `${DocumentDir}/${fileName}`;
    
        try {
            const res = await config({
                fileCache: true,
                path: filePath,
            }).fetch('GET', url);
            
            Alert.alert(
                'File downloaded successfully',
                'The file is saved to your device.',
            );
            RNFetchBlob.ios.previewDocument(filePath);
        } catch (error) {
            Alert.alert('File downloading error.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    const downloadFile = async (url: string, fileName: string) => {
        const {config, fs} = RNFetchBlob;
        const DownloadDir = fs.dirs.DownloadDir;
        const filePath = `${DownloadDir}/${fileName}`;
    
        try {
            const res = await config({
                fileCache: true,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    mediaScannable: true,
                    title: fileName,
                    path: filePath,
                },
            }).fetch('GET', url);
            
            Alert.alert('File downloaded successfully');
        } catch (error) {
            Alert.alert('File downloading error.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async (license: MedicalLicense) => {
        // Handle delete action
        console.log('Delete license:', license.Id);
        const payload = {
            MedicalLicenseId: license.Id,
        };
        const response = await profileService.deleteServiceProviderMedicalLicense(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            getServiceProviderMedicalLicense();
        }
    };

    const handleAddLicense = () => {
        resetForm();
        setIsAddLicenseBottomSheetVisible(true);
    };

    const resetForm = () => {
        setSelectedFile(null);
        setUploadedFileData(null);
        setLicenseNo('');
        setPlaceOfIssue('');
        setExpiryDate(new Date());
        setSpeciality('');
        setEditingLicenseId(null);
        // Reset errors
        setFileError(false);
        setLicenseNoError(false);
        setPlaceOfIssueError(false);
        setSpecialityError(false);
    };

    const handlePickDocument = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 1,
            });

            if (result.didCancel) {
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.fileName || 'document';
                const fileType = file.type || 'application/octet-stream';

                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
                const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

                if (!allowedExtensions.includes(fileExtension)) {
                    Alert.alert('Error', 'Please upload a valid file (.pdf, .doc, .docx, .jpg, .png)');
                    return;
                }

                setSelectedFile({
                    uri: file.uri,
                    type: fileType,
                    name: fileName,
                });
                setFileError(false);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadedFileData(null);
    };

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setExpiryDate(selectedDate);
        }
    };

    const handleSaveLicense = async () => {
        // Reset all errors first
        setFileError(false);
        setLicenseNoError(false);
        setPlaceOfIssueError(false);
        setSpecialityError(false);

        let hasError = false;

        // Validate file
        if (!selectedFile && !uploadedFileData) {
            setFileError(true);
            hasError = true;
        }

        // Validate license number
        if (!licenseNo.trim()) {
            setLicenseNoError(true);
            hasError = true;
        }

        // Validate place of issue
        if (!placeOfIssue || placeOfIssue === '') {
            setPlaceOfIssueError(true);
            hasError = true;
        }

        // Validate speciality
        if (!speciality || speciality === '') {
            setSpecialityError(true);
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            setIsSaving(true);

            if (selectedFile) {
                const uploadResponse = await profileService.uploadFile(selectedFile, user);
                
                if (uploadResponse.ResponseStatus.STATUSCODE == 200) {
                    // Prepare payload for API
                    const payload = {
                        UserloginInfoId: user.Id,
                        LicenseNo: licenseNo,
                        ExpiryDate: expiryDate.toISOString().split('T')[0],
                        PlaceOfIssue: placeOfIssue.toString(),
                        SpecialityId: speciality,
                        ImageName: "mylicense",
                        ImagePath: uploadResponse?.Data?.Path,
                    };

                    const response = await profileService.addUpdateServiceProviderMedicalLicense(payload);
                    if (response.ResponseStatus.STATUSCODE === 200) {
                        getServiceProviderMedicalLicense();
                        resetForm();
                        setIsAddLicenseBottomSheetVisible(false);
                    } else {
                    }
                }
            }


        } catch (error: any) {
            console.error('Error saving license:', error);
            Alert.alert('Error', error.message || 'Failed to save license');
        } finally {
            setIsSaving(false);
        }
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
                    <Text style={styles.detailValue}>{formatDateString(item.ExpiryDate)}</Text>
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
                        style={{ backgroundColor: '#00A896', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
                        onPress={handleAddLicense}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add License</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <CustomBottomSheet
                visible={isAddLicenseBottomSheetVisible}
                onClose={() => {
                    resetForm();
                    setIsAddLicenseBottomSheetVisible(false);
                }}
                showHandle={false}
                maxHeight="60%"
                backdropClickable={true}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={bottomSheetStyles.container}>
                        {/* Header */}
                        <View style={bottomSheetStyles.header}>
                            <Text style={bottomSheetStyles.headerTitle}>License Information</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    resetForm();
                                    setIsAddLicenseBottomSheetVisible(false);
                                }}
                                style={bottomSheetStyles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Content */}
                        <ScrollView
                            style={bottomSheetStyles.scrollView}
                            contentContainerStyle={bottomSheetStyles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* File Upload Section */}
                            <TouchableOpacity
                                style={[
                                    bottomSheetStyles.uploadContainer,
                                    fileError && bottomSheetStyles.uploadContainerError
                                ]}
                                onPress={handlePickDocument}
                            >
                                <MaterialIcons name="cloud-upload" size={40} color="#00A896" />
                                <Text style={bottomSheetStyles.uploadTitle}>Upload your Medical License</Text>
                                <Text style={bottomSheetStyles.uploadSubtitle}>.pdf,.doc,.docx,.jpg,.png</Text>
                            </TouchableOpacity>

                            {/* Selected File Display */}
                            {selectedFile && (
                                <View style={bottomSheetStyles.fileDisplayContainer}>
                                    <MaterialIcons name="insert-drive-file" size={20} color="#666" />
                                    <Text style={bottomSheetStyles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                    <TouchableOpacity onPress={handleRemoveFile} style={bottomSheetStyles.removeFileButton}>
                                        <MaterialIcons name="close" size={20} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* License No Input */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>License No</Text>
                                <TextInput
                                    style={[
                                        bottomSheetStyles.input,
                                        licenseNoError && bottomSheetStyles.inputError
                                    ]}
                                    placeholder="Enter License No"
                                    placeholderTextColor="#999"
                                    value={licenseNo}
                                    onChangeText={(text) => {
                                        setLicenseNo(text);
                                        if (licenseNoError && text.trim()) {
                                            setLicenseNoError(false);
                                        }
                                    }}
                                />
                            </View>

                            {/* Place Of Issue Dropdown */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>Place Of Issue</Text>
                                <Dropdown
                                    data={nationalities}
                                    value={placeOfIssue}
                                    onChange={(value) => {
                                        setPlaceOfIssue(value);
                                        if (placeOfIssueError) {
                                            setPlaceOfIssueError(false);
                                        }
                                    }}
                                    placeholder="-- Select Place of Issue"
                                    error={placeOfIssueError}
                                />
                            </View>

                            {/* Expiry Date Input */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>Expiry Date</Text>
                                <TouchableOpacity
                                    style={bottomSheetStyles.dateInputContainer}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={bottomSheetStyles.dateText}>
                                        {formatDate(expiryDate)}
                                    </Text>
                                    <MaterialIcons name="calendar-today" size={20} color="#666" />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={expiryDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>

                            {/* Speciality Dropdown */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>Speciality</Text>
                                <Dropdown
                                    data={specialties}
                                    value={speciality}
                                    onChange={(value) => {
                                        setSpeciality(value);
                                        if (specialityError) {
                                            setSpecialityError(false);
                                        }
                                    }}
                                    placeholder="Select Speciality"
                                    error={specialityError}
                                />
                            </View>
                        </ScrollView>

                        {/* Save Button */}
                        <View style={bottomSheetStyles.footer}>
                            <TouchableOpacity
                                style={[bottomSheetStyles.saveButton, isSaving && { opacity: 0.6 }]}
                                onPress={handleSaveLicense}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={bottomSheetStyles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </CustomBottomSheet>
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
    backButton: {
        padding: 8,
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

const bottomSheetStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    uploadContainer: {
        borderWidth: 2,
        borderColor: '#B8E6E1',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#E8F7F5',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadContainerError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginTop: 12,
    },
    uploadSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    fileDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    fileName: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    removeFileButton: {
        padding: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#000',
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dateText: {
        fontSize: 15,
        color: '#000',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#00A896',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default MedicalLicenseScreen