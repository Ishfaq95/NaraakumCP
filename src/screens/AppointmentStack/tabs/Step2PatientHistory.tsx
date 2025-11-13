import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalTextStyles } from '../../../styles/globalStyles';
import { useSelector } from 'react-redux';
import { addVisitRecordService } from '../../../services/api/addVisitRecord';

interface Step2Props {
  onNext: () => void;
  onSkip: () => void;
}

interface HistoryItem {
  id: string;
  value: string;
  hasError: boolean;
}

const createHistoryItemsFromString = (value?: string): HistoryItem[] => {
  if (!value || typeof value !== 'string') {
    return [{ id: '1', value: '', hasError: false }];
  }

  const items = value
    .split('#')
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);

  if (!items.length) {
    return [{ id: '1', value: '', hasError: false }];
  }

  return items.map((entry, index) => ({
    id: `${index + 1}`,
    value: entry,
    hasError: false,
  }));
};

const Step2PatientHistory: React.FC<Step2Props> = ({
  onNext,
  onSkip,
}) => {
  const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  const [pastMedicalHistory, setPastMedicalHistory] = useState<HistoryItem[]>([
    { id: '1', value: '', hasError: false }
  ]);
  const [pastSurgicalHistory, setPastSurgicalHistory] = useState<HistoryItem[]>([
    { id: '1', value: '', hasError: false }
  ]);
  const [allergy, setAllergy] = useState<HistoryItem[]>([
    { id: '1', value: '', hasError: false }
  ]);
  const [currentMeds, setCurrentMeds] = useState<HistoryItem[]>([
    { id: '1', value: '', hasError: false }
  ]);
  const dataHydratedRef = useRef(false);

  useEffect(() => {
    if (dataHydratedRef.current) {
      return;
    }

    const patientHistory = visitRecordData?.PatientHistory;

    if (!patientHistory || !Array.isArray(patientHistory) || !patientHistory.length) {
      return;
    }

    const [historyData] = patientHistory;

    setPastMedicalHistory(createHistoryItemsFromString(historyData?.PMH));
    setPastSurgicalHistory(createHistoryItemsFromString(historyData?.PSH));
    setAllergy(createHistoryItemsFromString(historyData?.Allergy));
    setCurrentMeds(createHistoryItemsFromString(historyData?.CurrentMeds));

    dataHydratedRef.current = true;
  }, [visitRecordData]);

  const handleAddLine = (
    items: HistoryItem[],
    setItems: React.Dispatch<React.SetStateAction<HistoryItem[]>>
  ) => {
    const lastItem = items[items.length - 1];

    // Check if last item is empty
    if (!lastItem.value.trim()) {
      // Mark the last item with error
      const updatedItems = items.map((item, index) =>
        index === items.length - 1 ? { ...item, hasError: true } : item
      );
      setItems(updatedItems);
      return;
    }

    // Add new line
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      value: '',
      hasError: false,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveLine = (
    id: string,
    items: HistoryItem[],
    setItems: React.Dispatch<React.SetStateAction<HistoryItem[]>>
  ) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleTextChange = (
    id: string,
    text: string,
    items: HistoryItem[],
    setItems: React.Dispatch<React.SetStateAction<HistoryItem[]>>
  ) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, value: text, hasError: false } : item
    );
    setItems(updatedItems);
  };

  const handleNext = async () => {
    // onNext();
    const payload = {
      VisitMainId: visitmainId,
      PMH: pastMedicalHistory.map(item => item.value).join('#'),
      PSH: pastSurgicalHistory.map(item => item.value).join('#'),
      Allergy: allergy.map(item => item.value).join('#'),
      CurrentMeds: currentMeds.map(item => item.value).join('#'),
    }

    console.log("payload==>", payload);
    const response = await addVisitRecordService.addEditVisitPatientHistory(payload);
    if (response?.StatusCode?.STATUSCODE == 12005) {
      onNext();
    }
  };

  const renderSection = (
    title: string,
    items: HistoryItem[],
    setItems: React.Dispatch<React.SetStateAction<HistoryItem[]>>,
    placeholder: string
  ) => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddLine(items, setItems)}
          >
            <Icon name="add" size={18} color="#179c8e" />
            <Text style={styles.addButtonText}>Add Line</Text>
          </TouchableOpacity>
        </View>

        {items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.inputRow,
              item.hasError && styles.inputRowError,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={item.value}
              onChangeText={(text) => handleTextChange(item.id, text, items, setItems)}
            />
            <View style={styles.iconContainer}>
              {/* <TouchableOpacity style={styles.editIcon}>
                <Icon name="create-outline" size={20} color="#179c8e" />
              </TouchableOpacity> */}
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() => handleRemoveLine(item.id, items, setItems)}
                >
                  <MaterialCommunityIcons
                    name="minus-circle"
                    size={24}
                    color="#ff4444"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
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
            <MaterialCommunityIcons name="clipboard-text" size={30} color="#179c8e" />
          </View>
          <Text style={styles.headerTitle}>Patient History</Text>
        </View>

        {/* Past Medical History */}
        {renderSection(
          'Past Medical History',
          pastMedicalHistory,
          setPastMedicalHistory,
          'Past Medical History'
        )}

        {/* Past Surgical History */}
        {renderSection(
          'Past Surgical History',
          pastSurgicalHistory,
          setPastSurgicalHistory,
          'Past Surgical History'
        )}

        {/* Allergy */}
        {renderSection(
          'Allergy',
          allergy,
          setAllergy,
          'Allergy'
        )}

        {/* Current Meds */}
        {renderSection(
          'Current Meds',
          currentMeds,
          setCurrentMeds,
          'Current Meds'
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {/* <TouchableOpacity style={styles.backButton} onPress={onPrevious}>
          <Text style={styles.backButtonText}>Previous</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Save / Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#179c8e',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    ...globalTextStyles.bodySmall,
    color: '#333',
    paddingVertical: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    padding: 4,
  },
  removeIcon: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f0f8f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#179c8e',
  },
  backButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#179c8e',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1.5,
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
  skipButton: {
    flex: 0.8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  skipButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#666',
    fontWeight: '600',
  },
});

export default Step2PatientHistory;

