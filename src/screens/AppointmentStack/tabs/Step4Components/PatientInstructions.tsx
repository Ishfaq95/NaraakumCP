import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface PatientInstructionsData {
  instructions?: string;
}

interface PatientInstructionsProps {
  onDataChange?: (data: PatientInstructionsData) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const PatientInstructions: React.FC<PatientInstructionsProps> = ({ onDataChange, scrollToInput }) => {
  const [instructions, setInstructions] = useState<string>('');
  const instructionsCardRef = useRef<View>(null);

  const handleFocus = () => {
    if (scrollToInput && instructionsCardRef.current) {
      scrollToInput(instructionsCardRef);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Patient Instructions</Text>

        <View ref={instructionsCardRef} style={styles.card}>
          <TextInput
            style={styles.textInput}
            placeholder="Patient Instructions"
            placeholderTextColor="#999"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            onFocus={handleFocus}
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
  },
  label: {
    ...globalTextStyles.bodySmall,
    color: '#1a2c32',
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 140,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
  textInput: {
    flex: 1,
    ...globalTextStyles.bodySmall,
    color: '#333',
    minHeight: 40,
    paddingVertical: 0,
  },
});

export default PatientInstructions;


