import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ScrollView, Linking } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { globalTextStyles } from '../../../styles/globalStyles';
import { MediaBaseURL } from '../../../shared/utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { convert24HourToEnglishTime, generatePayloadforOrderMainBeforePayment } from '../../../shared/utils/bookService';
import { bookingService, categoriesList } from '../../../services/api/bookingService';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AppointmentTrackingMap from '../../../components/AppointmentTrackingMap';

const Step3ReviewOrder = ({ Patient, handleNext }: { Patient: any, handleNext: () => void }) => {
  const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
  const [showGroupedArray, setShowGroupedArray] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDoctor: any = showGroupedArray[selectedIndex];
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useSelector((state: any) => state.root.user.user);
  const selectedLocation = useSelector((state: any) => state.root.booking.selectedLocation);
  const [openGoogleMapBottomSheet, setOpenGoogleMapBottomSheet] = useState(false);

  const createOrderMainBeforePayment = async () => {
    if (isProcessing) return; // Prevent multiple calls

    setIsProcessing(true);
    try {

      const payload = {
        "UserLoginInfoId": Patient.UserLoginInfoId,
        "CatPlatformId": Platform.OS == 'ios' ? 2 : 3,
        "OrderByCareProviderId": user.Id,
        "OrderDetail": generatePayloadforOrderMainBeforePayment(existingCardItems, Patient)
      }

      const response = await bookingService.createOrderMainBeforePayment(payload);

      if (response.ResponseStatus.STATUSCODE == 200) {

        handleNext();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    getReviewOrder();
  }, []);

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

  const getReviewOrder = async () => {
    setShowGroupedArray([]);
    const groupedArray: any = groupArrayByUniqueIdAsArray(existingCardItems);

    setShowGroupedArray(groupedArray);

  }

  const renderDoctorTag = useCallback(({ item, index }: { item: any; index: number }) => {
    const selectedItem = item.items[0];

    const name = selectedItem.ServiceProviderFullnamePlang ? selectedItem.ServiceProviderFullnamePlang : selectedItem.orgTitlePlang;

    let imagePath: any = selectedItem?.ImagePath;

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

  // Function to calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';

    try {
      // Parse times (assuming format HH:mm)
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Convert to total minutes
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      // Calculate difference
      const diffMinutes = endTotalMinutes - startTotalMinutes;

      if (diffMinutes <= 0) return '';

      // Convert to hours and minutes
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
      } else if (hours > 0) {
        return `${hours} ساعة`;
      } else {
        return `${minutes} دقيقة`;
      }
    } catch (error) {
      return '';
    }
  };

  const getSessionDuration = (slotDuration: number) => {
    if (slotDuration < 60) {
      return `${slotDuration} Minutes`;
    } else {
      return `${Math.floor(slotDuration / 60)} Hours ${Math.floor(slotDuration % 60)} Minutes`;
    }
  }

  const callPatient = (appointment: any) => {
    Linking.openURL(`tel:${appointment.PhoneNumber}`);
  }

  return (
    <>
      <View style={styles.container}>
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
                displayDate = moment(item.SchedulingDate).locale('en').format('DD/MM/YYYY');
                displayTime = convert24HourToEnglishTime(item.SchedulingTime);
              }

              return (
                <View style={styles.detailsCard}>
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
                      <Text style={styles.sessionInfoValue}>{getSessionDuration(item.SlotDuration)}</Text>
                    </View> :
                      <View style={{}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="location-sharp" size={18} color="#23a2a4" />
                          <Text style={styles.sessionInfoLabel}> Visit Location</Text>
                        </View>
                        <Text style={{ ...globalTextStyles.bodyMedium, color: '#333', textAlign: 'left' }}>{selectedLocation?.address}</Text>
                      </View>
                    }

                    {item?.CatCategoryId != "42" && <View>
                      <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(true)} style={{ flexDirection: 'row', height: 40, width: '100%', borderWidth: 1, borderColor: "#008080", borderRadius: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../../assets/icons/googleMapIcon.png')} style={{ width: 20, height: 20 }} />
                        <Text style={{ ...globalTextStyles.bodySmall, color: '#008080', paddingLeft: 10 }}>Show directions on Google Maps</Text>
                      </TouchableOpacity>
                    </View>}
                  </View>
                </View>
              )
            })
          }
          {Patient && (
            <View style={styles.patientInfoCard}>
              <View style={styles.patientInfoHeader}>
                <Text style={styles.patientInfoHeaderText}>Patient Information</Text>
              </View>
              <View style={styles.patientInfoContent}>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Name</Text>
                  <Text style={styles.patientInfoValue}>{Patient.FullnamePlang || Patient.PatientPlang || 'NA'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Phone No.</Text>
                  <Text style={styles.patientInfoValue}>{Patient.CellNumber || 'NA'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Patient Rating</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.ratingText}>
                      {Patient.AccumulativeRatingAvg ? Patient.AccumulativeRatingAvg.toFixed(1) : '0.0'}
                    </Text>
                    {Patient.AccumulativeRatingNum && (
                      <Text style={styles.ratingCount}> ({Patient.AccumulativeRatingNum} Ratings)</Text>
                    )}
                  </View>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Gender</Text>
                  <Text style={styles.patientInfoValue}>{Patient.Gender ? 'Male' : 'Female'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Age</Text>
                  <Text style={styles.patientInfoValue}>{Patient.Age || 'NA'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>ID Number</Text>
                  <Text style={styles.patientInfoValue}>{Patient.IDNumber || 'NA'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Relative Relation</Text>
                  <Text style={styles.patientInfoValue}>{Patient.CatRelationshipId ? Patient.RelationShipPlang : 'Self'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Nationality</Text>
                  <Text style={styles.patientInfoValue}>{Patient.CatNationalityId ? 'Resident' : 'Citizen'}</Text>
                </View>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Insurance Company</Text>
                  <Text style={styles.patientInfoValue}>{Patient.InsuranceCompanyPlang || 'NA'}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>}


      </View>
      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => createOrderMainBeforePayment()} style={styles.nextButton} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>

      <CustomBottomSheet
        visible={openGoogleMapBottomSheet}
        onClose={() => setOpenGoogleMapBottomSheet(false)}
        maxHeight={'80%'}
        backdropClickable={false}
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.buttonMedium, { color: '#000' }]}>Show directions on Google Maps</Text>
            <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(false)}>
              <AntDesign name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "center" }}>
                <Text style={{ ...globalTextStyles.bodyLarge, color: '#000',lineHeight:Platform.OS == 'ios' ? 0 : 20 }}>{selectedDoctor?.items[0]?.ServiceProviderFullnamePlang}</Text>
                <Text style={{ ...globalTextStyles.bodySmall, lineHeight:Platform.OS == 'ios' ? 0 : 15, color: '#222' }}>{selectedDoctor?.items[0]?.orgTitlePlang}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>

                  {selectedDoctor?.items[0]?.PhoneNumber && <Text style={{ ...globalTextStyles.bodySmall, color: '#222' }}>{selectedDoctor?.items[0]?.PhoneNumber?.replace(/^\+/, '')}</Text>}
                  {selectedDoctor?.items[0]?.PhoneNumber && <Text style={{ ...globalTextStyles.bodySmall, color: '#222' }}>+</Text>}

                  {selectedDoctor?.items[0]?.PhoneNumber && <TouchableOpacity onPress={() => callPatient(selectedDoctor?.items[0])} style={{ width: 40, height: 20, marginLeft: 10, backgroundColor: '#2ab318', borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                    <FontAwesome6 name="phone-volume" size={12} color="#fff" />
                  </TouchableOpacity>}
                </View>

              </View>
            </View>

          </View>
          <View style={{ flex: 1, borderRadius: 10, padding: 10 }}>
            {selectedDoctor?.items[0] && (
              <AppointmentTrackingMap
                appointment={{
                  "OrgGoogleLocation": selectedDoctor?.items[0]?.OrgGoogleLocation,
                  "GoogleLocation": `${selectedLocation?.latitude},${selectedLocation?.longitude}`,
                  "OrganizationSlang": selectedDoctor?.items[0]?.ServiceProviderFullnamePlang ? selectedDoctor?.items[0]?.ServiceProviderFullnamePlang : selectedDoctor?.items[0]?.orgTitlePlang,
                  "Address": selectedLocation?.address,
                }}
                onRouteInfoUpdate={(info: any) => { }}
              />
            )}
          </View>
        </View>
      </CustomBottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
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
  tagsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  separator: {
    width: 8,
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
  bottomBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButton: {
    borderRadius: 12,
    backgroundColor: '#00A79D',
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#90A5A4',
    marginTop: 24,
    fontSize: 14,
  },
  disabledNextButton: {
    backgroundColor: '#ccc',
  },
})

export default Step3ReviewOrder