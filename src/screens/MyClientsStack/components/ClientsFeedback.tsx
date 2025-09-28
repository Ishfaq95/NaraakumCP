import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClientsFeedback: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients Feedback</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    color: '#6b7280',
  },
});

export default ClientsFeedback;


