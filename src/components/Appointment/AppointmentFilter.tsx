import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

interface AppointmentFilterProps {
  onAvailabilityChange: (isAvailable: boolean) => void;
  isAvailable: boolean;
  unAvailabilityList: any[];
  onEditUnavailability?: (item: any) => void;
}

const AppointmentFilter: React.FC<AppointmentFilterProps> = ({
  onAvailabilityChange,
  isAvailable,
  unAvailabilityList,
  onEditUnavailability,
}) => { 

  const handleToggleChange = (value: boolean) => {
    onAvailabilityChange(value);
  };

  const formatDateTime = (date: string, time: string) => {
    // Parse UTC date and time from API, then convert to local time
    const dateTimeUTC = moment.utc(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const dateTimeLocal = dateTimeUTC.local();
    return dateTimeLocal.format('DD/MM/YYYY - hh:mm A');
  };

  return (
    <View style={styles.container}>
      {/* Availability Toggle */}
      <View style={styles.card}>
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityLabelContainer}>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#00A19D' : '#FF6B6B' }]} />
            <Text style={[styles.availabilityLabel, { color: isAvailable ? '#00A19D' : '#FF6B6B' }]}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
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

        {
          unAvailabilityList.length > 0 && (
            <View style={styles.divider} />
          )
        }

        {unAvailabilityList.map((item, index) => (
          <View key={index} style={styles.unavailabilityCard}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEditUnavailability && onEditUnavailability(item)}
            >
              <Ionicons name="create-outline" size={22} color="#00A19D" />
            </TouchableOpacity>

            <View style={styles.unavailabilityContent}>
              <Text style={styles.unavailabilityLabel}>Unavailable From</Text>
              <Text style={styles.unavailabilityDateTime}>
                {formatDateTime(item.StartDate, item.StartTime)}
              </Text>

              <Text style={styles.unavailabilityToLabel}>To</Text>
              <Text style={styles.unavailabilityDateTime}>
                {formatDateTime(item.EndDate, item.EndTime)}
              </Text>
            </View>
          </View>
        ))}
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  unavailabilityCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  unavailabilityContent: {
    paddingRight: 40,
  },
  unavailabilityLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  unavailabilityDateTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  unavailabilityToLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },

});

export default AppointmentFilter;
