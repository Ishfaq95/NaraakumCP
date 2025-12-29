import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { useSelector } from 'react-redux';

interface ProfileManagementGridProps {
  options: any[];
}

const ProfileManagementGrid: React.FC<ProfileManagementGridProps> = ({ options }) => {
  const user = useSelector((state: any) => state.root.user.user);


  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Profile Management</Text>

      <View style={styles.grid}>
        {options.map((option) => {
          if(user.CatUserRoleId == 5 && option.id == 'service'){
            return null;
          }
          return (
            <TouchableOpacity
              key={option.id}
              style={styles.gridItem}
              onPress={option.onPress}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer]}>
                  <Image source={option.image} style={{ width: 34, height: 34 }} />
                </View>
  
                {option.id !== 'clients' && (
                  option.isComplete ? (
                    <View style={styles.completeTag}>
                      <Text style={styles.completeText}>Complete</Text>
                    </View>
                  ) : (
                    <View style={styles.incompleteTag}>
                      <Text style={styles.incompleteText}>Incomplete</Text>
                    </View>
                  )
                )}
  
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    color: '#666',
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
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
    paddingVertical: 12,
    paddingHorizontal: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#198754',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  incompleteTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  incompleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#191919',
    marginTop: 8,
  },
});

export default ProfileManagementGrid;
