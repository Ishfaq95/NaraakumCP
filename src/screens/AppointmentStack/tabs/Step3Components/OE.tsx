import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalTextStyles } from '../../../../styles/globalStyles';
import BottomSheet from '../../../../components/BottomSheet';
import { Dimensions } from 'react-native';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';
import { useSelector } from 'react-redux';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SubListItem {
  Id: string;
  Title: string;
  InputRequired: boolean;
}

interface SubItem {
  Id: string;
  Title: string;
  SubList?: SubListItem[];
  InputRequired?: boolean;
}

interface MainItem {
  Id: string;
  Title: string;
  SubItem: SubItem[];
}

interface OEProps {
  data?: any;
  onDataChange?: (data: any) => void;
}

const OE: React.FC<OEProps> = ({ data, onDataChange }) => {
  const [selectedMainItem, setSelectedMainItem] = useState<MainItem | null>(null);
  const [bodyAnatomy, setBodyAnatomy] = useState<any>([]);
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  // const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>(
  //   data || {}
  // );
  const [expandedSubItems, setExpandedSubItems] = useState<{ [key: string]: boolean }>({});
  // const [customItems, setCustomItems] = useState<{ [subItemId: string]: Array<{ id: string; title: string; value: string; checked: boolean }> }>(
  //   data || {}
  // );
  const [showAddOther, setShowAddOther] = useState<{ [key: string]: boolean }>({});
  const [newCustomTitle, setNewCustomTitle] = useState<{ [key: string]: string }>({});
  const [newCustomValue, setNewCustomValue] = useState<{ [key: string]: string }>({});
  const bottomSheetRef = useRef<any>(null);

  // useEffect(() => {
  //   if (onDataChange) {
  //     onDataChange({
  //       selectedItems,
  //       customItems,
  //     });
  //   }
  // }, [selectedItems, customItems]);

  useEffect(() => {
    if (visitmainId) {
      getBodyAnatomy();
    }
  }, [visitmainId]);

  const getBodyAnatomy = async () => {
    try {
      const payload = {
        VisitMainId: visitmainId,
      }
      const response = await addVisitRecordService.getVisitPatientBodyAnatomy(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setBodyAnatomy(response?.Data);
      }
    } catch (error: any) {
    }
  };
  const handleMainItemPress = (item: MainItem) => {
    setSelectedMainItem(item);
    setExpandedSubItems({});
    bottomSheetRef.current?.show();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const toggleSubItem = (subItemId: string) => {
    setExpandedSubItems(prev => ({
      ...prev,
      [subItemId]: !prev[subItemId]
    }));
  };

  const toggleCheckbox = (itemId: string) => {
    // setSelectedItems(prev => ({
    //   ...prev,
    //   [itemId]: !prev[itemId]
    // }));
  };

  const toggleCustomItemCheckbox = (subItemId: string, customItemId: string) => {
    // setCustomItems(prev => {
    //   const subItemCustoms = prev[subItemId] || [];
    //   return {
    //     ...prev,
    //     [subItemId]: subItemCustoms.map(item =>
    //       item.id === customItemId ? { ...item, checked: !item.checked } : item
    //     )
    //   };
    // });
  };

  const handleShowAddOther = (subItemId: string) => {
    setShowAddOther(prev => ({
      ...prev,
      [subItemId]: true
    }));
    setNewCustomTitle(prev => ({ ...prev, [subItemId]: '' }));
    setNewCustomValue(prev => ({ ...prev, [subItemId]: '' }));
  };

  const handleAddCustomItem = (subItemId: string) => {
    const title = newCustomTitle[subItemId]?.trim();
    const value = newCustomValue[subItemId]?.trim();

    if (title) {
      const newItem = {
        id: `custom-${Date.now()}`,
        title: title,
        value: value || '',
        checked: true
      };

      // setCustomItems(prev => ({
      //   ...prev,
      //   [subItemId]: [...(prev[subItemId] || []), newItem]
      // }));

      setNewCustomTitle(prev => ({ ...prev, [subItemId]: '' }));
      setNewCustomValue(prev => ({ ...prev, [subItemId]: '' }));
      setShowAddOther(prev => ({ ...prev, [subItemId]: false }));
    }
  };

  const handleSave = () => {
    handleCloseBottomSheet();
  };

  const renderCheckbox = (item: SubListItem | SubItem) => {
    const isExist = data?.find((atom: any) => atom.CatBodyAnatomyId == item.Id);
    let isChecked = false;
    if (isExist) {
      isChecked = true;
    } else {
      isChecked = false;
    }

    // const isChecked = false;
    return (
      <View key={item.Id}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleCheckbox(item.Id)}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>{item.Title}</Text>
        </TouchableOpacity>
        {
          (isExist && isExist.InputValue) && (
            <TextInput
                      style={styles.addOtherFormInput}
                      placeholder="title"
                      placeholderTextColor="#999"
                      value={isExist.InputValue || ''}
                      onChangeText={(text) => {}}
                    />
          )
        }
      </View>

    );
  };

  const renderSubItem = (subItem: SubItem) => {
    const hasSubList = subItem.SubList && subItem.SubList.length > 0;
    const isExpanded = expandedSubItems[subItem.Id];
    const isShowingAddOther = showAddOther[subItem.Id];
    const customItemsList = [];

    if (!hasSubList && subItem.InputRequired) {
      // Direct checkbox without accordion
      return renderCheckbox(subItem);
    }

    // Accordion style
    return (
      <View key={subItem.Id} style={styles.accordionContainer}>
        <TouchableOpacity
          style={[
            styles.accordionHeader,
            isExpanded && styles.accordionHeaderExpanded
          ]}
          onPress={() => toggleSubItem(subItem.Id)}
        >
          <Text style={[
            styles.accordionTitle,
            isExpanded && styles.accordionTitleExpanded
          ]}>
            {subItem.Title}
          </Text>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={isExpanded ? "#179c8e" : "#666"}
          />
        </TouchableOpacity>

        {isExpanded && hasSubList && (
          <View style={styles.accordionContent}>
            {/* Regular checkboxes */}
            {subItem.SubList!.map(item => renderCheckbox(item))}

            {/* Custom items */}
            {/* {customItemsList.map(customItem => (
              <View key={customItem.id} style={styles.customCheckboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => toggleCustomItemCheckbox(subItem.Id, customItem.id)}
                >
                  <View style={[styles.checkbox, customItem.checked && styles.checkboxChecked]}>
                    {customItem.checked && <Icon name="checkmark" size={16} color="#fff" />}
                  </View>
                  <View style={styles.customCheckboxContent}>
                    <Text style={styles.checkboxLabel}>{customItem.title}</Text>
                    {customItem.value && (
                      <Text style={styles.customCheckboxValue}>{customItem.value}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))} */}

            {/* Add Other Input Form */}
            {isShowingAddOther && (
              <View style={styles.addOtherFormContainer}>
                <View style={styles.addOtherFormRow}>
                  <View style={[styles.checkbox, styles.checkboxChecked]}>
                    <Icon name="checkmark" size={16} color="#fff" />
                  </View>
                  <View style={styles.addOtherFormInputs}>
                    <TextInput
                      style={styles.addOtherFormInput}
                      placeholder="title"
                      placeholderTextColor="#999"
                      value={newCustomTitle[subItem.Id] || ''}
                      onChangeText={(text) => setNewCustomTitle(prev => ({ ...prev, [subItem.Id]: text }))}
                    />
                    <TextInput
                      style={styles.addOtherFormInput}
                      placeholder="value"
                      placeholderTextColor="#999"
                      value={newCustomValue[subItem.Id] || ''}
                      onChangeText={(text) => setNewCustomValue(prev => ({ ...prev, [subItem.Id]: text }))}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Add Other Button */}
            <TouchableOpacity
              style={styles.addOtherButton}
              onPress={() => {
                if (isShowingAddOther) {
                  handleAddCustomItem(subItem.Id);
                } else {
                  handleShowAddOther(subItem.Id);
                }
              }}
            >
              <Text style={styles.addOtherButtonText}>
                {isShowingAddOther ? 'Save' : 'Add Other'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderBottomSheetContent = () => {
    if (!selectedMainItem) return null;

    return (
      <View style={styles.bottomSheetContainer}>
        {/* Header */}
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{selectedMainItem.Title}</Text>
          <TouchableOpacity onPress={handleCloseBottomSheet}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedMainItem.SubItem.map(subItem => renderSubItem(subItem))}
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {bodyAnatomy?.map((item: any) => (
          <TouchableOpacity
            key={item.Id}
            style={styles.mainItemRow}
            onPress={() => handleMainItemPress(item)}
          >
            <Text style={styles.mainItemText}>{item.Title}</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        height={SCREEN_HEIGHT * 0.75}
        sheetBackgroundColor="#fff"
        radius={16}
        draggable={false}
        onClose={handleCloseBottomSheet}
      >
        {renderBottomSheetContent()}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mainItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mainItemText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontWeight: '500',
  },
  bottomSheetContainer: {
    flex: 1,
    paddingTop: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    ...globalTextStyles.h5,
    color: '#333',
    fontWeight: '600',
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  accordionContainer: {
    marginBottom: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accordionHeaderExpanded: {
    borderColor: '#179c8e',
    backgroundColor: '#f0f8f7',
  },
  accordionTitle: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  accordionTitleExpanded: {
    color: '#179c8e',
    fontWeight: '600',
  },
  accordionContent: {
    backgroundColor: '#f0f8f7',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e0e0e0',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#179c8e',
    borderColor: '#179c8e',
  },
  checkboxLabel: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    flex: 1,
  },
  customCheckboxContainer: {
    marginBottom: 8,
  },
  customCheckboxContent: {
    flex: 1,
  },
  customCheckboxValue: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    marginTop: 2,
    fontSize: 12,
  },
  addOtherFormContainer: {
    marginBottom: 8,
  },
  addOtherFormRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addOtherFormInputs: {
    flex: 1,
    gap: 8,
  },
  addOtherFormInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...globalTextStyles.bodySmall,
    color: '#333',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  addOtherButton: {
    backgroundColor: '#179c8e',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addOtherButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#179c8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  saveButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OE;
