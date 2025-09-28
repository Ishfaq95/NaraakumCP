import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalTextStyles } from '../../styles/globalStyles';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showNotification?: boolean;
  notificationCount?: number;
  showSettings?: boolean;
  showAlarm?: boolean;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onAlarmPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showNotification = true,
  notificationCount = 0,
  showSettings = true,
  showAlarm = true,
  onNotificationPress,
  onSettingsPress,
  onAlarmPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>

      {/* Middle section with title */}
      <View style={styles.middleSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right section with icons */}
      <View style={styles.rightSection}>


        {showAlarm && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onAlarmPress}
          >
            <Image
              source={require('../../assets/icons/messageIcon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {showAlarm && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onAlarmPress}
          >
            <Image
              source={require('../../assets/icons/alarm-clock.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {showNotification && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications" size={24} color="#333" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    height: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...globalTextStyles.h5,
    color: '#333',
  },
  iconContainer: {
    marginLeft: 16,
    position: 'relative',
  },
  icon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AppHeader;
