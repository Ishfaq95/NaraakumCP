import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalTextStyles } from '../../../../styles/globalStyles';
import Dropdown from '../../../../components/common/Dropdown';

interface DXItem {
  id: string;
  type: 'Provisional Dx' | 'Differential Dx';
  specialtyId: string;
  specialty: string;
  icd10Codes: Array<{ id: number; code: string; diagnosis: string }>;
}

interface Specialty {
  Id: number;
  Title: string;
}

interface ICD10Code {
  Id: number;
  CatDiagnosisSpecialtyId: number;
  Code: string;
  Diagnosis: string;
}

interface DXProps {
  data?: {
    items?: DXItem[];
  };
  specialties?: Specialty[]; // API data for specialties
  icd10Codes?: ICD10Code[]; // API data for ICD10 codes
  onDataChange?: (data: any) => void;
  onSpecialtySelected?: (specialtyId: number) => void; // Callback to fetch ICD10 codes
}

const DX: React.FC<DXProps> = ({ 
  data, 
  specialties = [], 
  icd10Codes = [], 
  onDataChange,
  onSpecialtySelected 
}) => {
  const [provisionalDxItems, setProvisionalDxItems] = useState<DXItem[]>(
    data?.items?.filter(item => item.type === 'Provisional Dx') || [
      {
        id: 'provisional-1',
        type: 'Provisional Dx',
        specialtyId: '',
        specialty: '',
        icd10Codes: [],
      },
    ]
  );

  const [differentialDxItems, setDifferentialDxItems] = useState<DXItem[]>(
    data?.items?.filter(item => item.type === 'Differential Dx') || [
      {
        id: 'differential-1',
        type: 'Differential Dx',
        specialtyId: '',
        specialty: '',
        icd10Codes: [],
      },
    ]
  );

  const [searchIcd10, setSearchIcd10] = useState<{ [key: string]: string }>({});
  const [searchDiagnosis, setSearchDiagnosis] = useState<{ [key: string]: string }>({});
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState<{ [key: string]: boolean }>({});
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState<{ [key: string]: boolean }>({});

  // Convert specialties to dropdown format
  const specialtyDropdownData = [
    { label: 'Select an option', value: '' },
    ...specialties.map(s => ({
      label: s.Title,
      value: s.Id.toString()
    }))
  ];

  // Group ICD10 codes by specialty ID
  const icd10CodesBySpecialty: { [key: string]: ICD10Code[] } = {};
  icd10Codes.forEach(code => {
    const specialtyId = code.CatDiagnosisSpecialtyId.toString();
    if (!icd10CodesBySpecialty[specialtyId]) {
      icd10CodesBySpecialty[specialtyId] = [];
    }
    icd10CodesBySpecialty[specialtyId].push(code);
  });

  const handleSpecialtyChange = (itemId: string, specialtyId: string, type: 'Provisional Dx' | 'Differential Dx') => {
    const specialty = specialties.find(s => s.Id.toString() === specialtyId);
    
    const updateFn = (prev: DXItem[]) =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, specialtyId, specialty: specialty?.Title || '', icd10Codes: [] }
          : item
      );
    
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(updateFn);
    } else {
      setDifferentialDxItems(updateFn);
    }
    
    // Clear search when specialty changes
    setSearchIcd10(prev => ({ ...prev, [itemId]: '' }));
    setSearchDiagnosis(prev => ({ ...prev, [itemId]: '' }));
    
    // Callback to fetch ICD10 codes for this specialty
    if (onSpecialtySelected && specialtyId) {
      onSpecialtySelected(parseInt(specialtyId));
    }
    
    notifyDataChange();
  };

  const addIcd10Code = (itemId: string, icd10: ICD10Code, type: 'Provisional Dx' | 'Differential Dx') => {
    const updateFn = (prev: DXItem[]) =>
      prev.map(item => {
        if (item.id === itemId) {
          // Check if code already exists
          if (item.icd10Codes.some(c => c.id === icd10.Id)) {
            return item;
          }
          return {
            ...item,
            icd10Codes: [...item.icd10Codes, { 
              id: icd10.Id, 
              code: icd10.Code, 
              diagnosis: icd10.Diagnosis 
            }],
          };
        }
        return item;
      });
    
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(updateFn);
    } else {
      setDifferentialDxItems(updateFn);
    }
    
    setSearchIcd10(prev => ({ ...prev, [itemId]: '' }));
    setShowIcd10Dropdown(prev => ({ ...prev, [itemId]: false }));
    notifyDataChange();
  };

  const addDiagnosis = (itemId: string, icd10: ICD10Code, type: 'Provisional Dx' | 'Differential Dx') => {
    const updateFn = (prev: DXItem[]) =>
      prev.map(item => {
        if (item.id === itemId) {
          // Check if diagnosis already exists
          if (item.icd10Codes.some(c => c.id === icd10.Id)) {
            return item;
          }
          return {
            ...item,
            icd10Codes: [...item.icd10Codes, { 
              id: icd10.Id, 
              code: icd10.Code, 
              diagnosis: icd10.Diagnosis 
            }],
          };
        }
        return item;
      });
    
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(updateFn);
    } else {
      setDifferentialDxItems(updateFn);
    }
    
    setSearchDiagnosis(prev => ({ ...prev, [itemId]: '' }));
    setShowDiagnosisDropdown(prev => ({ ...prev, [itemId]: false }));
    notifyDataChange();
  };

  const removeIcd10Code = (itemId: string, code: string, type: 'Provisional Dx' | 'Differential Dx') => {
    const updateFn = (prev: DXItem[]) =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            icd10Codes: item.icd10Codes.filter(c => c.code !== code),
          };
        }
        return item;
      });
    
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(updateFn);
    } else {
      setDifferentialDxItems(updateFn);
    }
    
    notifyDataChange();
  };

  const removeDiagnosis = (itemId: string, diagnosis: string, type: 'Provisional Dx' | 'Differential Dx') => {
    const updateFn = (prev: DXItem[]) =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            icd10Codes: item.icd10Codes.filter(c => c.diagnosis !== diagnosis),
          };
        }
        return item;
      });
    
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(updateFn);
    } else {
      setDifferentialDxItems(updateFn);
    }
    
    notifyDataChange();
  };

  const addMoreProvisionalDx = () => {
    const newItem: DXItem = {
      id: `provisional-${Date.now()}`,
      type: 'Provisional Dx',
      specialtyId: '',
      specialty: '',
      icd10Codes: [],
    };
    setProvisionalDxItems(prev => [...prev, newItem]);
    notifyDataChange();
  };

  const addMoreDifferentialDx = () => {
    const newItem: DXItem = {
      id: `differential-${Date.now()}`,
      type: 'Differential Dx',
      specialtyId: '',
      specialty: '',
      icd10Codes: [],
    };
    setDifferentialDxItems(prev => [...prev, newItem]);
    notifyDataChange();
  };

  const removeDxItem = (itemId: string, type: 'Provisional Dx' | 'Differential Dx') => {
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setDifferentialDxItems(prev => prev.filter(item => item.id !== itemId));
    }
    notifyDataChange();
  };

  const notifyDataChange = () => {
    if (onDataChange) {
      onDataChange({ items: [...provisionalDxItems, ...differentialDxItems] });
    }
  };

  const getFilteredIcd10Codes = (itemId: string): ICD10Code[] => {
    const allItems = [...provisionalDxItems, ...differentialDxItems];
    const item = allItems.find(i => i.id === itemId);
    if (!item || !item.specialtyId) return [];

    const codes = icd10CodesBySpecialty[item.specialtyId] || [];
    const search = searchIcd10[itemId]?.toLowerCase() || '';

    if (!search) return codes;

    return codes.filter(
      c =>
        c.Code.toLowerCase().includes(search) ||
        c.Diagnosis.toLowerCase().includes(search)
    );
  };

  const getFilteredDiagnoses = (itemId: string): ICD10Code[] => {
    const allItems = [...provisionalDxItems, ...differentialDxItems];
    const item = allItems.find(i => i.id === itemId);
    if (!item || !item.specialtyId) return [];

    const codes = icd10CodesBySpecialty[item.specialtyId] || [];
    const search = searchDiagnosis[itemId]?.toLowerCase() || '';

    if (!search) return codes;

    return codes.filter(c =>
      c.Diagnosis.toLowerCase().includes(search)
    );
  };

  const renderDxItem = (item: DXItem, index: number, showRemoveButton: boolean) => {
    const isDisabled = !item.specialtyId;

    return (
      <View key={item.id} style={styles.dxSection}>
        <View style={styles.dxHeader}>
          <Text style={styles.dxTitle}>{item.type}</Text>
          {showRemoveButton && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeDxItem(item.id, item.type)}
            >
              <MaterialCommunityIcons name="minus-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Specialty Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Specialty</Text>
          <Dropdown
            data={specialtyDropdownData}
            value={item.specialtyId}
            onChange={(value) => handleSpecialtyChange(item.id, value as string, item.type)}
            placeholder="Select an option"
          />
        </View>

        {/* ICD10 Code Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isDisabled && styles.disabledLabel]}>ICD10 Code</Text>

          {/* Selected Tags */}
          {item.icd10Codes.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.icd10Codes.map(code => (
                <View key={code.code} style={styles.tag}>
                  <Text style={styles.tagText}>{code.code}</Text>
                  <TouchableOpacity
                    onPress={() => removeIcd10Code(item.id, code.code, item.type)}
                    style={styles.tagClose}
                  >
                    <Icon name="close" size={14} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Search Input */}
          <TextInput
            style={[styles.input, isDisabled && styles.disabledInput]}
            value={searchIcd10[item.id] || ''}
            onChangeText={text => {
              setSearchIcd10(prev => ({ ...prev, [item.id]: text }));
              setShowIcd10Dropdown(prev => ({ ...prev, [item.id]: true }));
            }}
            onFocus={() => setShowIcd10Dropdown(prev => ({ ...prev, [item.id]: true }))}
            placeholder={isDisabled ? '' : 'Search ICD10 code'}
            placeholderTextColor="#999"
            editable={!isDisabled}
          />

          {/* Dropdown */}
          {showIcd10Dropdown[item.id] && !isDisabled && (
            <View style={styles.dropdownContainer}>
              <ScrollView
                style={styles.dropdownList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {getFilteredIcd10Codes(item.id).map(code => (
                  <TouchableOpacity
                    key={code.Id}
                    style={styles.dropdownItem}
                    onPress={() => addIcd10Code(item.id, code, item.type)}
                  >
                    <Text style={styles.dropdownItemText}>{code.Code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Diagnosis Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isDisabled && styles.disabledLabel]}>Diagnosis</Text>

          {/* Selected Tags */}
          {item.icd10Codes.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.icd10Codes.map(code => (
                <View key={code.diagnosis} style={styles.tag}>
                  <Text style={styles.tagText}>{code.diagnosis}</Text>
                  <TouchableOpacity
                    onPress={() => removeDiagnosis(item.id, code.diagnosis, item.type)}
                    style={styles.tagClose}
                  >
                    <Icon name="close" size={14} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Search Input */}
          <TextInput
            style={[styles.input, isDisabled && styles.disabledInput]}
            value={searchDiagnosis[item.id] || ''}
            onChangeText={text => {
              setSearchDiagnosis(prev => ({ ...prev, [item.id]: text }));
              setShowDiagnosisDropdown(prev => ({ ...prev, [item.id]: true }));
            }}
            onFocus={() => setShowDiagnosisDropdown(prev => ({ ...prev, [item.id]: true }))}
            placeholder={isDisabled ? '' : 'Search diagnosis'}
            placeholderTextColor="#999"
            editable={!isDisabled}
          />

          {/* Dropdown */}
          {showDiagnosisDropdown[item.id] && !isDisabled && (
            <View style={styles.dropdownContainer}>
              <ScrollView
                style={styles.dropdownList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {getFilteredDiagnoses(item.id).map(code => (
                  <TouchableOpacity
                    key={code.Id}
                    style={styles.dropdownItem}
                    onPress={() => addDiagnosis(item.id, code, item.type)}
                  >
                    <Text style={styles.dropdownItemText}>{code.Diagnosis}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Provisional Dx Section */}
      <View style={styles.sectionWrapper}>
        {provisionalDxItems.map((item, index) => 
          renderDxItem(item, index, index > 0)
        )}
        
        {/* Add More Dx Button for Provisional */}
        <TouchableOpacity style={styles.addMoreButton} onPress={addMoreProvisionalDx}>
          <Text style={styles.addMoreButtonText}>Add More Dx</Text>
        </TouchableOpacity>
      </View>

      {/* Differential Dx Section */}
      <View style={styles.sectionWrapper}>
        {differentialDxItems.map((item, index) => 
          renderDxItem(item, index, index > 0)
        )}
        
        {/* Add More Dx Button for Differential */}
        <TouchableOpacity style={styles.addMoreButton} onPress={addMoreDifferentialDx}>
          <Text style={styles.addMoreButtonText}>Add More Dx</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  dxSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dxTitle: {
    ...globalTextStyles.h6,
    color: '#333',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
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
  disabledLabel: {
    color: '#999',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...globalTextStyles.bodySmall,
    color: '#333',
    minHeight: 44,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    marginRight: 6,
  },
  tagClose: {
    padding: 2,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
  },
  addMoreButton: {
    backgroundColor: '#179c8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addMoreButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
});

export default DX;

