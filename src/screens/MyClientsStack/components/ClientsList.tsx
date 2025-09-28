import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface ClientItem {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  rating: number;
  ratingCount: number;
  avatar?: string;
}

const MOCK_DATA: ClientItem[] = [
  { id: '1', name: 'المريض أحمد علي خان', gender: 'Female', rating: 4.5, ratingCount: 21 },
  { id: '2', name: 'دادوديب', gender: 'Male', rating: 5.0, ratingCount: 6 },
];

const ClientCard: React.FC<{ item: ClientItem } & { onMore?: () => void; onBook?: () => void }> = ({ item, onMore, onBook }) => {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* <Image
          source={ item.avatar ? { uri: item.avatar } : require('../../../assets/icons/avatar-placeholder.png') }
          style={styles.avatar}
        /> */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.gender}>{item.gender}</Text>
            <FontAwesome name="star" size={14} color="#FFC107" style={{ marginHorizontal: 6 }} />
            <Text style={styles.rating}>{item.rating.toFixed(2)}</Text>
            <Text style={styles.ratingCount}>({item.ratingCount} Person)</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Ionicons name="stethoscope-outline" size={18} color="#00A19D" />
          <Text style={styles.bookText}>Book a Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton} onPress={onMore}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
          <Text style={styles.moreText}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ClientsList: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  React.useEffect(() => {
    onCountChange && onCountChange(MOCK_DATA.length);
  }, [onCountChange]);

  return (
    <FlatList
      data={MOCK_DATA}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 8 }}
      renderItem={({ item }) => <ClientCard item={item} />}
    />
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
});

export default ClientsList;


