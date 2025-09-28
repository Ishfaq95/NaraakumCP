import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatItem {
  count: number;
  label: string;
  color: string;
}

interface AppointmentStatisticsProps {
  stats: StatItem[];
}

const AppointmentStatistics: React.FC<AppointmentStatisticsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Statistics</Text>
      
      <View style={styles.statsContainer}>
        {stats.map((item, index) => (
          <React.Fragment key={item.label}>
            <View style={styles.statItem}>
              <Text style={[styles.statCount, { color: item.color }]}>
                {item.count}
              </Text>
              <Text style={[styles.statLabel,{ color: item.color }]}>{item.label}</Text>
            </View>
            
            {index < stats.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
});

export default AppointmentStatistics;
