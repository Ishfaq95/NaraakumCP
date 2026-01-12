import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Platform, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { appointmentService } from '../../services/api/appointmentService';
import { MediaBaseURL } from '../../shared/utils/constants';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../../shared/utils/routes';
import { setVisitMainId } from '../../shared/redux/reducers/generalDataReducer';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';

const PrescriptionListScreen = ({ route }: { route: any }) => {
    const Patient = route.params?.Patient;
    const User = useSelector((state: any) => state.root.user.user);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [prescriptionList, setPrescriptionList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [searchBottomSheetVisible, setSearchBottomSheetVisible] = useState(false);
    const [bottomSheetHeight, setBottomSheetHeight] = useState('35%');
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [filteredPrescriptionList, setFilteredPrescriptionList] = useState<any[]>([]);

    useEffect(() => {
        if (Platform.OS === 'ios') {

            const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (e) => {
                setBottomSheetHeight('60%');
            });
            const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
                setBottomSheetHeight('35%');
            });

            return () => {
                keyboardDidShow.remove();
                keyboardDidHide.remove();
            };
        }
    }, []);

    useEffect(() => {
        if (Patient?.PatientUserProfileInfoId) {
            getVisitRecordList();
        }
    }, [Patient, isFocused]);

    const getVisitRecordList = async () => {
        const payload = {
            PatientUserProfileInfoId: Patient?.PatientUserProfileInfoId,
        };
        const response = await appointmentService.getVisitRecordList(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setPrescriptionList(response.Data);
            setFilteredPrescriptionList(response.Data);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prescription List</Text>
        </View>
    );

    const backButtonPress = () => {
        navigation.goBack();
    };

    const renderPatientInfoCard = () => {
        if (!Patient) return null;

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

    const handleCloseSearch = () => {
        Keyboard.dismiss();
        if (searchText.length > 0) {
            setSearchText('');
            setFilteredPrescriptionList(prescriptionList);
        }
        setSearchBottomSheetVisible(false);
    };

    const handleSearch = () => {
        // TODO: Implement search functionality
        Keyboard.dismiss();
        setSearchBottomSheetVisible(false);
        if (searchText.length > 0) {
            setFilteredPrescriptionList(prescriptionList.filter((item) => (item.FullnamePlang?.toLowerCase().includes(searchText.toLowerCase()) || item.TitlePlang?.toLowerCase().includes(searchText.toLowerCase()))) || []);
        } else {
            setFilteredPrescriptionList(prescriptionList);
        }
    };

    const renderPrescriptionItem = ({ item }: { item: any }) => {
console.log("item",item)

        const handleDetailsPress = () => {
            // Navigate to prescription details screen
            // You can add navigation logic here
            navigation.navigate(ROUTES.PrescriptionView, { prescriptionData: item });
        };

        const handleEditPress = () => {
            dispatch(setVisitMainId(item.Id));
            navigation.navigate(ROUTES.AddSessionRecord, { patientData: Patient, step: 5 ,OrderDetail: item});
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

                {/* Order ID */}
                <View style={styles.prescriptionRow}>
                    <Text style={styles.prescriptionLabel}>Order ID</Text>
                    <Text style={styles.prescriptionValueRight}>
                        {item?.OrderId || 'N/A'}
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={[styles.detailsButton, item.ServiceProviderId != User?.Id && { width: '100%' }]}
                        onPress={handleDetailsPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.detailsButtonText}>Details</Text>

                    </TouchableOpacity>
                    {item.ServiceProviderId == User?.Id && <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={handleEditPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.detailsButtonText}>Edit</Text>
                    </TouchableOpacity>}
                </View>

                {/* Details Button */}
                {/* <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={handleDetailsPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity> */}
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

                    {filteredPrescriptionList.length > 0 && (
                        <View style={styles.bookingDetailsSection}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
                                <Text style={styles.sectionTitle}>{`${filteredPrescriptionList.length} Prescription`}</Text>
                                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchBottomSheetVisible(true)}>
                                    {searchText.length > 0 ? <Ionicons name="close" size={18} color={'#00A19D'} /> : <Ionicons name="search" size={18} color={'#00A19D'} />}
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={filteredPrescriptionList}
                                renderItem={renderPrescriptionItem}
                                keyExtractor={(item) => item.OrderID}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </ScrollView>
            </View>

            <CustomBottomSheet
                visible={searchBottomSheetVisible}
                onClose={handleCloseSearch}
                showHandle={false}
                maxHeight={bottomSheetHeight}
                backdropClickable={true}
            >
                <View style={styles.searchContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={{ flex: 1, paddingHorizontal: 16 }}
                        contentContainerStyle={{ paddingTop: 16 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Header */}
                        <View style={styles.searchHeader}>
                            <Text style={styles.searchTitle}>Search</Text>
                            <TouchableOpacity onPress={handleCloseSearch} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#404B53" />
                            </TouchableOpacity>
                        </View>

                        {/* Separator */}
                        <View style={styles.searchSeparator} />

                        {/* Search Input Section */}
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.searchLabel}>Search By Client Name</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Client Name"
                                placeholderTextColor="#818181"
                                value={searchText}
                                onChangeText={setSearchText}
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                            />
                        </View>

                        {/* Search Button */}
                        <TouchableOpacity
                            style={styles.searchButtonContainer}
                            onPress={handleSearch}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </CustomBottomSheet>
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
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
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
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        color: '#666',
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
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#333',
        marginBottom: 4,
        textAlign: 'left',
    },
    patientMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientGender: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#666',
        marginRight: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#333',
        marginLeft: 4,
    },
    ratingCount: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: 20,
        color: '#666',
        marginLeft: 4,
    },
    bookingDetailsSection: {
        // marginTop: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#666',
        // marginBottom: 12,
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
        marginBottom: 4,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#000',
    },
    prescriptionValueRight: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
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
        width: '48%',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    detailsButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#00A79D',
    },
    searchButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainer: {
        flex: 1,
    },
    searchScrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    },
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000000',
    },
    closeButton: {
        padding: 4,
    },
    searchSeparator: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    searchInputContainer: {
        marginBottom: 24,
    },
    searchLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#000000',
        marginBottom: 8,
    },
    searchInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#000000',
        backgroundColor: '#FFFFFF',
    },
    searchButtonContainer: {
        backgroundColor: '#00A19D',
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#191919',
    },
})

export default PrescriptionListScreen