import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalTextStyles } from '../../../styles/globalStyles';
import { useSelector } from 'react-redux';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepPress: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, onStepPress }) => {
  const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <TouchableOpacity
              style={[styles.stepContainer]}
              onPress={() => {
                if (!visitRecordData) {
                  setVisible(true);
                } else {
                  onStepPress(stepNumber);
                }
              }}
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

      <CustomBottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        backdropClickable={true}
        showHandle={false}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: 16, paddingVertical: 16}}>
            <Text style={{...globalTextStyles.buttonLarge, color: '#000'}}>Warning</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 16}}>
            <Text style={{...globalTextStyles.bodyMedium, color: '#000'}}>You need to save the Patient Complaint before moving to next step.</Text>
          </View>
          <View style={{width:100,alignSelf:'center',marginVertical: 16}}>
            <TouchableOpacity style={styles.bottomSheetButton} onPress={() => setVisible(false)}>
              <Text style={styles.bottomSheetButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
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
  bottomSheetContainer: {
    flex: 1,
  },
  bottomSheetButton: {
    backgroundColor: '#179c8e',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetButtonText: {
    ...globalTextStyles.buttonLarge,
    color: '#fff',
  },
});

export default Stepper;

