import React, { useEffect, useState } from 'react';
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
  medications?: string;
  instructions?: string;
}

interface PrescriptionProps {
  onDataChange?: (data: PrescriptionData) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const Prescription: React.FC<PrescriptionProps> = ({ onDataChange }) => {
  const [medications, setMedications] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...globalTextStyles.h5, color: '#1a3c40' }}>Medicines List</Text>
          <TouchableOpacity style={{ backgroundColor: '#179c8e', padding: 10, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add Medicines</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <FlatList
            data={medications}
            renderItem={({ item }) => <Text>{item}</Text>}
            keyExtractor={(item) => item.toString()}
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


