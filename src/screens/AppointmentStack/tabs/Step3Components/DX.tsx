import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalTextStyles } from '../../../../styles/globalStyles';
import Dropdown from '../../../../components/common/Dropdown';
import CustomBottomSheet from '../../../../components/common/CustomBottomSheet';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';

interface DXItem {
  id: string;
  type: 'Provisional Dx' | 'Differential Dx';
  specialtyId: string;
  specialty: string;
  icd10Codes: Array<{ id: number; code: string; diagnosis: string }>;
  relationVisitAndDiagnosisId?: number;
  visitMainId?: number;
  catDxType?: number;
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
  data?: any;
  onDataChange?: (data: any) => void;
  onSpecialtySelected?: (specialtyId: number) => void; // Callback to fetch ICD10 codes
}

const createDefaultDxItem = (type: 'Provisional Dx' | 'Differential Dx'): DXItem => ({
  id: type === 'Provisional Dx' ? 'provisional-1' : 'differential-1',
  type,
  specialtyId: '',
  specialty: '',
  icd10Codes: [],
  catDxType: type === 'Provisional Dx' ? 1 : 2,
});

const extractDetailCodes = (detail: any): { id: number | string; code: string; diagnosis: string } => ({
  id: detail?.CatICD10CodeId ?? detail?.Id ?? detail?.RelationVisitAndDiagnosisId ?? Math.random().toString(),
  code: detail?.Code ?? detail?.code ?? detail?.Diagnosis ?? '',
  diagnosis: detail?.Diagnosis ?? detail?.Diagnosis ?? detail?.Code ?? '',
});

const convertToDxItem = (
  entry: any,
  type: 'Provisional Dx' | 'Differential Dx'
): DXItem => {
  if (!entry) {
    return createDefaultDxItem(type);
  }

  if (entry?.type) {
    return {
      id: entry.id ?? (type === 'Provisional Dx' ? 'provisional-1' : 'differential-1'),
      type,
      specialtyId: entry.specialtyId ?? '',
      specialty: entry.specialty ?? '',
      icd10Codes: Array.isArray(entry.icd10Codes) ? entry.icd10Codes : [],
      relationVisitAndDiagnosisId: entry.RelationVisitAndDiagnosisId,
      visitMainId: entry.VisitMainId,
      catDxType: entry.catDxType ?? entry.CatDxType ?? (type === 'Provisional Dx' ? 1 : 2),
    };
  }

  const details = Array.isArray(entry.Detail) ? entry.Detail : [];
  const icd10Codes = details.map(extractDetailCodes);

  return {
    id: entry.RelationVisitAndDiagnosisId
      ? String(entry.RelationVisitAndDiagnosisId)
      : type === 'Provisional Dx'
        ? 'provisional-1'
        : 'differential-1',
    type,
    specialtyId: entry.CatDiagnosisSpecialtyId ? String(entry.CatDiagnosisSpecialtyId) : '',
    specialty: entry.DiagnosisSpecialtyTitle ?? entry.specialty ?? '',
    icd10Codes,
    relationVisitAndDiagnosisId: entry.RelationVisitAndDiagnosisId,
    visitMainId: entry.VisitMainId,
    catDxType: entry.CatDxType ?? (type === 'Provisional Dx' ? 1 : 2),
  };
};

const normalizeDiagnosisData = (value: any) => {
  const rawItems = Array.isArray(value)
    ? value
    : Array.isArray(value?.items)
      ? value.items
      : [];

  const provisionalItems: DXItem[] = [];
  const differentialItems: DXItem[] = [];

  rawItems.forEach((entry: any) => {
    const type =
      entry?.type === 'Differential Dx' || entry?.CatDxType === 2 || entry?.CatDxType === '2'
        ? 'Differential Dx'
        : 'Provisional Dx';

    const mapped = convertToDxItem(entry, type);
    if (type === 'Differential Dx') {
      differentialItems.push(mapped);
    } else {
      provisionalItems.push(mapped);
    }
  });

  if (!provisionalItems.length) {
    provisionalItems.push(createDefaultDxItem('Provisional Dx'));
  }
  if (!differentialItems.length) {
    differentialItems.push(createDefaultDxItem('Differential Dx'));
  }

  return {
    provisionalItems,
    differentialItems,
  };
};

const convertDxItemToApi = (item: DXItem) => ({
  RelationVisitAndDiagnosisId: item.relationVisitAndDiagnosisId,
  VisitMainId: item.visitMainId,
  CatDxType: item.catDxType,
  CatDiagnosisSpecialtyId: item.specialtyId ? Number(item.specialtyId) : undefined,
  DiagnosisSpecialtyTitle: item.specialty,
  Detail: item.icd10Codes.map(code => ({
    RelationVisitAndDiagnosisId: item.relationVisitAndDiagnosisId,
    CatICD10CodeId: code.id,
    Code: code.code,
    Diagnosis: code.diagnosis,
  })),
  type: item.type,
  specialtyId: item.specialtyId,
  specialty: item.specialty,
  icd10Codes: item.icd10Codes,
});

const DX: React.FC<DXProps> = ({ 
  data, 
  onDataChange,
  onSpecialtySelected 
}) => {
  const normalized = normalizeDiagnosisData(data);
  const [provisionalDxItems, setProvisionalDxItems] = useState<DXItem[]>(normalized.provisionalItems);
  const [differentialDxItems, setDifferentialDxItems] = useState<DXItem[]>(normalized.differentialItems);
  const initializedRef = useRef(false);
  const isInternalUpdateRef = useRef(false);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<ICD10Code[]>([]);

  useEffect(() => {
    getAllDiagnosisSpecialty();
  }, [data]);

  const getAllDiagnosisSpecialty = async () => {
    const response = await addVisitRecordService.getAllDiagnosisSpecialty();
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setSpecialties(response?.list);
    }
  };

  const [searchIcd10, setSearchIcd10] = useState<{ [key: string]: string }>({});
  const [searchDiagnosis, setSearchDiagnosis] = useState<{ [key: string]: string }>({});
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'icd10' | 'diagnosis' | null>(null);
  const [bottomSheetItemId, setBottomSheetItemId] = useState<string | null>(null);
  const [bottomSheetItemType, setBottomSheetItemType] = useState<DXItem['type'] | null>(null);

  const getICD10CodeDiagnosis = async (specialtyId: any) => {
    const payload = {
      CatDiagnosisSpecialtyId: specialtyId,
    };
    const response = await addVisitRecordService.getAllIcd10Codes(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      const newCodes = response?.Data || [];
      // Append new codes, avoiding duplicates based on Id
      setIcd10Codes(prevCodes => {
        const existingIds = new Set(prevCodes.map(c => c.Id));
        const uniqueNewCodes = newCodes.filter((c: ICD10Code) => !existingIds.has(c.Id));
        return [...prevCodes, ...uniqueNewCodes];
      });
    }
  };

  // Convert specialties to dropdown format
  const specialtyDropdownData = [
    { label: 'Select an option', value: '' },
    ...specialties.map(s => ({
      label: s.Title,
      value: s.Id.toString()
    }))
  ];

  const getSpecialtyOptions = (currentValue: string, currentLabel: string) => {
    const base = [...specialtyDropdownData];
    if (currentValue && !base.some(item => item.value === currentValue)) {
      base.unshift({
        label: currentLabel || 'Selected specialty',
        value: currentValue,
      });
    }
    return base;
  };

  // Group ICD10 codes by specialty ID
  const icd10CodesBySpecialty: { [key: string]: ICD10Code[] } = {};
  icd10Codes.forEach(code => {
    const specialtyId = code.CatDiagnosisSpecialtyId.toString();
    if (!icd10CodesBySpecialty[specialtyId]) {
      icd10CodesBySpecialty[specialtyId] = [];
    }
    icd10CodesBySpecialty[specialtyId].push(code);
  });

  const handleSpecialtyChange = async (itemId: string, specialtyId: string, type: 'Provisional Dx' | 'Differential Dx') => {
    const specialty = specialties.find(s => s.Id.toString() === specialtyId);
    await getICD10CodeDiagnosis(specialtyId);
    
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
    closeBottomSheet();
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
    closeBottomSheet();
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
  };

  const addMoreProvisionalDx = () => {
    const newItem: DXItem = {
      id: `provisional-${Date.now()}`,
      type: 'Provisional Dx',
      specialtyId: '',
      specialty: '',
      icd10Codes: [],
      catDxType: 1,
    };
    setProvisionalDxItems(prev => [...prev, newItem]);
  };

  const addMoreDifferentialDx = () => {
    const newItem: DXItem = {
      id: `differential-${Date.now()}`,
      type: 'Differential Dx',
      specialtyId: '',
      specialty: '',
      icd10Codes: [],
      catDxType: 2,
    };
    setDifferentialDxItems(prev => [...prev, newItem]);
  };

  const removeDxItem = (itemId: string, type: 'Provisional Dx' | 'Differential Dx') => {
    if (type === 'Provisional Dx') {
      setProvisionalDxItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setDifferentialDxItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const getDiagnosisPayload = () => [
    ...provisionalDxItems.map(convertDxItemToApi),
    ...differentialDxItems.map(convertDxItemToApi),
  ];

  const notifyDataChange = () => {
    if (onDataChange) {
      isInternalUpdateRef.current = true;
      onDataChange(getDiagnosisPayload());
      // Reset flag after a brief delay to allow React to process the update
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 100);
    }
  };

  const openBottomSheet = (type: 'icd10' | 'diagnosis', itemId: string, itemType: DXItem['type']) => {
    setBottomSheetType(type);
    setBottomSheetItemId(itemId);
    setBottomSheetItemType(itemType);
    setBottomSheetVisible(true);
  };

  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
    setBottomSheetType(null);
    setBottomSheetItemId(null);
    setBottomSheetItemType(null);
  };

  useEffect(() => {
    // Skip if this is an internal update (from user actions)
    if (isInternalUpdateRef.current) {
      return;
    }

    // Only initialize once on mount with external data
    if (!initializedRef.current) {
      initializedRef.current = true;
      const normalized = normalizeDiagnosisData(data);
      setProvisionalDxItems(normalized.provisionalItems);
      setDifferentialDxItems(normalized.differentialItems);

      // Fetch ICD10 codes for all pre-selected specialties
      const allItems = [...normalized.provisionalItems, ...normalized.differentialItems];
      const specialtyIds = allItems
        .map(item => item.specialtyId)
        .filter((id, index, self) => id && self.indexOf(id) === index); // unique, non-empty IDs

      specialtyIds.forEach(specialtyId => {
        getICD10CodeDiagnosis(specialtyId);
      });
    }
  }, [data]);

  // Notify parent of changes whenever items change (but skip on initial mount)
  useEffect(() => {
    if (initializedRef.current) {
      notifyDataChange();
    }
  }, [provisionalDxItems, differentialDxItems]);

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

  const getBottomSheetItems = () => {
    if (!bottomSheetType || !bottomSheetItemId) {
      return [];
    }
    return bottomSheetType === 'icd10'
      ? getFilteredIcd10Codes(bottomSheetItemId)
      : getFilteredDiagnoses(bottomSheetItemId);
  };

  const handleSelectBottomSheetItem = (code: ICD10Code) => {
    if (!bottomSheetItemId || !bottomSheetItemType || !bottomSheetType) {
      return;
    }

    if (bottomSheetType === 'icd10') {
      addIcd10Code(bottomSheetItemId, code, bottomSheetItemType);
    } else {
      addDiagnosis(bottomSheetItemId, code, bottomSheetItemType);
    }
  };

  const getBottomSheetSearchValue = () => {
    if (!bottomSheetType || !bottomSheetItemId) {
      return '';
    }
    return bottomSheetType === 'icd10'
      ? searchIcd10[bottomSheetItemId] || ''
      : searchDiagnosis[bottomSheetItemId] || '';
  };

  const handleBottomSheetSearchChange = (text: string) => {
    if (!bottomSheetType || !bottomSheetItemId) {
      return;
    }
    if (bottomSheetType === 'icd10') {
      setSearchIcd10(prev => ({ ...prev, [bottomSheetItemId]: text }));
    } else {
      setSearchDiagnosis(prev => ({ ...prev, [bottomSheetItemId]: text }));
    }
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
            data={getSpecialtyOptions(item.specialtyId, item.specialty)}
            value={item.specialtyId || ''}
            onChange={(value) => handleSpecialtyChange(item.id, value as string, item.type)}
            placeholder={item.specialty || 'Select an option'}
          />
        </View>

        {/* ICD10 Code Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isDisabled && styles.disabledLabel]}>ICD10 Code</Text>

          <TouchableOpacity
            style={[styles.inputWrapper, isDisabled && styles.disabledInput]}
            activeOpacity={0.7}
            onPress={() => !isDisabled && openBottomSheet('icd10', item.id, item.type)}
          >
            {item.icd10Codes.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.icd10Codes.map(code => (
                  <View key={code.code} style={styles.tag}>
                    <TouchableOpacity
                      onPress={() => removeIcd10Code(item.id, code.code, item.type)}
                      style={styles.tagCloseButton}
                    >
                      <Icon name="close" size={14} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.tagSeparator} />
                    <Text style={styles.tagText} numberOfLines={1}>
                      {code.code}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text
              style={styles.placeholderText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {searchIcd10[item.id] || 'Search ICD10 code'}
            </Text>
          </TouchableOpacity>

          {/* Dropdown */}
        </View>

        {/* Diagnosis Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isDisabled && styles.disabledLabel]}>Diagnosis</Text>

          <TouchableOpacity
            style={[styles.inputWrapper, isDisabled && styles.disabledInput]}
            activeOpacity={0.7}
            onPress={() => !isDisabled && openBottomSheet('diagnosis', item.id, item.type)}
          >
            {item.icd10Codes.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.icd10Codes.map(code => (
                  <View key={code.diagnosis} style={styles.tag}>
                    <TouchableOpacity
                      onPress={() => removeDiagnosis(item.id, code.diagnosis, item.type)}
                      style={styles.tagCloseButton}
                    >
                      <Icon name="close" size={14} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.tagSeparator} />
                    <Text style={styles.tagText} numberOfLines={1}>
                      {code.diagnosis}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text
              style={styles.placeholderText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {searchDiagnosis[item.id] || 'Search diagnosis'}
            </Text>
          </TouchableOpacity>

          {/* Dropdown */}
        </View>
      </View>
    );
  };

  const bottomSheetItems = getBottomSheetItems();
  const bottomSheetTitle =
    bottomSheetType === 'icd10'
      ? 'Select ICD10 Code'
      : bottomSheetType === 'diagnosis'
        ? 'Select Diagnosis'
        : '';

  return (
    <>
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
      <CustomBottomSheet
        visible={bottomSheetVisible}
        onClose={closeBottomSheet}
        maxHeight="70%"
        backdropClickable={true}
      >
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{bottomSheetTitle}</Text>
          <TouchableOpacity onPress={closeBottomSheet}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSheetSearchWrapper}>
          <TextInput
            style={styles.bottomSheetSearchInput}
            value={getBottomSheetSearchValue()}
            onChangeText={handleBottomSheetSearchChange}
            placeholder="Type to filter"
            placeholderTextColor="#999"
          />
        </View>
        {bottomSheetItems.length === 0 ? (
          <View style={styles.bottomSheetEmpty}>
            <Text style={styles.bottomSheetEmptyText}>No items found</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.bottomSheetList}
            keyboardShouldPersistTaps="handled"
          >
            {bottomSheetItems.map(code => (
              <TouchableOpacity
                key={code.Id}
                style={styles.bottomSheetItem}
                onPress={() => handleSelectBottomSheetItem(code)}
              >
                <Text style={styles.bottomSheetItemText}>
                  {bottomSheetType === 'icd10' ? code.Code : code.Diagnosis}
                </Text>
                {bottomSheetType === 'icd10' && (
                  <Text style={styles.bottomSheetItemSubText}>{code.Diagnosis}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </CustomBottomSheet>
    </>
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
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    overflow: 'hidden',
  },
  textInput: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    padding: 0,
    margin: 0,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  disabledTextInput: {
    color: '#999',
  },
  placeholderText: {
    ...globalTextStyles.bodySmall,
    color: '#999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
    width: '95%',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 28,
  },
  tagText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    marginLeft: 8,
    flexShrink: 1,
  },
  tagCloseButton: {
    padding: 4,
  },
  tagSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#ccc',
    marginHorizontal: 1,
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
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomSheetTitle: {
    ...globalTextStyles.h6,
    color: '#333',
  },
  bottomSheetSearchWrapper: {
    paddingBottom: 12,
  },
  bottomSheetSearchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...globalTextStyles.bodySmall,
    color: '#333',
  },
  bottomSheetList: {
    flex: 1,
  },
  bottomSheetItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetItemText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
  },
  bottomSheetItemSubText: {
    ...globalTextStyles.bodySmall,
    color: '#777',
    marginTop: 2,
  },
  bottomSheetEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetEmptyText: {
    ...globalTextStyles.bodySmall,
    color: '#777',
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

