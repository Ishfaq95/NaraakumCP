import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalTextStyles } from '../../../styles/globalStyles';
import Dropdown from '../../../components/common/Dropdown';

interface Step1Props {
  onNext: () => void;
  data?: {
    chiefComplaint?: string;
    presentIllness?: string;
    durationValue?: string;
    durationUnit?: string;
    otherComplaint?: string;
  };
  onDataChange?: (data: any) => void;
}

const Step1PatientComplaint: React.FC<Step1Props> = ({ onNext, data, onDataChange }) => {
  const [chiefComplaint, setChiefComplaint] = useState(data?.chiefComplaint || '');
  const [presentIllness, setPresentIllness] = useState(data?.presentIllness || '');
  const [durationValue, setDurationValue] = useState(data?.durationValue || '0');
  const [durationUnit, setDurationUnit] = useState(data?.durationUnit || 'Day');
  const [otherComplaint, setOtherComplaint] = useState(data?.otherComplaint || '');

  const durationOptions = [
    { label: 'Day', value: 'Day' },
    { label: 'Week', value: 'Week' },
    { label: 'Month', value: 'Month' },
    { label: 'Year', value: 'Year' },
  ];

  const handleNext = () => {
    if (onDataChange) {
      onDataChange({
        chiefComplaint,
        presentIllness,
        durationValue,
        durationUnit,
        otherComplaint,
      });
    }
    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Icon */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Icon name="medical" size={30} color="#179c8e" />
          </View>
          <Text style={styles.headerTitle}>Patient Complaint</Text>
        </View>

        {/* Chief Complaint */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Chief Complaint</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Chief Complaint"
              placeholderTextColor="#999"
              value={chiefComplaint}
              onChangeText={setChiefComplaint}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Present Illness */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Present Illness</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Description"
              placeholderTextColor="#999"
              value={presentIllness}
              onChangeText={setPresentIllness}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Duration Of Complaint */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Duration Of Complaint</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={styles.durationInput}
                placeholder="0"
                placeholderTextColor="#999"
                value={durationValue}
                onChangeText={setDurationValue}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.dropdownWrapper}>
              <Dropdown
                data={durationOptions}
                value={durationUnit}
                onChange={(value) => setDurationUnit(value as string)}
                placeholder="Select"
                // containerStyle={styles.dropdown}
                containerStyle={{ height: 44 }}
                dropdownStyle={[{ height: 44 }]}
              />
            </View>
          </View>
        </View>

        {/* Other Complaint */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Other Complaint</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Other Complaint"
              placeholderTextColor="#999"
              value={otherComplaint}
              onChangeText={setOtherComplaint}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>

      {/* Save / Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Save / Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f7f5',
    borderRadius: 25,
  },
  headerTitle: {
    ...globalTextStyles.h5,
    color: '#179c8e',
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textInput: {
    flex: 1,
    ...globalTextStyles.bodySmall,
    color: '#333',
    minHeight: 40,
    paddingVertical: 0,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationInputWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  durationInput: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    paddingVertical: 12,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f0f8f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: '#179c8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  nextButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
});

export default Step1PatientComplaint;

