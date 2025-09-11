import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { I18nManager } from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';

interface DropdownItem {
  label: string;
  value: string | number;
}

interface DropdownProps {
  data: DropdownItem[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  containerStyle?: any;
  labelStyle?: any;
  dropdownStyle?: any;
  itemStyle?: any;
  itemTextStyle?: any;
  selectedItemStyle?: any;
  selectedItemTextStyle?: any;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select an option',
  containerStyle,
  labelStyle,
  dropdownStyle,
  itemStyle,
  itemTextStyle,
  selectedItemStyle,
  selectedItemTextStyle,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  // Sync selectedValue with value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Reset selectedValue if current value doesn't exist in new data
  useEffect(() => {
    const valueExists = data.some(item => item.value === selectedValue);
    if (!valueExists && data.length > 0) {
      // If current value doesn't exist in new data, set to first item
      const newValue = data[0].value;
      setSelectedValue(newValue);
      onChange(newValue);
    }
  }, [data, selectedValue, onChange]);

  const handleSelect = (item: DropdownItem) => {
    setSelectedValue(item.value);
    onChange(item.value);
    setIsOpen(false);
  };

  const selectedItem = data.find(item => item.value === selectedValue);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.dropdownButton, dropdownStyle]}
        onPress={() => {
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
      >
        <Text style={[styles.dropdownButtonText, labelStyle]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        {/* <View style={[styles.arrow, I18nManager.isRTL && styles.arrowRTL]} /> */}
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
            <FlatList
              data={data}
              showsVerticalScrollIndicator={true}
              keyExtractor={(item) => item?.value?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    itemStyle,
                    item.value === selectedValue && [styles.selectedItem, selectedItemStyle],
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      itemTextStyle,
                      item.value === selectedValue && [styles.selectedItemText, selectedItemTextStyle],
                    ]}
                  >
                    {item?.label}
                  </Text>
                </TouchableOpacity>
              )}
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
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#666',
    transform: [{ rotate: '0deg' }],
  },
  arrowRTL: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems:'flex-start'
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
});

export default Dropdown; 