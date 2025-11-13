import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface NewServiceData {
  serviceName?: string;
  notes?: string;
}

interface NewServiceProps { 
  onDataChange?: (data: NewServiceData) => void;
}

const NewService: React.FC<NewServiceProps> = ({ onDataChange }) => {
  const [services, setServices] = useState<string[]>([]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...globalTextStyles.h5, color: '#1a3c40' }}>Orders List</Text>
        <TouchableOpacity style={{ backgroundColor: '#179c8e', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add Services</Text>
        </TouchableOpacity>
      </View>
      <View style={{flex:1}}>
        <FlatList
          data={services}
          renderItem={({ item }) => <Text>{item}</Text>}
          keyExtractor={(item) => item.toString()}
          ListEmptyComponent={<View style={{flex:1,marginTop: '30%', justifyContent: 'center', alignItems: 'center'}}><Text style={{...globalTextStyles.bodyMedium, color: '#1a3c40'}}>No services added</Text></View>}
        />
      </View>
    </ScrollView>
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
  singleLine: {
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
    borderWidth: 1,
    borderColor: '#dce5e4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
});

export default NewService;


