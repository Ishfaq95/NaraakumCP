import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';

interface CommonRadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const CommonRadioButton: React.FC<CommonRadioButtonProps> = ({ selected, onPress, label, disabled = false, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onPress()}
      style={[styles.container, selected && styles.selectedContainer, disabled && styles.disabledContainer, style]}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      
      <View style={[styles.radio, selected && styles.radioSelected, disabled && styles.radioDisabled]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.label, selected && styles.selectedLabel, disabled && styles.disabledLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const RADIO_SIZE = 22;
const DOT_SIZE = 10;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
    minHeight: 40,
  },
  selectedContainer: {
    backgroundColor: '#23a2a4',
    borderColor: '#23a2a4',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  label: {
    ...globalTextStyles.bodyMedium,
    color: '#222',
    fontFamily: globalTextStyles.h5.fontFamily,
    marginLeft: 10,
    marginRight: 0,
  },
  selectedLabel: {
    color: '#fff',
  },
  disabledLabel: {
    color: '#888',
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    borderColor: '#b2d3d3',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 0,
  },
  radioSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb22',
  },
  radioDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  radioDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#2563eb',
  },
});

export default CommonRadioButton; 