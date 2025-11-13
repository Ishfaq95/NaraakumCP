import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalTextStyles } from '../../../styles/globalStyles';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepPress: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, onStepPress }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <TouchableOpacity
              style={styles.stepContainer}
              onPress={() => onStepPress(stepNumber)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.activeStepCircle,
                  isCompleted && styles.completedStepCircle,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isActive && styles.activeStepNumber,
                    isCompleted && styles.completedStepNumber,
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>
            </TouchableOpacity>
            {stepNumber < totalSteps && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.completedStepLine,
                ]}
              />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f0f8f7',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepCircle: {
    borderColor: '#179c8e',
    backgroundColor: '#fff',
  },
  completedStepCircle: {
    borderColor: '#179c8e',
    backgroundColor: '#179c8e',
  },
  stepNumber: {
    ...globalTextStyles.bodyMedium,
    color: '#999',
    fontWeight: '600',
  },
  activeStepNumber: {
    color: '#179c8e',
    fontWeight: '700',
  },
  completedStepNumber: {
    color: '#fff',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d0d0d0',
    marginHorizontal: 8,
  },
  completedStepLine: {
    backgroundColor: '#179c8e',
  },
});

export default Stepper;

