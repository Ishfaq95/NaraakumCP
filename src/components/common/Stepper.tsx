import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
    activeColor?: string;
    inactiveColor?: string;
    barHeight?: number;
    barWidth?: number;
    spacing?: number;
}

const Stepper: React.FC<StepperProps> = ({
    currentStep,
    totalSteps,
    activeColor = '#20B2AA', // Teal color
    inactiveColor = '#E0E0E0', // Light gray
    barHeight = 4,
    barWidth = 60,
    spacing = 12,
}) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const isActive = index < currentStep;
                return (
                    <View
                        key={index}
                        style={[
                            styles.bar,
                            {
                                width: barWidth,
                                height: barHeight,
                                backgroundColor: isActive ? activeColor : inactiveColor,
                                marginRight: index < totalSteps - 1 ? spacing : 0,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bar: {
        borderRadius: 2,
    },
});

export default Stepper;
