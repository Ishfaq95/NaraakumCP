import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Platform, FlatList, Image, ScrollView } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import { addVisitRecordService } from '../../../services/api/addVisitRecord';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';
import { convert24HourToEnglishTime } from '../../../shared/utils/bookService';

const OrderDetails = ({ route }: { route: any }) => {
    const { item, visitmainId } = route.params;
    console.log("item===>", item)
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [showGroupedArray, setShowGroupedArray] = useState<any>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedDoctor: any = showGroupedArray[selectedIndex];
    const [openGoogleMapBottomSheet, setOpenGoogleMapBottomSheet] = useState(false);
    useEffect(() => {
        if (item) {
            getOrderDetail();
        }
    }, [item]);

    console.log("visitmainId", visitmainId)

    const getOrderDetail = async () => {
        const payload = {
            OrderId: item.OrderID,
            UserLoginInfoId: user.Id
        };
        const response = await addVisitRecordService.getOrderDetailAddedByServiceProvider(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            console.log("response===>", response)
            setOrderDetail(response.UserOrders);
            setShowGroupedArray([]);
            const getFilteredTaskOrders = response?.UserOrders[0]?.OrderDetail?.filter((order: any) => order.OrderAginstVisitmainID == visitmainId);
            const groupedArray = groupArrayByUniqueIdAsArray(getFilteredTaskOrders);
            setShowGroupedArray(groupedArray);
        }
    }

    const groupArrayByUniqueIdAsArray = (dataArray: any) => {
        if (!Array.isArray(dataArray)) {
            return [];
        }

        const groupedObject: any = {};

        dataArray.forEach((obj) => {
            const uniqueId = `${obj.ServiceProviderUserloginInfoId}_${obj.OrganizationId}_${obj.PatientUserProfileInfoId}_${obj.CatCategoryId}`;

            if (!groupedObject[uniqueId]) {
                groupedObject[uniqueId] = [];
            }

            groupedObject[uniqueId].push(obj);
        });

        // Convert to array format with uniqueId as property
        return Object.keys(groupedObject).map(uniqueId => ({
            uniqueId: uniqueId,
            items: groupedObject[uniqueId]
        }));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
            </View>
        </View>
    );

    const backButtonPress = () => {
        navigation.goBack();
    }

    const getSessionDuration = (slotDuration: number) => {
        if (slotDuration < 60) {
            return `${slotDuration} Minutes`;
        } else {
            return `${Math.floor(slotDuration / 60)} Hours ${Math.floor(slotDuration % 60)} Minutes`;
        }
    }

    const renderDoctorTag = useCallback(({ item, index }: { item: any; index: number }) => {
        const selectedItem = item.items[0];

        const name = selectedItem.ServiceProviderTitlePlang ? selectedItem.ServiceProviderTitlePlang : selectedItem.OrganizationPlang;

        let imagePath: any = selectedItem?.ServiceProviderImagePath ? `${MediaBaseURL}${selectedItem?.ServiceProviderImagePath}` : `${MediaBaseURL}${selectedItem?.imagePath}`;

        return (
            <View style={styles.doctorTagContainer}>
                <TouchableOpacity
                    style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
                    onPress={() => setSelectedIndex(index)}
                    activeOpacity={0.8}
                >
                    {imagePath ? <Image source={{ uri: imagePath }} style={styles.doctorImage} /> : <View style={{ ...styles.doctorImage, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e4f1ef' }}><Ionicons name="person-sharp" size={28} color="#23a2a4" /></View>}
                    <View style={styles.doctorInfoCol}>
                        <Text style={[styles.doctorName, selectedIndex === index && { color: '#fff' }]}>Care provider</Text>
                        <Text style={[styles.serviceName, selectedIndex === index && { color: '#fff' }]}>{name}</Text>
                    </View>
                </TouchableOpacity>
                {selectedIndex === index && <View style={[styles.arrowIndicatorSimple]}>
                    <Text style={styles.arrowText}>▼</Text>
                </View>}
            </View>
        )
    }, [selectedIndex])

    return (
        <SafeAreaView style={styles.container}>

            {renderHeader()}
            <View style={styles.content}>
                <View style={{ height: 110, width: "100%", borderRadius: 10, marginBottom: 10, alignItems: "flex-start", backgroundColor: "#e4f1ef" }}>
                    <FlatList
                        data={showGroupedArray}
                        renderItem={renderDoctorTag}
                        keyExtractor={(item, index) => `doctor-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tagsContainer}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
                {selectedDoctor?.uniqueId && <ScrollView style={{ flex: 1 }}>
                    {
                        [...new Set(selectedDoctor?.items?.map((item: any) => item.ItemUniqueId))].map((itemUniqueId: any, index: number) => {
                            const filteredItems = selectedDoctor?.items?.filter((item: any) => item.ItemUniqueId == itemUniqueId);
                            const item = filteredItems[0];
                            let displayDate = '';
                            let displayTime = '';

                            if (item.SchedulingDate && item.SchedulingTime) {
                                // Combine date & time as UTC, then convert to local before formatting
                                const combinedUtc = moment
                                    .utc(`${item.SchedulingDate} ${item.SchedulingTime}`, 'YYYY-MM-DD HH:mm');
                                const localDateTime = combinedUtc.local();

                                displayDate = localDateTime.format('DD/MM/YYYY');
                                displayTime = localDateTime.format('hh:mm A'); // 12-hour with AM/PM
                            }

                            return (
                                <View style={styles.detailsCard}>
                                    <View style={styles.detailsHeader}>
                                        <Text style={styles.detailsHeaderText}>Order Details</Text>
                                    </View>

                                    <View style={styles.sessionInfoDetailItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={styles.sessionInfoLabel}>Added by</Text>
                                        </View>
                                        <Text style={styles.sessionInfoValue}>{item.AddedByFullnamePlang}</Text>
                                    </View>

                                    <View style={styles.sessionInfoDetailItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={styles.sessionInfoLabel}>Order date</Text>
                                        </View>
                                        <Text style={styles.sessionInfoValue}>{orderDetail[0]?.OrderDate ? moment(orderDetail[0]?.OrderDate).locale('en').format('DD/MM/YYYY') : 'NA'}</Text>
                                    </View>

                                    <View style={styles.sessionInfoDetailItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={styles.sessionInfoLabel}>Order No.</Text>
                                        </View>
                                        <Text style={styles.sessionInfoValue}>{item.OrderId}</Text>
                                    </View>

                                    <View style={styles.detailsHeader}>
                                        <Text style={styles.detailsHeaderText}>Selected Services ({filteredItems.length})</Text>

                                    </View>
                                    {filteredItems.map((item: any, index: number) => {
                                        const cleanText = (text: string) => text.replace(/[\r\n]+/g, ' ').trim();
                                        return (
                                            <View style={styles.selectedServiceRow}>
                                                <View style={{ width: '85%' }}>
                                                    {item?.CatCategoryId == "42"
                                                        ? <Text style={styles.selectedServiceText}>{`Remote Consultation / ${cleanText(String(item?.TitlePlang || ''))}`}</Text>
                                                        : <Text style={styles.selectedServiceText}>{cleanText(String(item?.ServiceTitlePlang || item?.TitlePlang || ''))}</Text>
                                                    }
                                                </View>
                                                <View style={{ width: '15%' }}>
                                                    <View style={styles.selectedServiceCircle}>
                                                        <Text style={styles.selectedServiceCircleText}>{item.Quantity}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })}

                                    <View style={styles.detailsHeader}>
                                        <Text style={styles.detailsHeaderText}>{item?.CatCategoryId == "42" ? 'Session Information' : 'Visit Information'}</Text>

                                    </View>
                                    <View style={styles.sessionInfoDetailsContainer}>
                                        <View style={styles.sessionInfoDetailItem}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                {/* <CalendarIcon width={18} height={18} /> */}
                                                <Text style={styles.sessionInfoLabel}>{(item?.CatCategoryId == "42") ? 'Online Session Date' : 'Visit Date'}</Text>
                                            </View>
                                            <Text style={styles.sessionInfoValue}>{displayDate}</Text>
                                        </View>
                                        <View style={styles.sessionInfoDetailItem}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                {/* <ClockIcon width={18} height={18} /> */}
                                                <Text style={styles.sessionInfoLabel}>{(item?.CatCategoryId == "42") ? 'Online Session Time' : 'Visit Time'}</Text>
                                            </View>
                                            <Text style={styles.sessionInfoValue}>{displayTime}</Text>
                                        </View>
                                        {item?.CatCategoryId == "42" ? <View style={styles.sessionInfoDetailItem}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                {/* <SettingIconSelected width={18} height={18} /> */}
                                                <Text style={styles.sessionInfoLabel}>Session Duration</Text>
                                            </View>
                                            {/* <Text style={styles.sessionInfoValue}>{getSessionDuration(item.SlotDuration)}</Text> */}
                                        </View> :
                                            <View style={{}}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name="location-sharp" size={18} color="#23a2a4" />
                                                    <Text style={styles.sessionInfoLabel}> Visit Location</Text>
                                                </View>
                                                <Text style={{ ...globalTextStyles.bodyMedium, color: '#333', textAlign: 'left' }}>{item?.Address}</Text>
                                            </View>
                                        }

                                        {item?.CatCategoryId != "42" && <View>
                                            <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(true)} style={{ flexDirection: 'row', height: 40, width: '100%', borderWidth: 1, borderColor: "#008080", borderRadius: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={require('../../../assets/icons/googleMapIcon.png')} style={{ width: 20, height: 20 }} />
                                                <Text style={{ ...globalTextStyles.bodySmall, color: '#008080', paddingLeft: 10 }}>Show directions on Google Maps</Text>
                                            </TouchableOpacity>
                                        </View>}
                                    </View>

                                    <View style={styles.patientInfoCard}>
                                        <View style={styles.patientInfoHeader}>
                                            <Text style={styles.patientInfoHeaderText}>Patient Information</Text>
                                        </View>
                                        <View style={styles.patientInfoContent}>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Name</Text>
                                                <Text style={styles.patientInfoValue}>{item.FullNamePlang || 'NA'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Phone No.</Text>
                                                <Text style={styles.patientInfoValue}>{item.PhoneNumber || 'NA'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Patient Rating</Text>
                                                <View style={styles.ratingContainer}>
                                                    <Ionicons name="star" size={16} color="#fbbf24" />
                                                    <Text style={styles.ratingText}>
                                                        {item.AccumulativeRatingAvg ? item.AccumulativeRatingAvg.toFixed(1) : '0.0'}
                                                    </Text>
                                                    {item.AccumulativeRatingNum && (
                                                        <Text style={styles.ratingCount}> ({item.AccumulativeRatingNum} Ratings)</Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Gender</Text>
                                                <Text style={styles.patientInfoValue}>{item.Gender == 0 ? 'Female' : 'Male'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Age</Text>
                                                <Text style={styles.patientInfoValue}>{item.Age || 'NA'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>ID Number</Text>
                                                <Text style={styles.patientInfoValue}>{item.IDNumber || 'NA'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Relative Relation</Text>
                                                <Text style={styles.patientInfoValue}>{item.CatRelationshipId ? item.RelationShipPlang : 'Self'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Nationality</Text>
                                                <Text style={styles.patientInfoValue}>{item.CatNationalityId ? 'Resident' : 'Citizen'}</Text>
                                            </View>
                                            <View style={styles.patientInfoRow}>
                                                <Text style={styles.patientInfoLabel}>Insurance Company</Text>
                                                <Text style={styles.patientInfoValue}>{item.InsuranceCompanyPlang || 'NA'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }


                </ScrollView>}
            </View>
        </SafeAreaView>
    )
}

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
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
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
    tagsContainer: {
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    separator: {
        width: 8,
    },
    doctorTagContainer: {
        position: 'relative',
    },
    doctorTag: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        marginHorizontal: 4,
        minWidth: 180,
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedTag: {
        borderColor: '#23a2a4',
        backgroundColor: '#23a2a4',
    },
    doctorImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
    doctorInfoCol: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    doctorName: {
        ...globalTextStyles.bodyMedium,
        marginBottom: 2,
        textAlign: 'left',
    },
    serviceName: {
        ...globalTextStyles.bodySmall,
        textAlign: 'left',
    },
    arrowText: {
        ...globalTextStyles.bodyMedium,
        color: "#23a2a4",
    },
    arrowIndicatorSimple: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS == 'ios' ? -6 : -12,
    },
    detailsCard: {
        backgroundColor: '#F6FAF9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        backgroundColor: '#e4f1ef',
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    detailsHeaderText: {
        ...globalTextStyles.bodyMedium,
        // fontWeight: 'bold',
    },
    selectedServiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        width: '100%',
    },
    selectedServiceCircle: {
        width: 20,
        height: 20,
        borderRadius: 14,
        backgroundColor: '#23a2a4',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedServiceCircleText: {
        // fontWeight: 'bold',
        ...globalTextStyles.bodyMedium,
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        includeFontPadding: false,
    },
    selectedServiceText: {
        ...globalTextStyles.bodySmall,
        color: '#23a2a4',
        // fontWeight: 'bold',
    },
    sessionInfoTitle: {
        ...globalTextStyles.bodyMedium,
        // fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'right',
    },
    sessionInfoDetailsContainer: {
        marginTop: 4,
        marginBottom: 8,
        gap: 8,
    },
    sessionInfoDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sessionInfoLabel: {
        ...globalTextStyles.bodySmall,
        marginBottom: 2,
        marginLeft: 2,
    },
    sessionInfoValue: {
        ...globalTextStyles.bodyMedium,
        // fontWeight: 'bold',
        marginTop: 2,
    },
    patientInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    patientInfoHeader: {
        backgroundColor: '#e4f1ef',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    patientInfoHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    patientInfoContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    patientInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    patientInfoLabel: {
        ...globalTextStyles.bodySmall,
        color: '#333',
        textAlign: 'left',
    },
    patientInfoValue: {
        ...globalTextStyles.bodyMedium,
        color: '#333',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...globalTextStyles.bodyMedium,
        color: '#333',
    },
    ratingCount: {
        ...globalTextStyles.bodySmall,
        color: '#999',
    },
})

export default OrderDetails