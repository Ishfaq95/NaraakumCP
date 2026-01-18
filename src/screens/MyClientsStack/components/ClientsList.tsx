import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Platform, TextInput, Keyboard, ScrollView, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ClientCard from './ClientCard';
import { useDispatch, useSelector } from 'react-redux';
import { myClientsService } from '../../../services/api/myClientsService';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { ROUTES } from '../../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import LoaderKit from 'react-native-loader-kit';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { addCardItem, setSelectedLocation } from '../../../shared/redux/reducers/bookingReducer';

const ClientsList: React.FC<{ onCountChange?: (n: number) => void, setIsLoading?: (isLoading: boolean) => void }> = ({ onCountChange, setIsLoading }) => {
  const [clientList, setClientList] = useState<any[]>([]);
  const user = useSelector((state: any) => state.root.user.user);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isMoreOptionsBottomSheetVisible, setIsMoreOptionsBottomSheetVisible] = useState(false);
  const navigation = useNavigation();
  const [searchBottomSheetVisible, setSearchBottomSheetVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [bottomSheetHeight, setBottomSheetHeight] = useState('35%');
  const [filteredClientList, setFilteredClientList] = useState<any[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    getClients();
  }, []);

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

  const getClients = async () => {
    setIsLoading?.(true);
    try {
      const payload = {
        UserloginInfoId: user.Id,
      };
      const response = await myClientsService.getClientsByServiceProvider(payload);
      if (response.ResponseStatus.STATUSCODE === 200) {
        setClientList(response.list);
        setFilteredClientList(response.list);
      }
    } catch (error) {
    } finally {
      setIsLoading?.(false);
    }
  };

  const onMoreOptionsPress = (item: any) => {
    setIsMoreOptionsBottomSheetVisible(true);
    setSelectedClient(item);
  };

  const onDirectBookServicePress = (item: any) => {
    setIsMoreOptionsBottomSheetVisible(false);
    dispatch(addCardItem([]))
    dispatch(setSelectedLocation(null))
    navigation.navigate(ROUTES.BookNewService as never, { Patient: item });
  };

  const onBookServicePress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    dispatch(addCardItem([]))
    dispatch(setSelectedLocation(null))
    navigation.navigate(ROUTES.BookNewService as never, { Patient: selectedClient });
  };

  const onBookingHistoryPress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.BookingHistory as never, { Patient: selectedClient });
  };

  const onPrescriptionsPress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.PrescriptionListScreen as never, { Patient: selectedClient });
  };

  const onSendMessagePress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    Keyboard.dismiss();
    setSearchBottomSheetVisible(false);
    if (searchText.length > 0) {
      setFilteredClientList(clientList.filter((item) => item.FullnamePlang?.toLowerCase().includes(searchText.toLowerCase())) || []);
    } else {
      setFilteredClientList(clientList);
    }
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    if(searchText.length > 0) {
      setSearchText('');
      setFilteredClientList(clientList);
    }
    setSearchBottomSheetVisible(false);
  };


  return (
    <View style={{ flex: 1 }}>
      {/* Row 2: results count + search button */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredClientList.length} Results</Text>
        <TouchableOpacity style={styles.searchButton} onPress={() => setSearchBottomSheetVisible(true)}>
          {searchText.length > 0 ? <Ionicons name="close" size={18} color={'#00A19D'} /> : <Ionicons name="search" size={18} color={'#00A19D'} />}
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredClientList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => <ClientCard item={item} onMore={(item) => onMoreOptionsPress(item)} onBook={(item) => onDirectBookServicePress(item)} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients found</Text>
          </View>
        }
      />

      <CustomBottomSheet
        visible={isMoreOptionsBottomSheetVisible}
        onClose={() => setIsMoreOptionsBottomSheetVisible(false)}
        showHandle={false}
        maxHeight="35%"
        backdropClickable={true}
      >
        <View style={styles.bottomSheetContent}>
          <TouchableOpacity onPress={() => onBookServicePress()} style={styles.menuItem}>
            <FontAwesome name="stethoscope" size={20} color="#00A19D" />
            <Text style={styles.menuText}>Book a Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity onPress={() => onPrescriptionsPress()} style={styles.menuItem}>

            <Image source={require('../../../assets/images/prescriptions.png')} style={styles.icon} resizeMode="contain" />
            <Text style={styles.menuText}>Prescriptions</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity onPress={() => onSendMessagePress()} style={styles.menuItem}>
            <Image
              source={require('../../../assets/images/messages.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>Send Message</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.menuItem} onPress={() => onBookingHistoryPress()}>
            <Image source={require('../../../assets/images/bookingHistory.png')} style={styles.icon} resizeMode="contain" />
            <Text style={styles.menuText}>Booking History</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>

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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e9ecef',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  gender: {
    fontSize: 13,
    color: '#6b7280',
  },
  rating: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookText: {
    color: '#00A19D',
    fontWeight: '600',
    marginLeft: 6,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    color: '#666',
    marginLeft: 6,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#e4f1ef',
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
  resultsText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#111827',
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#191919',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 32,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#00A19D',
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
});

export default ClientsList;


