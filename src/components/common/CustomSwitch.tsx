import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange, disabled = false, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      style={[styles.switchBase, value ? styles.switchOn : styles.switchOff, disabled && styles.switchDisabled, style]}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </TouchableOpacity>
  );
};

const SWITCH_WIDTH = 66;
const SWITCH_HEIGHT = 33;
const KNOB_SIZE = 29;

const styles = StyleSheet.create({
  switchBase: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    padding: 2,
    borderWidth: 1,
    borderColor: '#b2d3d3',
  },
  switchOn: {
    backgroundColor: '#32a8ad', // teal
    borderColor: '#32a8ad',
  },
  switchOff: {
    backgroundColor: '#d3d3d3',
    borderColor: '#b2d3d3',
  },
  switchDisabled: {
    opacity: 0.5,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    // left/right handled below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  knobOn: {
    right: 2,
  },
  knobOff: {
    left: 2,
  },
});

export default CustomSwitch; 