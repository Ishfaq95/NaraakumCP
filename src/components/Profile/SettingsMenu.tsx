import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  Image?: any;
  onPress: () => void;
  showArrow?: boolean;
}

interface SettingsMenuProps {
  menuItems: MenuItem[];
  version?: string;
  onLogout: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  menuItems, 
  version,
  onLogout
}) => {
  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {menuItems.map((item) => (
        <TouchableOpacity 
          key={item.id}
          style={styles.menuItem}
          onPress={item.onPress}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.leftSection}>
              {item.Image ? <Image source={item.Image} style={{width: 24, height: 24}} resizeMode="contain" /> : <Ionicons name={item.icon} size={24} color={item.iconColor} />}
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            
            {item.showArrow !== false && (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            )}
          </View>
        </TouchableOpacity>
      ))}
      
      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {version && (
          <Text style={styles.versionText}>Version {version}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
});

export default SettingsMenu;
