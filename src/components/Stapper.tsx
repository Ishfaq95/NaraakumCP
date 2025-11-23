import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckIcon from '../assets/icons/CheckIcon';
import { globalTextStyles } from '../styles/globalStyles';

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
    marginVertical: 14,
    justifyContent: 'center'
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0'
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
    ...globalTextStyles.bodyMedium,
    color: '#888',
    fontFamily: globalTextStyles.h5.fontFamily
  },
  line: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0'
  }
});

export default Stepper; 