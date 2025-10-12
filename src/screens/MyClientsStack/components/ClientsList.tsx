import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ClientCard from './ClientCard';
import { useSelector } from 'react-redux';
import { myClientsService } from '../../../services/api/myClientsService';

const ClientsList: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  const [clientList, setClientList] = useState<any[]>([]);
  const user = useSelector((state: any) => state.root.user.user);

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
        renderItem={({ item }) => <ClientCard item={item} />}
      />
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
});

export default ClientsList;


