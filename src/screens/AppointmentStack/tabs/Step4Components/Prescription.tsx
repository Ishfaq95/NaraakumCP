import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface PrescriptionData {
  Id?: number;
  VisitMainId?: number;
  CatDrugTypeId?: number;
  Title?: string;
  MedicineName?: string;
  Description?: string;
  Quantity?: string;
  Dose?: string;
  CatMedicineUnitId?: number;
  Unit?: string;
  CatFrequencyId?: number;
  Frequency?: string;
  CatRouteId?: number;
  Route?: string;
  Duration?: string;
  CatTimeUnitId?: number;
  TimeUnitSlang?: string;
  TimeUnitPlang?: string;
}

interface PrescriptionProps {
  data?: PrescriptionData[];
  onDataChange?: (data: PrescriptionData[]) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const Prescription: React.FC<PrescriptionProps> = ({ data, onDataChange }) => {
  const [medications, setMedications] = useState<PrescriptionData[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once from backend data, or update when data actually changes from backend
    if (data) {
      setMedications(data);
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
    }
  }, [data]);

  const renderMedicineItem = ({ item }: { item: PrescriptionData }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Medicine:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40', flex: 1, textAlign: 'right' }}>
          {item.MedicineName || '-'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Type:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>{item.Title || '-'}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Dose:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>
          {item.Dose} {item.Unit}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Frequency:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>{item.Frequency || '-'}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Duration:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>
          {item.Duration} {item.TimeUnitPlang}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Route:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>{item.Route || '-'}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={{ ...globalTextStyles.bodyMedium, color: '#1a3c40' }}>{item.Quantity || '-'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...globalTextStyles.h5, color: '#1a3c40' }}>Medicines List</Text>
          <TouchableOpacity style={{ backgroundColor: '#179c8e', padding: 10, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add Medicines</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex:1, marginTop: 12}}>
          <FlatList
            data={medications}
            renderItem={renderMedicineItem}
            keyExtractor={(item) => item.Id?.toString() || Math.random().toString()}
            ListEmptyComponent={<View style={{flex:1,marginTop: '30%', justifyContent: 'center', alignItems: 'center'}}><Text style={{...globalTextStyles.bodyMedium, color: '#1a3c40'}}>No medicines added</Text></View>}
            scrollEnabled={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...globalTextStyles.h5,
    color: '#1a3c40',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce5e4',
    padding: 16,
    marginBottom: 16,
  },
  label: {
    ...globalTextStyles.bodySmall,
    color: '#1a2c32',
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
});

export default Prescription;


