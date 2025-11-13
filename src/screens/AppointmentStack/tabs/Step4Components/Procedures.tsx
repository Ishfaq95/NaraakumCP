import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Dropdown from '../../../../components/common/Dropdown';
import { globalTextStyles } from '../../../../styles/globalStyles';

export interface ProceduresData {
  procedureId?: string;
  comments?: string;
}

interface ProceduresProps {
  data?: ProceduresData;
  onDataChange?: (data: ProceduresData) => void;
}

const PROCEDURE_OPTIONS = [
  { label: 'Select an option', value: '' },
  { label: 'Dental Cleaning', value: 'dental_cleaning' },
  { label: 'Root Canal Treatment', value: 'root_canal' },
  { label: 'Tooth Extraction', value: 'tooth_extraction' },
  { label: 'Cavity Filling', value: 'cavity_filling' },
];

const Procedures: React.FC<ProceduresProps> = ({ data, onDataChange }) => {
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Procedures</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Procedure</Text>
        <View style={styles.dropdownWrapper}>
          <Dropdown
            data={PROCEDURE_OPTIONS}
            value={selectedProcedure}
            placeholder="Select an option"
            onChange={(value) => setSelectedProcedure(value as string)}
            containerStyle={styles.dropdownContainer}
            dropdownStyle={styles.dropdownInner}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Comments</Text>
        <View style={styles.commentCard}>
          <TextInput
            style={styles.commentInput}
            placeholder="Procedures"
            placeholderTextColor="#9ba0a5"
            multiline
            value={comments}
            onChangeText={setComments}
          />
          <TouchableOpacity style={styles.commentAction}>
            <Icon name="pencil" size={18} color="#6f7c82" />
          </TouchableOpacity>
        </View>
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
  fieldContainer: {
    marginBottom: 20,
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
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 110,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce5e4',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentInput: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
  commentAction: {
    marginLeft: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f2f6f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Procedures;


