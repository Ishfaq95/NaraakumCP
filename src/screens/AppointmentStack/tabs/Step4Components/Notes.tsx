import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface NotesData {
  notes?: string;
}

interface NotesProps {
  onDataChange?: (data: NotesData) => void;
}

const Notes: React.FC<NotesProps> = ({ onDataChange }) => {
  const [notes, setNotes] = useState<string>('');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Notes</Text>

<View style={styles.card}>
  <TextInput
        style={styles.textInput}
        placeholder="Notes"
        placeholderTextColor="#999"
        value={notes}
        onChangeText={setNotes}
        multiline
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
  },
  label: {
    ...globalTextStyles.bodySmall,
    color: '#1a2c32',
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 160,
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

export default Notes;


