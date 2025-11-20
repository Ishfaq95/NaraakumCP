import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ClientCard from './ClientCard';
import { useSelector } from 'react-redux';
import { myClientsService } from '../../../services/api/myClientsService';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { ROUTES } from '../../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';

const ClientsList: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  const [clientList, setClientList] = useState<any[]>([]);
  const user = useSelector((state: any) => state.root.user.user);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isMoreOptionsBottomSheetVisible, setIsMoreOptionsBottomSheetVisible] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    try {
      const payload = {
        UserloginInfoId: user.Id,
      };
      const response = await myClientsService.getClientsByServiceProvider(payload);
      if (response.ResponseStatus.STATUSCODE === 200) {
        setClientList(response.list);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onMoreOptionsPress = (item: any) => {
    setIsMoreOptionsBottomSheetVisible(true);
    setSelectedClient(item);
  };

  const onBookServicePress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.BookNewService as never, { Patient: selectedClient });
  };

  const onBookingHistoryPress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.BookingHistory as never, { Patient: selectedClient });
  };

  const onPrescriptionsPress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.PrescriptionListScreen as never,{Patient: selectedClient});
  };

  const onSendMessagePress = () => {
    setIsMoreOptionsBottomSheetVisible(false);
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Row 2: results count + search button */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{clientList.length} Results</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={18} color={'#00A19D'} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={clientList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => <ClientCard item={item} onMore={(item) => onMoreOptionsPress(item)} />}
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
          
            <FontAwesome5 name="file-prescription" size={20} color="#00A19D" />
            <Text style={styles.menuText}>Prescriptions</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity onPress={() => onSendMessagePress()} style={styles.menuItem}>
            {/* <Ionicons name="chatbubble" size={20} color="#00A19D" /> */}
            <Image
              source={require('../../../assets/icons/messageIcon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>Send Message</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => onBookingHistoryPress()}>
            <Entypo name="back-in-time" size={20} color="#00A19D" />
            <Text style={styles.menuText}>Booking History</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
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
    color: '#111827',
    fontWeight: '400',
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
});

export default ClientsList;


