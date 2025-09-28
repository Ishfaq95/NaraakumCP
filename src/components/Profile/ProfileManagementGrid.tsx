import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  isComplete: boolean;
  onPress: () => void;
}

interface ProfileManagementGridProps {
  options: ProfileOption[];
}

const ProfileManagementGrid: React.FC<ProfileManagementGridProps> = ({ options }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Profile Management</Text>
      
      <View style={styles.grid}>
        {options.map((option) => (
          <TouchableOpacity 
            key={option.id}
            style={styles.gridItem}
            onPress={option.onPress}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { borderColor: option.iconColor }]}>
                <Ionicons name={option.icon} size={28} color={option.iconColor} />
              </View>
              
              {!option.isComplete && (
                <View style={styles.incompleteTag}>
                  <Text style={styles.incompleteText}>incomplete</Text>
                </View>
              )}
              
              <Text style={styles.optionTitle}>{option.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 160,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incompleteTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incompleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
});

export default ProfileManagementGrid;
