import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomPhoneInput from './CustomPhoneInput';
import { globalTextStyles } from '../../styles/globalStyles';

const CustomPhoneInputDemo = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>({
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    dialCode: '+966',
    pattern: '## ### ####',
    maxLength: 9,
  });
  const [error, setError] = useState('');

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setError(''); // Clear error when user types
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
  };

  const validateAndSubmit = () => {
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length !== selectedCountry?.maxLength) {
      setError(`Phone number must be ${selectedCountry?.maxLength} digits for ${selectedCountry?.name}`);
      return;
    }

    // Phone number is valid
    Alert.alert(
      'Success!',
      `Phone number: ${selectedCountry?.dialCode} ${phoneNumber}\nCountry: ${selectedCountry?.name}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Number Input Demo</Text>
      
      <CustomPhoneInput
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        onCountryChange={handleCountryChange}
        placeholder="رقم الجوال"
        error={error}
        initialCountry={selectedCountry}
      />

      {selectedCountry && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Selected Country:</Text> {selectedCountry.name}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Dial Code:</Text> {selectedCountry.dialCode}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Pattern:</Text> {selectedCountry.pattern}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Max Length:</Text> {selectedCountry.maxLength} digits
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Text style={[styles.button, { color: '#fff' }]} onPress={validateAndSubmit}>
          Validate & Submit
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    ...globalTextStyles.h3,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    ...globalTextStyles.bodyMedium,
    marginBottom: 8,
    color: '#333',
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    ...globalTextStyles.bodyMedium,
    fontWeight: '600',
    overflow: 'hidden',
  },
});

export default CustomPhoneInputDemo; 