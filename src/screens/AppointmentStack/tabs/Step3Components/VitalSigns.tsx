import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

interface VitalSignsProps {
  data?:any;
  onDataChange?: (data: any) => void;
}

const VitalSigns: React.FC<VitalSignsProps> = ({ data, onDataChange }) => {
  const [temperature, setTemperature] = useState( '0');
  const [heartRate, setHeartRate] = useState('0');
  const [p4O2, setP4O2] = useState('0');
  const [respiratoryRate, setRespiratoryRate] = useState('0');
  const [bloodPressure, setBloodPressure] = useState('120/80');

  useEffect(() => {
    setTemperature(data?.[0]?.Tem || '0');
    setHeartRate(data?.[0]?.HR || '0');
    setP4O2(data?.[0]?.P4O2 || '0');
    setRespiratoryRate(data?.[0]?.RR || '0');
    setBloodPressure(data?.[0]?.Bp || '120/80');
  }, [data]);

  const handleChange = (field: string, value: string) => {
    const updatedData = {
      temperature,
      heartRate,
      p4O2,
      respiratoryRate,
      bloodPressure,
      [field]: value,
    };

    switch (field) {
      case 'temperature':
        setTemperature(value);
        break;
      case 'heartRate':
        setHeartRate(value);
        break;
      case 'p4O2':
        setP4O2(value);
        break;
      case 'respiratoryRate':
        setRespiratoryRate(value);
        break;
      case 'bloodPressure':
        setBloodPressure(value);
        break;
    }

    console.log("updatedData==>", updatedData);

    let tempData = [{
      ...data?.[0],
      Tem: updatedData.temperature,
      HR: updatedData.heartRate,
      P4O2: updatedData.p4O2,
      RR: updatedData.respiratoryRate,
      Bp: updatedData.bloodPressure,
    }];

    if (onDataChange) {
      onDataChange(tempData);
    }
  };

  const renderField = (label: string, value: string, field: string, keyboardType: 'default' | 'numeric' = 'numeric') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => handleChange(field, text)}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {renderField('Tem', temperature, 'temperature')}
      {renderField('H/R', heartRate, 'heartRate')}
      {renderField('P4 O2', p4O2, 'p4O2')}
      {renderField('R/R', respiratoryRate, 'respiratoryRate')}
      {renderField('Bp', bloodPressure, 'bloodPressure', 'default')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...globalTextStyles.bodySmall,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});

export default VitalSigns;

