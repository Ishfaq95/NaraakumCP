import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AppointmentFilterProps {
  onAvailabilityChange: (isAvailable: boolean) => void;
  isAvailable: boolean;
}

const AppointmentFilter: React.FC<AppointmentFilterProps> = ({
  onAvailabilityChange,
  isAvailable,
}) => { 

  const handleToggleChange = (value: boolean) => {
    onAvailabilityChange(value);
  };

  return (
    <View style={styles.container}>
      {/* Availability Toggle */}
      <View style={styles.card}>
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityLabelContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.availabilityLabel}>Available</Text>
          </View>
          <Switch
            value={isAvailable ?? false}
            onValueChange={handleToggleChange}
            trackColor={{ false: '#D9D9D9', true: '#00A19D' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="#D9D9D9"
            style={styles.switch}
          />
        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A19D',
    marginRight: 8,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },

});

export default AppointmentFilter;
