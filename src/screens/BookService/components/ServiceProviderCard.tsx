import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import UserPlaceholder from '../../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../../shared/utils/constants';
import LeftArrow from '../../../assets/icons/LeftArrow';
import RightArrow from '../../../assets/icons/RightArrow';
import { generateSlotsForDate } from '../../../shared/utils/bookService';
import CheckIcon from '../../../assets/icons/CheckIcon';
import { useSelector, useDispatch } from 'react-redux';
import { addCardItem, manageTempSlotDetail } from '../../../shared/redux/reducers/bookingReducer';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Specialty {
  CatSpecialtyId: string;
  TitlePlang: string;
  TitleSlang: string;
  UserloginInfoId: string;
  CatLevelId: number;
  LevelTitlePlang: string;
  LevelTitleSlang: string;
}

interface AvailabilityDetail {
  ServiceProviderId: string;
  StartTime: string;
  EndTime: string;
}

interface Availability {
  Detail: AvailabilityDetail[];
}

interface TimeConfig {
  Id: string;
  CatServiceId: string;
  CatSpecialtyId: string;
  StartTime: string;
  EndTime: string;
  CatAvailabilityTypeId: string;
  ServiceProviderId: string;
  StartDate: string;
  EndDate: string;
  OrganizationId: string;
  ShowCareProviderInfo: boolean;
  ServiceProviderHolidays: string | null;
  UnavailableStartdate: string | null;
  UnavailableEnddate: string | null;
  UnavailableStartTime: string | null;
  UnavailableEndTime: string | null;
  BookedSlots: any[];
}

interface TimeSlot {
  date: string;
  fullTime: string;
  start_time: string;
  end_time: string;
  availability_type_id: string;
  is_holiday: boolean;
  available: boolean;
}

interface Service {
  CatCategoryId: string;
  CatCategoryTypeId: number;
  CatLevelId: number;
  CatServiceCategoryId: string;
  CatServiceServeTypeId: number;
  DescriptionPlang: string;
  DescriptionSlang: string;
  FeatureExcludedPlang: string;
  FeatureExcludedSlang: string;
  FeatureIncludedPlang: string;
  FeatureIncludedSlang: string;
  Id: string;
  ImagePath: string;
  Price: number;
  TitlePlang: string;
  TitleSlang: string;
  iswithNurse: boolean;
}

interface ServiceProvider {
  RowId: string;
  ServiceIds: string;
  Prices: string;
  PriceswithTax: string;
  OrganizationId: string;
  OrganizationTitlePlang: string;
  OrganizationTitleSlang: string;
  OrgImagePath: string | null;
  UserId: string;
  FullnamePlang: string;
  FullnameSlang: string;
  CellNumber: string;
  Email: string;
  Gender: boolean;
  ImagePath: string | null;
  AboutPlang: string;
  AboutSlang: string;
  YearsofExperience: string;
  AccumulativeRatingNum: number;
  AccumulativeRatingAvg: number;
  SlotDuration: number;
  Specialties: Specialty[];
  ServiceServe: any[];
  slots?: any[];
  OrganizationServiceIds: string;
  ServicePrice: string;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onTimeSelect?: (time: string) => void;
  selectedDate: any;
  availability: any;
  selectedSlotInfo?: { providerId: string, slotTime: string } | null;
  onSelectSlot: (provider: any, slot: any, selectedServiceValues?: any) => void;
  onSelectService?: (providerId: string, service: string) => void;
  selectedService?: any;
  userFavorites?: any[];
  getUserFavorites?: () => void;
}

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = React.memo(({
  provider,
  onTimeSelect,
  selectedDate,
  availability,
  selectedSlotInfo,
  onSelectSlot,
  onSelectService,
  selectedService,
  userFavorites,
  getUserFavorites
}) => {
  const dispatch = useDispatch();
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const services = useSelector((state: any) => state.root.booking.services);
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const tempSlotDetail = useSelector((state: any) => state.root.booking.tempSlotDetail);
  const selectedUniqueId = useSelector((state: any) => state.root.booking.selectedUniqueId);
  const selectedCard = CardArray.filter((item: any) => item.ItemUniqueId === selectedUniqueId);
  const category = useSelector((state: any) => state.root.booking.category);
  const user = useSelector((state: any) => state.root.user.user);

  const [specialtiesScrollPosition, setSpecialtiesScrollPosition] = useState(0);
  const [timeSlotsScrollPosition, setTimeSlotsScrollPosition] = useState(0);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const specialtiesScrollViewRef = useRef<ScrollView>(null);
  const timeSlotsScrollViewRef = useRef<ScrollView>(null);
  const isRTL = true;

  const lastCardItem = tempSlotDetail;
  const isProviderSelected = lastCardItem && lastCardItem?.providerId === provider.UserId;
  const selectedCardItem = isProviderSelected ? lastCardItem : null;

  const isPastTime = useCallback((slot: TimeSlot) => {
    // Only check past times if the selected date is today
    const today = new Date();
    const selectedDateObj = new Date(selectedDate.format('YYYY-MM-DD'));

    // If selected date is not today, all slots are available
    if (selectedDateObj.toDateString() !== today.toDateString()) {
      return false;
    }

    const inputTime = slot.fullTime;

    // Get current time
    const now = new Date();
    const slotTime = new Date();
    const [inputHours, inputMinutes] = inputTime.split(':').map(Number);

    // Set the time of slot date to match the input
    slotTime.setHours(inputHours);
    slotTime.setMinutes(inputMinutes);
    slotTime.setSeconds(0);
    slotTime.setMilliseconds(0);

    return slotTime < now;
  }, [selectedDate]);

  useEffect(() => {
    if (timeSlots.length > 0) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Find the next available slot after current time
      const nextSlotIndex = timeSlots.findIndex(slot => {
        const [slotHour, slotMinute] = slot.fullTime.split(':').map(Number);
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);

        // Convert to minutes for easier comparison
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        return slotTimeInMinutes > currentTimeInMinutes && slot.available;
      });

      setTimeout(() => {
        if (timeSlotsScrollViewRef.current) {
          if (timeSlotsScrollViewRef.current) {
            const slotWidth = 104;
            const scrollAmount = slotWidth * nextSlotIndex / 2;
            const currentPosition = timeSlotsScrollPosition;
            const newPosition = true
              ? Math.max(0, currentPosition - scrollAmount)
              : currentPosition + scrollAmount;

            requestAnimationFrame(() => {
              timeSlotsScrollViewRef.current?.scrollTo({
                x: newPosition,
                animated: true
              });
            });
          }
        }
      }, 1000);
    }
  }, [timeSlots]);

  console.log("provider", provider);

  const onServiceSelectUpdate = (providerId: string, service: any) => {
    onSelectService && onSelectService(providerId, service.ServiceTitlePlang)

    // const getServiceId = services.find((item: any) => item.TitlePlang == service);
    const updatedCardArray = [...CardArray];

    // const selectedServiceValues = provider.ServiceServe.find((item: any) => item.ServiceTitlePlang == service);

    // Find the index of the item that matches the selectedUniqueId
    const selectedIndex = updatedCardArray.findIndex(item => item.ItemUniqueId === selectedUniqueId);

    if (selectedIndex !== -1) {
      if (!updatedCardArray[selectedIndex].CatSpecialtyId) {
        updatedCardArray[selectedIndex] = {
          ...updatedCardArray[selectedIndex],
          "OrganizationServiceId": provider.ServiceServe[0].OrganizationServiceId,
          "CatNationalityId": user?.CatNationalityId,
          "ServiceCharges": provider.ServiceServe[0].Price,
          "PriceswithTax": provider.ServiceServe[0].PriceswithTax,
          "ServicePrice": provider.ServiceServe[0].Price,
          "SlotDuration": provider.SlotDuration,
        };
      } else {
        updatedCardArray[selectedIndex] = {
          ...updatedCardArray[selectedIndex],
          "CatNationalityId": user?.CatNationalityId,
          "CatServiceId": service.Id,
          "ServiceCharges": service.Price,
          "OrganizationServiceId": service.OrganizationServiceId,
          "PriceswithTax": service.PriceswithTax,
          "ServicePrice": service.Price,
          "SlotDuration": provider.SlotDuration,
        };
      }
    }

    dispatch(addCardItem(updatedCardArray));
  }

  const calculateTotalPrice = (serviceServe: any[]): number => {
    if (serviceServe.length == 0) return 0;
    // const prices = serviceServe.map(price => parseFloat(price.Price) || 0);
    return serviceServe.reduce((sum, price) => sum + price.Price, 0);
  };

  const checkSelectedSlotInfo = () => {
    let returnVal = false
    const formattedSelectedDate = selectedDate.format('YYYY-MM-DD');

    if (selectedSlotInfo) {
      returnVal = selectedSlotInfo?.providerId === provider.UserId
    } else {
      returnVal = selectedCard[0]?.ServiceProviderUserloginInfoId == provider.UserId &&
        selectedCard[0]?.SchedulingDate === formattedSelectedDate
    }

    return returnVal;
  }

  const checkSelectedService = (item: any) => {
    let returnVal = false
    const formattedSelectedDate = selectedDate.format('YYYY-MM-DD');

    // if(selectedCard[0]?.SchedulingDate === formattedSelectedDate){
    if (selectedSlotInfo) {
      returnVal = selectedSlotInfo?.providerId === provider.UserId && selectedService?.selectedService == item.ServiceTitlePlang
    } else if (selectedService) {
      returnVal = selectedService?.providerId === provider.UserId && selectedService?.selectedService == item.ServiceTitlePlang
    } else {
      returnVal = selectedCard[0]?.ServiceProviderUserloginInfoId == provider.UserId &&
        selectedCard[0]?.CatServiceId == item.Id

    }
    // }


    return returnVal;
  }

  // Memoize static content to prevent unnecessary re-renders
  const providerInfo = useMemo(() => (
    <>
      <View style={[{ flexDirection: 'row', width: '100%' }, checkSelectedSlotInfo() && styles.selectedProviderCard]}>
        {checkSelectedSlotInfo() && <View style={{ position: 'absolute', right: 10, bottom: 10, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon width={40} height={40} color="#fff" />
        </View>}
        <View style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden' }}>
          {provider.ImagePath ? (
            <Image
              source={{ uri: `${MediaBaseURL}/${provider.ImagePath}` }}
              style={styles.providerImage}
              resizeMode="cover"
            />
          ) : (
            <UserPlaceholder width={60} height={60} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
          <Text style={{ ...globalTextStyles.bodyMedium, color: '#666' }}>Care provider</Text>
          <Text style={styles.providerName}>{provider.FullnamePlang}</Text>
        </View>

      </View>
      {category.Id != "42" && category.Id != "32" ?

        <>
          <View style={{ width: '100%', paddingVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 10, marginVertical: 10 }}>
            <Text style={[styles.priceText, { textAlign: 'right' }]}>
              {isRTL ? `السعر ${calculateTotalPrice(provider?.ServiceServe).toFixed(0)}` : `Price ${calculateTotalPrice(provider?.ServiceServe).toFixed(0)}`}
            </Text>
          </View>
        </>
        : selectedCard[0]?.CatLevelId == 3 ?

          <View style={{ width: '100%',paddingVertical: 10, alignItems: 'flex-end' }}>
            <Text style={[{ fontSize: 14, paddingRight: 4, color: '#000' }, { textAlign: 'right' }]}>
              {`${provider.ServiceServe[0].ServiceTitlePlang} Price`}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[{ fontSize: 14, paddingRight: 4, color: '#666' }, { textAlign: 'right' }]}>
                {`SAR`}
              </Text>
              <Text style={[styles.priceText, { textAlign: 'right' }]}>
                {`${Number(provider.ServiceServe[0].Price).toFixed(0)}`}
              </Text>
            </View>
          </View> :
          <View style={{ width: '100%', paddingVertical: 10, borderRadius: 10, paddingHorizontal: 10, marginVertical: 10 }}>
            <FlatList
              data={provider.ServiceServe}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              renderItem={({ item }) => {
                return (
                  <>
                    {provider.ServiceServe.length > 1 ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%', justifyContent: 'flex-start' }}>
                        <TouchableOpacity onPress={() => onServiceSelectUpdate(provider.UserId, item)} style={[styles.checkbox, checkSelectedService(item) && styles.checkedBox]}>
                          {checkSelectedService(item) && <CheckIcon width={12} height={12} />}
                        </TouchableOpacity>
                        <Text style={[styles.priceText, { textAlign: 'left' }]}>
                          {`${item.ServiceTitlePlang}:${Number(item.Price).toFixed(0)}`}
                        </Text>
                        
                      </View>
                    ) : (
                      <View style={{ width: '100%', alignItems: 'flex-end' }}>
                        <Text style={[{ fontSize: 14, paddingRight: 4, color: '#000' }, { textAlign: 'right' }]}>
                          {`${item.ServiceTitlePlang} Price`}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[{ fontSize: 14, paddingRight: 4, color: '#666' }, { textAlign: 'right' }]}>
                            {`SAR`}
                          </Text>
                          <Text style={[styles.priceText, { textAlign: 'right' }]}>
                            {`${Number(item.Price).toFixed(0)}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )
              }}
            />

          </View>}
    </>
  ), [provider, isProviderSelected, selectedSlotInfo, selectedService, userFavorites]);



  const scrollTimeSlots = useCallback((direction: 'left' | 'right') => {
    if (timeSlotsScrollViewRef.current) {
      const scrollAmount = 120;
      const currentPosition = timeSlotsScrollPosition;
      const newPosition = direction === 'left'
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;

      timeSlotsScrollViewRef.current.scrollTo({
        x: newPosition,
        animated: true
      });
    }
  }, [timeSlotsScrollPosition]);

  // Helper to convert Arabic AM/PM to English AM/PM
  const convertArabicTime = (timeStr: string) => {
    return timeStr.replace('م', 'PM').replace('ص', 'AM').trim();
  };

  // Converts time string and date to a Date object
  const getDateTime = (date: string, time: string, is24Hour = false) => {
    if (is24Hour) {
      // time is already in HH:mm format
      const [hour, minute] = time.split(':').map(Number);
      return new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    } else {
      // convert AM/PM time (e.g., 11:30 PM)
      const formattedTime = convertArabicTime(time);
      const [timePart, period] = formattedTime.split(' ');
      let [hour, minute] = timePart.split(':').map(Number);
      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    }
  };

  const isTimeSlotAvailable = (slot: TimeSlot) => {
    return !isPastTime(slot);
  }

  const handleSlotSelect = useCallback((time: any) => {
    if (category.Id == "42" || category.Id == "32") {
      const getServiceId = selectedService ? services?.length > 1 ? services.find((service: any) => service.TitlePlang == selectedService.selectedService) : 0 : 0;
      const selectedServiceValues = selectedService && provider.ServiceServe.find((item: any) => item.ServiceTitlePlang == selectedService.selectedService);
      onSelectSlot(provider, time, selectedServiceValues);
      const updatedCardArray = [...CardArray];

      // Find the index of the item that matches the selectedUniqueId
      const selectedIndex = updatedCardArray.findIndex(item => item.ItemUniqueId === selectedUniqueId);

      if (selectedIndex !== -1) {
        if (!updatedCardArray[selectedIndex].CatSpecialtyId) {
          updatedCardArray[selectedIndex] = {
            ...updatedCardArray[selectedIndex],
            "CatNationalityId": user?.CatNationalityId,
            "OrganizationServiceId": provider.ServiceServe[0].OrganizationServiceId,
            "OrganizationId": provider.OrganizationId,
            "ServiceCharges": provider.ServiceServe[0].Price,
            "PriceswithTax": provider.ServiceServe[0].PriceswithTax,
            "ServicePrice": provider.ServiceServe[0].Price,
            "ServiceProviderUserloginInfoId": provider.UserId,
            "SchedulingDate": selectedDate.format('YYYY-MM-DD'),
            "SchedulingTime": convertArabicTimeTo24Hour(time.start_time),
            "AvailabilityId": availability.Id,
            "CatSchedulingAvailabilityTypeId": availability.CatAvailabilityTypeId,
            "ServiceProviderFullnameSlang": provider.FullnameSlang,
            "SlotDuration": provider.SlotDuration,
          };
        } else {
          updatedCardArray[selectedIndex] = {
            ...updatedCardArray[selectedIndex],
            "OrganizationId": provider.OrganizationId,
            "ServiceProviderUserloginInfoId": provider.UserId,
            "SchedulingDate": selectedDate.format('YYYY-MM-DD'),
            "SchedulingTime": convertArabicTimeTo24Hour(time.start_time),
            "AvailabilityId": availability.Id,
            "CatSchedulingAvailabilityTypeId": availability.CatAvailabilityTypeId,
            "ServiceProviderFullnameSlang": provider.FullnameSlang,
            "SlotDuration": provider.SlotDuration,
          };

          if (provider.ServiceServe.length == 1) {
            updatedCardArray[selectedIndex] = {
              ...updatedCardArray[selectedIndex],
              "OrganizationServiceId": provider.ServiceServe[0].OrganizationServiceId,
              "CatNationalityId": user?.CatNationalityId,
              "ServiceCharges": provider.ServiceServe[0].Price,
              "PriceswithTax": provider.ServiceServe[0].PriceswithTax,
              "ServicePrice": provider.ServiceServe[0].Price,
              "CatServiceId": provider.ServiceServe[0].Id,
              "SlotDuration": provider.SlotDuration,
            };
          } else if (selectedServiceValues) {
            updatedCardArray[selectedIndex] = {
              ...updatedCardArray[selectedIndex],
              "OrganizationServiceId": selectedServiceValues?.OrganizationServiceId || 0,
              "CatNationalityId": user?.CatNationalityId,
              "ServiceCharges": selectedServiceValues?.Price || 0,
              "PriceswithTax": selectedServiceValues?.PriceswithTax || 0,
              "ServicePrice": selectedServiceValues?.Price || 0,
              "CatServiceId": selectedServiceValues?.Id,
              "SlotDuration": provider.SlotDuration,
            };
          } else {
            updatedCardArray[selectedIndex] = {
              ...updatedCardArray[selectedIndex],
              "OrganizationServiceId": 0,
              "CatNationalityId": user?.CatNationalityId,
              "ServiceCharges": 0,
              "PriceswithTax": 0,
              "ServicePrice": 0,
              "CatServiceId": null,
              "SlotDuration": provider.SlotDuration,
            };
          }
        }
      }

      dispatch(addCardItem(updatedCardArray));
    } else {
      onSelectSlot(provider, time);
      const updatedCardArray = [...CardArray];

      // Find the correct price for the selected service
      // const serviceIds = provider?.ServiceIds.split(',');
      // const prices = provider?.Prices.split(',');

      // Update each selected item with service-specific values
      selectedCard.forEach((selectedItem: any) => {
        const itemIndex = updatedCardArray.findIndex(cardItem =>
          cardItem.ItemUniqueId === selectedItem.ItemUniqueId &&
          cardItem.CatServiceId === selectedItem.CatServiceId
        );

        if (itemIndex !== -1) {
          // Get the specific price for this service
          const serviceId = selectedItem.CatServiceId;
          const selectedServiceValues = provider.ServiceServe.find((item: any) => item.Id == serviceId);

          updatedCardArray[itemIndex] = {
            ...updatedCardArray[itemIndex],
            "CatNationalityId": user?.CatNationalityId,
            "OrganizationServiceId": selectedServiceValues.OrganizationServiceId,
            "OrganizationId": provider?.OrganizationId,
            "ServiceCharges": selectedServiceValues.Price,
            "PriceswithTax": selectedServiceValues.PriceswithTax,
            "ServicePrice": selectedServiceValues.Price,
            "ServiceProviderUserloginInfoId": provider.UserId,
            "SchedulingDate": selectedDate.format('YYYY-MM-DD'),
            "SchedulingTime": convertArabicTimeTo24Hour(time.start_time),
            "AvailabilityId": availability.Id,
            "CatSchedulingAvailabilityTypeId": availability.CatAvailabilityTypeId,
            "ServiceProviderFullnameSlang": provider?.FullnameSlang,
            "orgTitleSlang": provider?.FullnameSlang,
            "SlotDuration": provider.SlotDuration,
          };
        }
      });

      dispatch(addCardItem(updatedCardArray));
    }
  }, [provider, onSelectSlot, CardArray, selectedService, services, selectedDate, availability, dispatch]);

  // Function to convert Arabic 12-hour time to 24-hour format
  const convertArabicTimeTo24Hour = (timeString: string): string => {
    if (!timeString) return timeString;

    // Remove any extra spaces and split by space
    const parts = timeString.trim().split(' ');
    if (parts.length < 2) {
      return timeString; // If no AM/PM indicator, return as is
    }

    const timePart = parts[0]; // e.g., "2:30"
    const periodPart = parts[1]; // e.g., "ص" (ص for AM) or "م" (م for PM)

    // Split time into hours and minutes
    const [hours, minutes] = timePart.split(':').map(Number);

    let hour24 = hours;

    // Convert based on Arabic period indicators
    // ص = صباح (morning/AM)
    // م = مساء (evening/PM)
    if (periodPart === 'ص') {
      // AM - keep as is, but handle 12 AM case
      if (hours === 12) {
        hour24 = 0;
      }
    } else if (periodPart === 'م') {
      // PM - add 12 hours, but handle 12 PM case
      if (hours !== 12) {
        hour24 = hours + 12;
      }
    } else {
    }

    const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return result;
  };

  const getLocalReservedSlots = (ProviderId: string, Slot: any) => {
    // Convert slot time from Arabic 12-hour to 24-hour format
    const slotStartTime24Hour = convertArabicTimeTo24Hour(Slot.start_time);

    const reservedSlots = CardArray.filter((item: any) => {
      // Convert item's scheduling time to 24-hour format for comparison
      const itemTime24Hour = convertArabicTimeTo24Hour(item.SchedulingTime);

      return item.ServiceProviderUserloginInfoId == ProviderId &&
        itemTime24Hour === slotStartTime24Hour;
    });

    return reservedSlots.length > 0 ? true : false;
  }

  const renderTimeSlots = useMemo(() => {
    return (
      <View style={styles.specialtyContainer}>
        <TouchableOpacity
          onPress={() => scrollTimeSlots('left')}
          style={[styles.scrollButton, styles.leftScrollButton]}
          activeOpacity={0.7}
        >
          <LeftArrow />
          {/* {isRTL ? <RightArrow /> : <LeftArrow />} */}
        </TouchableOpacity>

        <ScrollView
          ref={timeSlotsScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtiesScrollView}
          onScroll={(event) => setTimeSlotsScrollPosition(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          snapToInterval={120}
          decelerationRate={0}
          snapToAlignment="start"
          contentContainerStyle={styles.timeSlotsContent}
        >
          <View style={styles.specialtiesRow}>
            {provider.slots && provider.slots.map((slot: any, index: any) => {
              let isSelected = selectedSlotInfo?.providerId === provider.UserId &&
                selectedSlotInfo?.slotTime === slot.start_time;
              const isPast = isPastTime(slot);
              const isDisabled = !slot.available || isPast;
              const isReserved = getLocalReservedSlots(provider.UserId, slot);
              const isBooked = slot.is_booked;

              if (selectedCard[0]?.ServiceProviderUserloginInfoId == provider.UserId && slot.fullTime == selectedCard[0]?.SchedulingTime) {
                isSelected = true;
              }

              if (isDisabled) {
                return null
              }

              return (
                <TouchableOpacity
                  key={`time-${slot.start_time}-${index}`}
                  style={[
                    styles.timeButton,
                    isSelected ? styles.selectedTimeButton : (isDisabled && styles.disabledTimeButton,
                      (isBooked || isReserved) && styles.bookedTimeButton),

                  ]}
                  onPress={() => !isDisabled && handleSlotSelect(slot)}
                  activeOpacity={0.5}
                  disabled={isDisabled || isBooked || isReserved}
                >
                  <Text style={[
                    styles.timeButtonText,
                    isSelected && styles.selectedTimeButtonText,
                    isDisabled && styles.disabledTimeButtonText
                  ]}>{slot.start_time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => scrollTimeSlots('right')}
          style={[styles.scrollButton, styles.rightScrollButton]}
          activeOpacity={0.7}
        >
          <RightArrow />
          {/* {isRTL ? <LeftArrow /> : <RightArrow />} */}
        </TouchableOpacity>
      </View>
    );
  }, [provider.slots, selectedSlotInfo, provider.UserId, isPastTime, handleSlotSelect, scrollTimeSlots]);

  return (
    <View style={[styles.providerCard]}>
      {providerInfo}


      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.selectTimeLabel}>Select Visit Time</Text>
        <View style={styles.divider} />
      </View>

      {renderTimeSlots}
    </View>
  );
});

const styles = StyleSheet.create({
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
    position: 'relative',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    // marginBottom: 8,
  },
  providerName: {
    ...globalTextStyles.bodyMedium,
    // fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    color: '#222',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceText: {
    color: '#179c8e',
    fontWeight: 'bold',
    fontSize: 16,
    // marginVertical: 4,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  scrollButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    minWidth: 40,
  },
  leftScrollButton: {
    marginRight: 4,
  },
  rightScrollButton: {
    marginLeft: 4,
  },
  specialtiesScrollView: {
    flex: 1,
  },
  specialtiesContent: {
    paddingHorizontal: 8,
  },
  specialtiesRow: {
    flexDirection: 'row',
  },
  specialtyPill: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  specialtyText: {
    ...globalTextStyles.bodySmall,
  },
  videoInfo: {
    ...globalTextStyles.bodySmall,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '60%',
  },
  selectTimeLabel: {
    ...globalTextStyles.bodySmall,
    marginBottom: 4,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#179c8e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 4,
    backgroundColor: '#fff',
    width: 100,
  },
  disabledTimeButton: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  timeButtonText: {
    color: '#179c8e',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  disabledTimeButtonText: {
    color: '#999',
  },
  timeSlotsContent: {
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  loadingText: {
    marginLeft: 8,
    color: '#179c8e',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#179c8e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  noSlotsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#008080',
    // marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
  },
  selectedProviderCard: {
    borderRadius: 8,
    backgroundColor: 'rgba(35, 162, 164, .4)',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#179c8e',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectedTimeButton: {
    backgroundColor: '#179c8e',
  },
  selectedTimeButtonText: {
    color: '#fff',
  },
  bookedTimeButton: {
    backgroundColor: '#D3E8E8',
    borderColor: 'lightgray',
  },
  bookedTimeButtonText: {
    color: '#fff',
  },
  reservedTimeButton: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  reservedTimeButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});

export default ServiceProviderCard;