import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { notificationsService } from '../../services/api/notifications';
import { useSelector } from 'react-redux';
import WebSocketService from '../WebSocketService';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showNotification?: boolean;
  notificationCount?: number;
  showMessages?: boolean;
  showAlarm?: boolean;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onAlarmPress?: () => void;
  onMessagesPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showNotification = true,
  showMessages = true,
  showAlarm = true,
  onNotificationPress,
  onSettingsPress,
  onAlarmPress,
  onMessagesPress,
}) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const user = useSelector((state: any) => state.root.user.user);
  const [notificationCount, setNotificationCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const unreadMessages = useSelector((state: any) => state.root.user.unreadMessages);
  const webSocketService = WebSocketService.getInstance();
  console.log('unreadMessages', unreadMessages);
  useEffect(() => {
    if (isFocused) {
      getNotificationsList();
      getReminderList();
    }
  }, [isFocused]);

  // useEffect(() => {
  //   if (user && isFocused) {
  //     webSocketService.startPeriodicUnreadCheck(user.Id);
  //   }
  // }, [user, isFocused]);

  const getReminderList = async () => {
    try {
        const payload = {
            UserloginInfoId: user.Id,
        }
        const response = await notificationsService.getServiceProviderReminderList(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            setReminderCount(response.ReminderList.length);
        }
    }
    catch (error) {
        console.log('Error fetching reminder list:', error);
    }
}

  const getNotificationsList = async () => {
    try {
        const payload = {
            "ReciverId": user.Id,
            "Viewstatus": 0,
            "PageNumber": 1,
            "PageSize": 10
        }
        const response = await notificationsService.getNotificationsList(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            setNotificationCount(response.TotalRecord);
            
        }
    } catch (error) {
        console.log('Error fetching notifications:', error);
    }
}

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


        {showMessages && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onMessagesPress}
          >
            <Image
              source={require('../../assets/icons/messageIcon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            )}
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
            {reminderCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {reminderCount > 99 ? '99+' : reminderCount}
                </Text>
              </View>
            )}
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
    fontSize: 16,
    fontWeight: '700',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#191919',
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
    height: 18,
    width:18,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 2,
    // paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AppHeader;
