import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import Dropdown from '../../../../components/common/Dropdown';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface ReferralData {
  referralType?: string;
  specialistName?: string;
  notes?: string;
}

interface ReferralConsultationProps {
  onDataChange?: (data: ReferralData) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const REFERRAL_TYPES = [
  { label: 'Select an option', value: '' },
  { label: 'In-house Referral', value: 'in_house' },
  { label: 'External Specialist', value: 'external' },
  { label: 'Follow-up Consultation', value: 'follow_up' },
];

const ReferralConsultation: React.FC<ReferralConsultationProps> = ({ onDataChange, scrollToInput }) => {
  const [referralType, setReferralType] = useState<string>('');
  const [specialistName, setSpecialistName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const specialistCardRef = useRef<View>(null);
  const notesCardRef = useRef<View>(null);

  const handleSpecialistFocus = () => {
    if (scrollToInput && specialistCardRef.current) {
      scrollToInput(specialistCardRef);
    }
  };

  const handleNotesFocus = () => {
    if (scrollToInput && notesCardRef.current) {
      scrollToInput(notesCardRef);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Referral / Consultation</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Referral Type</Text>
          <View style={styles.dropdownWrapper}>
            <Dropdown
              data={REFERRAL_TYPES}
              value={referralType}
              placeholder="Select an option"
              onChange={(value) => setReferralType(value as string)}
              containerStyle={styles.dropdownContainer}
              dropdownStyle={styles.dropdownInner}
            />
          </View>
        </View>

        <View ref={specialistCardRef} style={styles.card}>
          <Text style={styles.label}>Specialist Name</Text>
          <TextInput
            style={styles.singleLine}
            placeholder="Enter specialist or clinic name"
            placeholderTextColor="#9ba0a5"
            value={specialistName}
            onChangeText={setSpecialistName}
            onFocus={handleSpecialistFocus}
          />
        </View>

        <View ref={notesCardRef} style={styles.card}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Add additional notes for the referral"
            placeholderTextColor="#9ba0a5"
            value={notes}
            onChangeText={setNotes}
            onFocus={handleNotesFocus}
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
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce5e4',
    overflow: 'hidden',
  },
  dropdownContainer: {
    height: 48,
  },
  dropdownInner: {
    height: 48,
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

export default ReferralConsultation;


