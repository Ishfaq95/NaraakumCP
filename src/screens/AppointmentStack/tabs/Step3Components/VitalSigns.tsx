import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

type VitalSignField = 'temperature' | 'heartRate' | 'p4O2' | 'respiratoryRate' | 'bloodPressure';

const numericFieldConstraints: Record<
  Exclude<VitalSignField, 'bloodPressure'>,
  { label: string; min: number; max: number }
> = {
  temperature: { label: 'Tem', min: 2, max: 5 },
  heartRate: { label: 'H/R', min: 2, max: 3 },
  p4O2: { label: 'P4 O2', min: 2, max: 3 },
  respiratoryRate: { label: 'R/R', min: 1, max: 2 },
};

interface VitalSignsProps {
  data?: any;
  onDataChange?: (data: any) => void;
}

const VitalSigns: React.FC<VitalSignsProps> = ({ data, onDataChange }) => {
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [p4O2, setP4O2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [errors, setErrors] = useState<Partial<Record<VitalSignField, string>>>({});

  const toStringValue = (value: any) =>
    value === undefined || value === null ? '' : String(value);

  useEffect(() => {
    setTemperature(toStringValue(data?.[0]?.Tem));
    setHeartRate(toStringValue(data?.[0]?.HR));
    setP4O2(toStringValue(data?.[0]?.P4O2));
    setRespiratoryRate(toStringValue(data?.[0]?.RR));
    setBloodPressure(toStringValue(data?.[0]?.Bp));
  }, [data]);

  const syncData = (updatedField: VitalSignField, value: string) => {
    const updatedData = {
      temperature,
      heartRate,
      p4O2,
      respiratoryRate,
      bloodPressure,
      [updatedField]: value,
    };

    switch (updatedField) {
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

    const tempData = [
      {
        ...data?.[0],
        Tem: updatedData.temperature,
        HR: updatedData.heartRate,
        P4O2: updatedData.p4O2,
        RR: updatedData.respiratoryRate,
        Bp: updatedData.bloodPressure,
      },
    ];

    if (onDataChange) {
      onDataChange(tempData);
    }
  };

  const clearFieldError = (field: VitalSignField) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setFieldError = (field: VitalSignField, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const sanitizeNumericValue = (value: string, maxLength: number) =>
    value.replace(/\D/g, '').slice(0, maxLength);

  const handleNumericFieldChange = (field: Exclude<VitalSignField, 'bloodPressure'>, rawValue: string) => {
    const constraint = numericFieldConstraints[field];
    const sanitized = sanitizeNumericValue(rawValue, constraint.max);
    if (errors[field] && sanitized.length >= constraint.min) {
      clearFieldError(field);
    }
    syncData(field, sanitized);
  };

  const handleNumericFieldBlur = (field: Exclude<VitalSignField, 'bloodPressure'>) => {
    const constraint = numericFieldConstraints[field];
    const valueMap = {
      temperature,
      heartRate,
      p4O2,
      respiratoryRate,
    };
    const value = valueMap[field];
    if (!value) {
      clearFieldError(field);
      return;
    }

    if (value.length < constraint.min) {
      setFieldError(field, `${constraint.label} requires at least ${constraint.min} ${constraint.min > 1 ? 'digits' : 'digit'}.`);
    } else {
      clearFieldError(field);
    }
  };

  const formatBloodPressure = (rawValue: string) => {
    // Remove all non-digits and limit to 5 digits (3 for systolic, 2 for diastolic)
    const digits = rawValue.replace(/\D/g, '').slice(0, 5);
    if (digits.length === 0) {
      return '';
    }
    // If 3 digits or less, just return the digits
    if (digits.length <= 3) {
      return digits;
    }
    // If 4 or 5 digits, format as XXX/XX (systolic/diastolic)
    return `${digits.slice(0, 3)}/${digits.slice(3)}`;
  };

  const handleBloodPressureChange = (value: string) => {
    const formatted = formatBloodPressure(value);
    const digitsCount = formatted.replace(/\D/g, '').length;
    // Clear error if user has entered valid format (5 digits with slash)
    if (errors.bloodPressure && digitsCount === 5 && formatted.includes('/')) {
      clearFieldError('bloodPressure');
    }
    syncData('bloodPressure', formatted);
  };

  const handleBloodPressureBlur = () => {
    const digitsCount = bloodPressure.replace(/\D/g, '').length;
    if (digitsCount === 0) {
      clearFieldError('bloodPressure');
      return;
    }
    
    // Accept 5 digits (3+2 format like 120/80) or 6 digits (3+3 format like 120/080)
    if ((digitsCount !== 5 && digitsCount !== 6) || !bloodPressure.includes('/')) {
      setFieldError('bloodPressure', 'Enter BP in 120/80 format.');
      return;
    }

    // Parse systolic and diastolic values
    const parts = bloodPressure.split('/');
    if (parts.length !== 2) {
      setFieldError('bloodPressure', 'Enter BP in 120/80 format.');
      return;
    }

    const systolic = parseInt(parts[0], 10);
    const diastolic = parseInt(parts[1], 10);

    // Validate ranges
    if (isNaN(systolic) || isNaN(diastolic)) {
      setFieldError('bloodPressure', 'Enter BP in 120/80 format.');
      return;
    }

    if (systolic < 60 || systolic > 200) {
      setFieldError(
        'bloodPressure',
        'Please enter a valid BP value. Systolic should be between 60 and 200, Diastolic between 40 and 120.'
      );
      return;
    }

    if (diastolic < 40 || diastolic > 120) {
      setFieldError(
        'bloodPressure',
        'Please enter a valid BP value. Systolic should be between 60 and 200, Diastolic between 40 and 120.'
      );
      return;
    }

    // All validations passed
    clearFieldError('bloodPressure');
  };

  const renderField = (
    label: string,
    value: string,
    field: VitalSignField,
    onChange: (text: string) => void,
    onBlur?: () => void,
    keyboardType: 'default' | 'numeric' = 'numeric',
    maxLength?: number
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        keyboardType={keyboardType}
        placeholder={field === 'bloodPressure' ? '123/123' : '0'}
        placeholderTextColor="#999"
        maxLength={maxLength}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.container, styles.content]}>
      {renderField(
        'Tem',
        temperature,
        'temperature',
        (text) => handleNumericFieldChange('temperature', text),
        () => handleNumericFieldBlur('temperature'),
        'numeric',
        numericFieldConstraints.temperature.max
      )}
      {renderField(
        'H/R',
        heartRate,
        'heartRate',
        (text) => handleNumericFieldChange('heartRate', text),
        () => handleNumericFieldBlur('heartRate'),
        'numeric',
        numericFieldConstraints.heartRate.max
      )}
      {renderField(
        'P4 O2',
        p4O2,
        'p4O2',
        (text) => handleNumericFieldChange('p4O2', text),
        () => handleNumericFieldBlur('p4O2'),
        'numeric',
        numericFieldConstraints.p4O2.max
      )}
      {renderField(
        'R/R',
        respiratoryRate,
        'respiratoryRate',
        (text) => handleNumericFieldChange('respiratoryRate', text),
        () => handleNumericFieldBlur('respiratoryRate'),
        'numeric',
        numericFieldConstraints.respiratoryRate.max
      )}
      {renderField(
        'Bp',
        bloodPressure,
        'bloodPressure',
        handleBloodPressureChange,
        handleBloodPressureBlur,
        'numeric',
        7
      )}
    </View>
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
  errorText: {
    color: '#d32f2f',
    marginTop: 4,
    fontSize: 12,
  },
});

export default VitalSigns;

