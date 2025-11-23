import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { bookingService, categoriesList } from '../../../services/api/bookingService';
import moment, { Moment } from 'moment';
import { generateSlotsForDate } from '../../../shared/utils/bookService';
import { globalTextStyles } from '../../../styles/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import ServiceProviderCard from '../components/ServiceProviderCard';
import HospitalCard from '../components/HospitalCard';

type Doctor = {
  id: string;
  name: string;
  image?: string;
  type: string;
  price: number;
  availableSlots: string[];
  status: 'available' | 'booked' | 'unavailable';
};

type DateItem = {
  date: Date;
  day: string;
  dayNum: number;
  month: string;
};

// Shimmer placeholder component
const ShimmerPlaceholder = ({ width = 120, height = 14, borderRadius = 6 }: { width?: number | string; height?: number; borderRadius?: number; }) => {
  const shimmerWidth = typeof width === 'string' ? 200 : width;
  const translateX = useRef(new Animated.Value(-shimmerWidth)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: shimmerWidth,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -shimmerWidth,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnimation.start();
    return () => {
      loopAnimation.stop();
    };
  }, [translateX, shimmerWidth]);

  return (
    <View style={{ width: width as any, height, borderRadius, overflow: 'hidden', backgroundColor: '#E6E6E6' }}>
      <Animated.View style={{
        width: '40%',
        height: '100%',
        transform: [{ translateX }],
      }}>
        <LinearGradient
          colors={["#E6E6E6", "#F5F5F5", "#E6E6E6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

// Card shimmer for service providers and hospitals
const CardShimmer = () => {
  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Avatar shimmer */}
        <ShimmerPlaceholder width={80} height={80} borderRadius={40} />

        {/* Content shimmer */}
        <View style={{ flex: 1, gap: 8 }}>
          <ShimmerPlaceholder width="70%" height={18} borderRadius={4} />
          <ShimmerPlaceholder width="50%" height={14} borderRadius={4} />
          <ShimmerPlaceholder width="40%" height={14} borderRadius={4} />
        </View>
      </View>

      {/* Slots shimmer */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <ShimmerPlaceholder width="30%" height={14} borderRadius={4} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

// List shimmer loader
const ListShimmerLoader = ({ cardType = 'default' }: { cardType?: 'default' | 'homeDialysis' }) => {
  const ShimmerCard = CardShimmer;

  return (
    <View style={{ padding: 16 }}>
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </View>
  );
};

const Step2DoctorListing = ({ handleNext }: { handleNext: () => void }) => {
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateList, setDateList] = useState<DateItem[]>([]);
  const [dateListStartDate, setDateListStartDate] = useState(new Date()); // Track the start date for the date list
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [searchNearMe, setSearchNearMe] = useState(true);
  const [selectedType, setSelectedType] = useState<'All' | 'Consultant' | 'Specialist'>('All');
  const [selectedAffiliation, setSelectedAffiliation] = useState<'All' | 'Affiliated' | 'Individual'>('All');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unavailable' | 'booked' | 'available'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
  const selectedUniqueId = useSelector((state: any) => state.root.booking.selectedUniqueId);
  const selectedLocation = useSelector((state: any) => state.root.booking.selectedLocation);
  const services = useSelector((state: any) => state.root.booking.services);
  const [refreshing, setRefreshing] = useState(false);

  // Memoize selectedCardItem to prevent re-filtering on every render
  const selectedCardItem = useMemo(() =>
    existingCardItems.filter((item: any) => item.ItemUniqueId === selectedUniqueId),
    [existingCardItems, selectedUniqueId]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [ProviderWithSlots, setProviderWithSlots] = useState<any[]>([]);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [loader2, setLoader2] = useState(false);
  const [allAvailabilityData, setAllAvailabilityData] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [HospitalWithSlots, setHospitalWithSlots] = useState<any[]>([]);
  const [hospitalList, setHospitalList] = useState<any[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [displayCategory, setDisplayCategory] = useState<any>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any>(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Use ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  const prevSelectedUniqueIdRef = useRef(selectedUniqueId);

  useEffect(() => {
    // Only fetch if selectedUniqueId actually changed
    if (selectedCardItem.length > 0) {
      fetchData();
    }
  }, [selectedUniqueId]);

  const fetchData = useCallback(() => {
    if (selectedCardItem.length === 0) return;

    const displayCategory = categoriesList.find((item: any) => item.Id == selectedCardItem[0]?.CatCategoryId);
    setDisplayCategory(displayCategory);
    if (displayCategory?.Display == "CP") {
      fetchServiceProviders(undefined, null, null, selectedCardItem[0]?.CatCategoryId != "42" ? `${selectedLocation?.latitude},${selectedLocation?.longitude}` : null);
      fetchInitialAvailability();
    } else {
      fetchHospitalListByServices(null, null, `${selectedLocation?.latitude},${selectedLocation?.longitude}`);
      fetchOrganizationSchedulingAvailability();
    }
  }, [selectedCardItem, selectedLocation]);

  useEffect(() => {
    if (selectedCardItem[0]?.CatCategoryId == "42") {
      setSearchNearMe(false);
    } else {
      setSearchNearMe(true);
    }
  }, [selectedCardItem[0]?.CatCategoryId])

  useEffect(() => {
    if (!searchNearMe) {
      getHospitalWithoutLocation();
    }
  }, [searchNearMe])

  const getHospitalWithoutLocation = async () => {
    fetchHospitalListByServices(
      null,
      null,
      null
    )
  }

  const getServiceIdsFromCardArray = useCallback(() => {
    const serviceIds = selectedCardItem?.map((item: any) => item.CatServiceId);
    return serviceIds.join(',');
  }, [selectedCardItem]);

  const getServiceIds = useCallback(() => {
    return services
      ?.map((service: any) => service.Id)
      .join(',') || '';
  }, [services]);

  const fetchServiceProviders = useCallback(async (serviceID?: string, cityId?: any, squareId?: any, patientLocation?: any, emptySearch?: boolean) => {
    try {
      setLoading(true);
      let serviceIds = "";
      if (serviceID) {
        serviceIds = serviceID;
      } else {
        if (services == null) {
          serviceIds = getServiceIdsFromCardArray();
        } else {
          serviceIds = getServiceIds();
        }
      }


      let requestBody: any = {};
      if (selectedCardItem[0]?.CatCategoryId == "42" || selectedCardItem[0]?.CatCategoryId == "32") {
        if (selectedCardItem[0]?.CatLevelId == 3) {
          requestBody = {
            CatcategoryId: selectedCardItem[0]?.CatCategoryId,
            ServiceIds: serviceIds,
            Search: emptySearch ? "" : searchQuery,
            PatientLocation: patientLocation || null,
            CatCityId: cityId || null,
            CatSquareId: squareId || null,
            Gender: 2,
            PageNumber: 0,
            PageSize: 100,
          }
        } else {
          requestBody = {
            CatcategoryId: selectedCardItem[0]?.CatCategoryId,
            ServiceIds: serviceIds,
            Search: emptySearch ? "" : searchQuery,
            PatientLocation: patientLocation || null,
            CatCityId: cityId || null,
            CatSquareId: squareId || null,
            Gender: 2,
            PageNumber: 0,
            PageSize: 100,
            SpecialtyIds: selectedCardItem[0]?.CatSpecialtyId || 0
          }
        }
      } else {
        requestBody = {
          CatcategoryId: selectedCardItem[0]?.CatCategoryId,
          ServiceIds: serviceIds,
          Search: emptySearch ? "" : searchQuery,
          PatientLocation: patientLocation || null,
          CatCityId: cityId || null,
          CatSquareId: squareId || null,
          Gender: 2,
          PageNumber: 0,
          PageSize: 100,
        }
      }

      const response = await bookingService.getServiceProviderListByServiceByIds(requestBody);

      if (response?.ServiceProviderList?.length == 0) {
        setProviderWithSlots([])
      }
      setServiceProviders(response?.ServiceProviderList || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCardItem, services, searchQuery, getServiceIdsFromCardArray, getServiceIds]);

  const filterAvailabilityForDate = useCallback((date: Moment, data: any[]) => {
    const formattedDate = date.locale('en').format('YYYY-MM-DD');
    const filteredData = data.filter(item => item.Date === formattedDate);
    setAvailability(filteredData);
  }, []);

  const fetchInitialAvailability = useCallback(async (date?: any, serviceID?: string) => {
    try {
      setLoader2(true);
      let serviceIds = "";
      if (serviceID) {
        serviceIds = serviceID;
      } else {
        if (services == null) {
          serviceIds = getServiceIdsFromCardArray();
        } else {
          serviceIds = getServiceIds();
        }
      }

      const requestBody = {
        CatServiceId: serviceIds,
        CatSpecialtyId: selectedCardItem[0]?.CatSpecialtyId || 0,
        StartDate: date ? moment(date).locale('en').format('YYYY-MM-DD') : moment().locale('en').format('YYYY-MM-DD'),
        PageNumber: 1,
        PageSize: 20
      }

      const response = await bookingService.getServiceProviderSchedulingAvailability(requestBody);

      setAllAvailabilityData(response?.SchedulingAvailability || []);
      // Set initial availability for selected date
      filterAvailabilityForDate(date ? moment(date) : moment(), response?.SchedulingAvailability || []);
    } catch (error) {
      console.error('Error fetching initial availability:', error);
    } finally {
      setLoader2(false);
    }
  }, [selectedCardItem, services, getServiceIdsFromCardArray, getServiceIds, filterAvailabilityForDate]);

  const fetchHospitalListByServices = useCallback(async (cityId?: any, squareId?: any, patientLocation?: any, emptySearch?: boolean) => {
    try {
      setLoading(true);
      const payload = {
        CatcategoryId: selectedCardItem[0]?.CatCategoryId,
        ServiceIds: selectedCardItem?.map((service: any) => service.CatServiceId).join(','),
        Search: emptySearch ? "" : searchQuery,
        PatientLocation: patientLocation || null,
        CatCityId: cityId || null,
        CatSquareId: squareId || null,
        PageNumber: 0,
        PageSize: 100
      }

      const response = await bookingService.getHospitalListByServices(payload);

      if (response?.HospitalList.length == 0) {
        setHospitalWithSlots([])
      }

      setHospitalList(response?.HospitalList || []);
    } catch (error) {
      console.error('Error fetching hospital list by services:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCardItem, searchQuery]);

  const fetchOrganizationSchedulingAvailability = useCallback(async (date?: any) => {
    try {
      setLoader2(true);
      const payload = {
        CatCategoryId: selectedCardItem[0]?.CatCategoryId,
        StartDate: moment().locale('en').format('YYYY-MM-DD'),
        PageNumber: 1,
        PageSize: 15
      }
      const response = await bookingService.getOrganizationSchedulingAvailability(payload);
      setAllAvailabilityData(response?.SchedulingAvailability || []);
      // Set initial availability for selected date
      filterAvailabilityForDate(date ? moment(date) : moment(), response?.SchedulingAvailability || []);
    } catch (error) {
      console.error('Error fetching organization scheduling availability:', error);
    } finally {
      setLoader2(false);
    }
  }, [selectedCardItem, filterAvailabilityForDate]);

  function mergeAvailabilityArrays(...arrays: any[]) {
    const mergedMap = new Map();

    // Process all arrays
    arrays.forEach(array => {
      if (!Array.isArray(array)) {
        console.warn('Skipping non-array input:', array);
        return;
      }

      array.forEach(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Skipping invalid item:', item);
          return;
        }

        // Use fullTime as unique identifier for each time slot
        const key = item.fullTime;

        if (!key) {
          console.warn('Skipping item without fullTime:', item);
          return;
        }

        const existingItem = mergedMap.get(key);

        if (!existingItem) {
          // First occurrence of this time slot
          mergedMap.set(key, { ...item });
        } else if (item.available === true && existingItem.available === false) {
          // Replace if new item is available and existing is not
          mergedMap.set(key, { ...item });
        }
        // If existing item is already available=true, keep it
        // If both are false or both are true, keep the existing one
      });
    });

    // Convert map back to array and sort by fullTime
    return Array.from(mergedMap.values()).sort((a, b) => {
      return a.fullTime.localeCompare(b.fullTime);
    });
  }

  const getSlotsWithProvider = useCallback(async () => {
    setSlotsLoaded(true)
    const tempProvider: any = []
    serviceProviders.forEach((provider: any) => {
      const providerAvailability = availability.reduce((acc: any[], avail: any) => {
        const details = avail.Detail?.filter((detail: any) => detail.ServiceProviderId === provider.UserId) || [];
        return [...acc, ...details];
      }, []);

      const slotDuration = provider.SlotDuration || 30;
      const formattedDate = selectedDate.locale('en').format('YYYY-MM-DD');

      if (providerAvailability.length > 0) {

        const DoctorAvailableArray: any = []
        providerAvailability.map((item: any) => {
          const DoctorAvailablelocal: any = generateSlotsForDate(
            item,
            formattedDate,
            slotDuration,
          );
          DoctorAvailableArray.push(DoctorAvailablelocal)
        })

        const DoctorAvailable: any = DoctorAvailableArray.length > 1 ? mergeAvailabilityArrays(...DoctorAvailableArray) : DoctorAvailableArray[0]


        // const DoctorAvailable: any = generateSlotsForDate(
        //   providerAvailability[0],
        //   formattedDate,
        //   slotDuration,
        // );

        const tempDoctorObj = {
          ...provider,
          slots: DoctorAvailable
        }

        tempProvider.push(tempDoctorObj)
      }
    })

    setSlotsLoaded(false)

    setProviderWithSlots(tempProvider)
  }, [serviceProviders, availability, selectedDate]);

  useEffect(() => {
    if (serviceProviders.length > 0 && availability.length > 0) {
      getSlotsWithProvider()
    }
  }, [serviceProviders, availability, getSlotsWithProvider])

  // Filter availability when date changes
  useEffect(() => {
    if (allAvailabilityData.length > 0) {
      filterAvailabilityForDate(selectedDate, allAvailabilityData);
    }
  }, [selectedDate, allAvailabilityData, filterAvailabilityForDate]);

  useEffect(() => {
    if (hospitalList.length > 0 && availability.length > 0) {
      getSlotsWithHospital()
    }
  }, [hospitalList, availability])

  const getSlotsWithHospital = async () => {
    setSlotsLoaded(true)
    const tempHospital: any = []
    hospitalList.map((hospital: any) => {
      const hospitalAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.OrganizationId === hospital.OrganizationId)
      );

      const slotDuration = hospital.SlotDuration || 30;
      const formattedDate = selectedDate.locale('en').format('YYYY-MM-DD');

      if (hospitalAvailability.length > 0) {
        const HospitalAvailable: any = generateSlotsForDate(
          hospitalAvailability[0],
          formattedDate,
          slotDuration,
        );

        const tempHospitalObj = {
          ...hospital,
          slots: HospitalAvailable
        }
        tempHospital.push(tempHospitalObj)
      }
    })

    setSlotsLoaded(false)

    setHospitalWithSlots(tempHospital)
  }



  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredProviders = useMemo(() => {
    const filtered = ProviderWithSlots.filter((item: any) => {
      const providerAvailability = availability.reduce((acc: any[], avail: any) => {
        const details = avail.Detail?.filter((detail: any) => detail.ServiceProviderId === item.UserId) || [];
        return [...acc, ...details];
      }, []);

      if (providerAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.locale('en').format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = providerAvailability[0]?.ServiceProviderHolidays?.split(',');
        const holidayCheck = !holidays?.includes(dayOfWeek);

        // // Apply specialty filter if selectSpecialtyFilter is not 0
        // if (selectSpecialtyFilter != 0) {
        //   return holidayCheck && item.CatOrganizationModeId == selectSpecialtyFilter;
        // }

        return holidayCheck;
      }
      return false;
    });

    // // Apply sorting if sortByValue is not 'All'
    // if (sortByValue !== 'All') {
    //   return filtered.sort((a: any, b: any) => {
    //     const priceA = parseFloat(a.ServiceServe?.[0]?.Price) || 0;
    //     const priceB = parseFloat(b.ServiceServe?.[0]?.Price) || 0;

    //     if (sortByValue === 'Asc') {
    //       return priceA - priceB; // Ascending order
    //     } else if (sortByValue === 'Desc') {
    //       return priceB - priceA; // Descending order
    //     }
    //     return 0;
    //   });
    // }

    return filtered;
  }, [ProviderWithSlots, availability, selectedDate]);
  // }, [ProviderWithSlots, availability, selectedDate, selectSpecialtyFilter, sortByValue]);

  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredHospitals = useMemo(() => {
    return HospitalWithSlots.filter((item: any) => {
      const hospitalAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.OrganizationId === item.OrganizationId)
      );

      if (hospitalAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.locale('en').format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = hospitalAvailability[0]?.ServiceProviderHolidays?.split(',');
        return !holidays?.includes(dayOfWeek);
      }
      return false;
    });
  }, [HospitalWithSlots, availability, selectedDate]);

  console.log("filteredHospitals", filteredHospitals)


  // Mock data - replace with actual API call
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr Jamal',
      type: 'Consultant',
      price: 1500,
      availableSlots: ['07:00 PM', '07:05 PM', '07:10 PM'],
      status: 'available',
    },
    {
      id: '2',
      name: 'Alam Dr & Physio',
      type: 'Consultant',
      price: 449,
      availableSlots: ['06:30 PM', '07:00 PM', '07:30 PM'],
      status: 'available',
    },
  ]);

  useEffect(() => {
    generateDateList(dateListStartDate);
  }, [dateListStartDate]);

  const generateDateList = useCallback((startDate: Date) => {
    const dates: DateItem[] = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      dates.push({
        date,
        day: dayNames[date.getDay()],
        dayNum: date.getDate(),
        month: monthNames[date.getMonth()],
      });
    }
    setDateList(dates);
  }, []);

  const onDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(moment(date));
      setDateListStartDate(date); // Only regenerate date list when calendar picker is used
      // Filter availability for the new date
      filterAvailabilityForDate(moment(date), allAvailabilityData);
    }
  }, [allAvailabilityData, filterAvailabilityForDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(moment(date));
    // Filter availability for the selected date
    filterAvailabilityForDate(moment(date), allAvailabilityData);
  }, [allAvailabilityData, filterAvailabilityForDate]);

  const renderDateItem = useCallback(({ item }: { item: DateItem }) => {
    const isSelected = isSameDate(item.date, selectedDate.toDate());
    const today = isToday(item.date);

    return (
      <TouchableOpacity
        style={[styles.dateCard, isSelected && styles.dateCardActive]}
        onPress={() => handleDateSelect(item.date)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
          {today ? 'Today' : item.day}
        </Text>
        <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>
          {item.dayNum}
        </Text>
        <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
          {item.month}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedDate, handleDateSelect]);

  const handleSlotSelection = useCallback((doctorId: string, slot: string) => {
    setSelectedSlots(prev => ({
      ...prev,
      [doctorId]: slot,
    }));
  }, []);

  const renderDoctorCard = useCallback(({ item }: { item: Doctor }) => {
    const selectedSlot = selectedSlots[item.id] || null;

    return (
      <View style={styles.doctorCard}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorImageWrapper}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.doctorImage} />
              ) : (
                <Ionicons name="person-circle" size={50} color="#00A79D" />
              )}
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorLabel}>Care provider</Text>
              <Text style={styles.doctorName}>{item.name}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>{item.type} Price</Text>
            <Text style={styles.priceValue}>
              <Text style={styles.priceCurrency}>SAR</Text>
              {item.price}
            </Text>
          </View>
        </View>

        {item.status === 'available' && (
          <View style={styles.slotsSection}>
            <View style={styles.slotHeader}>
              <Ionicons name="time-outline" size={20} color="#00A79D" />
              <Text style={styles.slotHeaderText}>Select Visit Time</Text>
            </View>
            <View style={styles.slotsContainer}>
              <TouchableOpacity style={styles.slotArrow}>
                <Ionicons name="chevron-back" size={20} color="#6D7A80" />
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slotsList}
              >
                {item.availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotButton,
                      selectedSlot === slot && styles.slotButtonActive,
                    ]}
                    onPress={() => handleSlotSelection(item.id, slot)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.slotButtonText,
                        selectedSlot === slot && styles.slotButtonTextActive,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.slotArrow}>
                <Ionicons name="chevron-forward" size={20} color="#6D7A80" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {item.status === 'booked' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Booked</Text>
          </View>
        )}

        {item.status === 'unavailable' && (
          <View style={[styles.statusBadge, styles.statusBadgeUnavailable]}>
            <Text style={styles.statusText}>Unavailable</Text>
          </View>
        )}
      </View>
    );
  }, [selectedSlots, handleSlotSelection]);

  // Helper function to check if item has available future slots
  const hasAvailableSlots = useCallback((slots: any[]) => {
    if (!slots || slots.length === 0) return false;

    return slots.some((s: any) => {
      if (!s.available) return false;

      const currentDate = new Date();
      const slotDate = new Date(s.date);
      const slotTime = s.start_time;

      const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (!timeMatch) return false;

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3]?.toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      return slotDateTime > currentDate;
    });
  }, []);

  const handleSelectService = (providerId: string, service: string) => {
    const obj: any = {
      selectedService: service,
      providerId: providerId,
    }

    setSelectedService(obj)
  }

  const handleSelectSlot = useCallback((provider: any, slot: any, selectedServiceValues?: any) => {
    console.log("SelectedCardItem", selectedCardItem)
    const serviceId = selectedCardItem[0]?.CatServiceId
    if (provider.ServiceServe.length == 1) {
      handleSelectService(provider.UserId, provider.ServiceServe[0].ServiceTitlePlang);
    } else if (selectedServiceValues) {
      const isAutoSelected = provider.ServiceServe.find((item: any) => item.Id == selectedServiceValues.Id);
      if (isAutoSelected) {
        handleSelectService(provider.UserId, isAutoSelected.ServiceTitlePlang);
      } else {
        setShowServiceModal(true)
      }
    } else {
      const isAutoSelected = provider.ServiceServe.find((item: any) => item.Id == serviceId);
      if (isAutoSelected) {
        handleSelectService(provider.UserId, isAutoSelected.ServiceTitlePlang);
      } else {
        setShowServiceModal(true)
      }
    }
    // }
    // If the same slot is already selected, deselect it
    if (selectedSlotInfo?.providerId === provider.UserId && selectedSlotInfo?.slotTime === slot.start_time) {
      setSelectedSlotInfo(null);
    } else {
      // Select the new slot (this will automatically deselect the previous one)
      setSelectedSlotInfo({
        providerId: provider.UserId,
        slotTime: slot.start_time
      });
    }
  }, [selectedSlotInfo, existingCardItems]);

  const handleSelectHospitalSlot = (hospital: any, slot: any) => {
    if (selectedSlotInfo?.OrganizationId === hospital.OrganizationId && selectedSlotInfo?.slotTime === slot.start_time) {
      setSelectedSlotInfo(null);
    } else {
      // Select the new slot (this will automatically deselect the previous one)
      setSelectedSlotInfo({
        OrganizationId: hospital.OrganizationId,
        slotTime: slot.start_time
      });
    }
  }

  const getNextButtonEnabled = useCallback(() => {
   

    if (displayCategory?.Display == "CP") {
      return selectedCardItem[0]?.CatServiceId == 0 || selectedCardItem[0]?.CatServiceId == null || selectedCardItem[0]?.CatServiceId == "" || selectedCardItem[0]?.CatServiceId == undefined || selectedCardItem[0]?.ServiceProviderUserloginInfoId == 0 || selectedCardItem[0]?.ServiceProviderUserloginInfoId == null || selectedCardItem[0]?.ServiceProviderUserloginInfoId == "" || selectedCardItem[0]?.ServiceProviderUserloginInfoId == undefined
    } else {
      return selectedCardItem[0]?.OrganizationId == null || selectedCardItem[0]?.OrganizationId == "" || selectedCardItem[0]?.OrganizationId == undefined
    }
  }, [selectedSlotInfo, existingCardItems, selectedCardItem])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Calendar Button */}
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={24} color="#00A79D" />
          <Text style={styles.calendarButtonText}>
            {selectedDate.locale('en').format('MMMM YYYY')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6D7A80" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate.toDate() || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Date Selection Row */}
        <FlatList
          horizontal
          data={dateList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderDateItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />

        {/* City and District Dropdowns */}
        <View style={styles.filtersRow}>
          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>City</Text>
            <TouchableOpacity style={styles.dropdown} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{selectedCity}</Text>
              <Ionicons name="chevron-down" size={18} color="#6D7A80" />
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>District</Text>
            <TouchableOpacity style={styles.dropdown} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{selectedDistrict}</Text>
              <Ionicons name="chevron-down" size={18} color="#6D7A80" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Near Me Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setSearchNearMe(!searchNearMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, searchNearMe && styles.checkboxActive]}>
            {searchNearMe && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Search Doctors near me</Text>
        </TouchableOpacity>

        {/* Doctor Type Selection */}
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedType('All')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedType === 'All' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedType('Consultant')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedType === 'Consultant' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Consultant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedType('Specialist')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedType === 'Specialist' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Specialist</Text>
          </TouchableOpacity>
        </View>

        {/* Affiliation Selection */}
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedAffiliation('All')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedAffiliation === 'All' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedAffiliation('Affiliated')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedAffiliation === 'Affiliated' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Affiliated with Organization</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => setSelectedAffiliation('Individual')}
            activeOpacity={0.7}
          >
            <View style={styles.radioOuter}>
              {selectedAffiliation === 'Individual' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Individual</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={24} color="#6D7A80" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={24} color="#6D7A80" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={24} color="#6D7A80" />
          </TouchableOpacity>
        </View>

        {/* Results Count and Status Filter */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>(4) results found for Doctor Visit</Text>
        </View>

        <View style={styles.statusFilters}>
          <TouchableOpacity
            style={[styles.statusFilter, selectedFilter === 'unavailable' && styles.statusFilterActive]}
            onPress={() => setSelectedFilter('unavailable')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, styles.statusDotUnavailable]} />
            <Text style={styles.statusFilterText}>Unavailable</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusFilter, selectedFilter === 'booked' && styles.statusFilterActive]}
            onPress={() => setSelectedFilter('booked')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, styles.statusDotBooked]} />
            <Text style={styles.statusFilterText}>Booked</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusFilter, selectedFilter === 'available' && styles.statusFilterActive]}
            onPress={() => setSelectedFilter('available')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, styles.statusDotAvailable]} />
            <Text style={styles.statusFilterText}>Available</Text>
          </TouchableOpacity>
        </View>

        {/* Doctor List */}
        {loading ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#00A79D" />
          </View>
        ) : (
          <View style={{ flex: 1, paddingBottom: 50, }}>
            {
              displayCategory?.Display == "CP" ?
                <FlatList
                  data={filteredProviders}
                  keyExtractor={(item) => item.RowId}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={5}
                  windowSize={10}
                  initialNumToRender={3}
                  ListEmptyComponent={
                    (loading || loader2 || slotsLoaded) ? (
                      <ListShimmerLoader cardType="default" />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                          No results found
                        </Text>
                      </View>
                    )
                  }
                  onRefresh={fetchData}
                  refreshing={refreshing}
                  renderItem={({ item, index }) => {
                    const providerAvailability = availability.flatMap(avail =>
                      avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
                    );

                    // Check if item has available slots, return null if not
                    if (!hasAvailableSlots(item.slots)) {
                      return null;
                    }

                    return <ServiceProviderCard
                      provider={item}
                      selectedDate={selectedDate}
                      availability={providerAvailability[0]}
                      selectedSlotInfo={selectedSlotInfo}
                      onSelectSlot={handleSelectSlot}
                      onSelectService={handleSelectService}
                      selectedService={selectedService}
                    // userFavorites={userFavorites}
                    // getUserFavorites={getUserFavorites}
                    />
                  }}
                  contentContainerStyle={{ padding: 16 }}
                  showsVerticalScrollIndicator={false}
                />
                :
                <FlatList
                  data={filteredHospitals}
                  keyExtractor={(item) => item.UserId}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={5}
                  onRefresh={fetchData}
                  refreshing={refreshing}
                  windowSize={10}
                  initialNumToRender={3}
                  ListEmptyComponent={
                    (loading || loader2 || slotsLoaded) ? (
                      <ListShimmerLoader cardType="default" />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                          No results found
                        </Text>
                      </View>
                    )
                  }
                  renderItem={({ item, index }) => {
                    const providerAvailability = availability.flatMap(avail =>
                      avail.Detail.filter((detail: any) => detail.OrganizationId === item.OrganizationId)
                    );

                    // Check if item has available slots, return null if not
                    if (!hasAvailableSlots(item.slots)) {
                      return null;
                    }

                    return <HospitalCard
                      hospital={item}
                      selectedDate={selectedDate}
                      availability={providerAvailability[0]}
                      selectedSlotInfo={selectedSlotInfo}
                      onSelectSlot={handleSelectHospitalSlot}
                      selectedService={selectedService}
                    />
                  }}
                  contentContainerStyle={{ padding: 16 }}
                  showsVerticalScrollIndicator={false}
                />
            }
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity disabled={getNextButtonEnabled()} onPress={() => handleNext()} style={[styles.nextButton, getNextButtonEnabled() ? styles.disabledNextButton : {}]} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Step2DoctorListing;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F4F3',
  },
  container: {
    flex: 1,
    backgroundColor: '#E6F4F3',
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  // Calendar Button
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2E7E4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0E3C47',
  },
  // Date List
  dateList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0EAEA',
  },
  dateCardActive: {
    backgroundColor: '#00A79D',
    borderColor: '#00A79D',
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6D7A80',
    marginBottom: 4,
  },
  dateDayActive: {
    color: '#FFFFFF',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E3C47',
    marginBottom: 2,
  },
  dateNumberActive: {
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6D7A80',
  },
  dateMonthActive: {
    color: '#FFFFFF',
  },
  // Filters Row
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E3C47',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2E7E4',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#384B56',
  },
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00A79D',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#00A79D',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#384B56',
  },
  // Radio Groups
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00A79D',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A79D',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#384B56',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0EAEA',
  },
  // Results Header
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#384B56',
  },
  // Status Filters
  statusFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0EAEA',
  },
  statusFilterActive: {
    borderColor: '#00A79D',
    backgroundColor: '#E0F5F2',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusDotUnavailable: {
    backgroundColor: '#D1D5DB',
  },
  statusDotBooked: {
    backgroundColor: '#FFA500',
  },
  statusDotAvailable: {
    backgroundColor: '#00A79D',
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#384B56',
  },
  // Doctor List
  doctorList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  doctorHeader: {
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E0F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6D7A80',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E3C47',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#384B56',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00A79D',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7A80',
  },
  // Slots Section
  slotsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0EAEA',
    paddingTop: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#384B56',
    marginLeft: 6,
  },
  slotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotArrow: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotsList: {
    paddingHorizontal: 4,
  },
  slotButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00A79D',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  slotButtonActive: {
    backgroundColor: '#00A79D',
  },
  slotButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A79D',
  },
  slotButtonTextActive: {
    color: '#FFFFFF',
  },
  // Status Badge
  statusBadge: {
    borderTopWidth: 1,
    borderTopColor: '#E0EAEA',
    paddingTop: 12,
    alignItems: 'center',
  },
  statusBadgeUnavailable: {
    opacity: 0.6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7A80',
  },
  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButton: {
    borderRadius: 12,
    backgroundColor: '#00A79D',
    paddingVertical: 16,
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
});
