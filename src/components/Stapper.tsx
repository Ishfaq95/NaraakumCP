import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import CheckIcon from '../assets/icons/CheckIcon';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../styles/globalStyles';

const Stepper = ({ currentStep,steps, onStepPress }: { currentStep: number,steps: any, onStepPress: (step: number) => void }) => {
  return (
    <View style={styles.container}>
      {steps?.map((step:any, idx:any) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <React.Fragment key={step}>
            <TouchableOpacity disabled={step != 1} onPress={() => onStepPress(step)}>
            <View style={[
              styles.circle,
              isCompleted && styles.completed,
              isActive && styles.active
            ]}>
              {isCompleted ? (
                <CheckIcon width={20} height={20} />
              ) : (
                <Text style={[
                  styles.stepText,
                  isActive && { color: '#179c8e' }
                ]}>{step}</Text>
              )}
            </View>
            </TouchableOpacity>
            {idx < steps.length - 1 && (
              <View style={styles.line} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center'
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: '#eff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eff5f5'
  },
  completed: {
    backgroundColor: '#179c8e',
    borderColor: '#179c8e'
  },
  active: {
    borderColor: '#179c8e',
    backgroundColor: '#fff'
  },
  stepText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#666',
  },
  line: {
    width: '30%',
    height: 2,
    backgroundColor: '#e0e0e0'
  }
});

export default Stepper; 