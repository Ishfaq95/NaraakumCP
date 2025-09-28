import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';

interface DropdownItem {
  label: string;
  value: string | number;
}

interface DropdownProps {
  data: DropdownItem[];
  value: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
  placeholder?: string;
  containerStyle?: any;
  labelStyle?: any;
  dropdownStyle?: any;
  itemStyle?: any;
  itemTextStyle?: any;
  selectedItemStyle?: any;
  selectedItemTextStyle?: any;
  disabled?: boolean;
  error?: boolean;
}

const DropdownWithCheckbox: React.FC<DropdownProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select',
  containerStyle,
  labelStyle,
  dropdownStyle,
  itemStyle,
  itemTextStyle,
  selectedItemStyle,
  selectedItemTextStyle,
  disabled,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Array<string | number>>(value || []);

  // keep internal state in sync
  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const toggleValue = (val: string | number) => {
    setSelectedValues(prev => {
      const exists = prev.includes(val);
      const nextValues = exists ? prev.filter(v => v !== val) : [...prev, val];
      onChange(nextValues);
      return nextValues;
    });
  };

  const selectedLabels = useMemo(() => {
    if (!selectedValues?.length) return '';
    const labels = data.filter(d => selectedValues.includes(d.value)).map(d => d.label);
    return labels.join(', ');
  }, [selectedValues, data]);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.dropdownButton, dropdownStyle, error && styles.dropdownButtonError]}
        onPress={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownButtonText, labelStyle]} numberOfLines={1}>
          {selectedLabels || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <FlatList
              data={data}
              keyExtractor={(item) => item?.value?.toString()}
              showsVerticalScrollIndicator
              renderItem={({ item }) => {
                const checked = selectedValues.includes(item.value);
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      itemStyle,
                      checked && [styles.selectedItem, selectedItemStyle],
                    ]}
                    onPress={() => toggleValue(item.value)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemRow}>
                      <Icon
                        name={checked ? 'checkbox-outline' : 'square-outline'}
                        size={22}
                        color={checked ? '#179c8e' : '#999'}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          styles.itemText,
                          itemTextStyle,
                          checked && [styles.selectedItemText, selectedItemTextStyle],
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={
                <TouchableOpacity style={styles.doneButton} onPress={() => setIsOpen(false)}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 44,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  dropdownButtonError: {
    borderColor: 'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalContent: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#f8f8f8',
  },
  itemText: {
    ...globalTextStyles.bodySmall,
    color: '#333',
  },
  selectedItemText: {
    ...globalTextStyles.bodySmall,
    color: '#179c8e',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  doneButton: {
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#20B2AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DropdownWithCheckbox; 