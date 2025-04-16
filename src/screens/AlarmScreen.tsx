import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {ROUTES} from '../shared/utils/routes';
 
const AlarmScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {data} = route.params;
  const [string1, setString1] = useState('');
  const [string2, setString2] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
 
  const onPressButton = () => {
    navigation.navigate(ROUTES.Home);
  };
 
  console.log('data', data);
 
  useEffect(() => {
    if (data) {
      makeStringToShow(data);
    }
  }, [route.params]);
 
  const convertUtcToLocal = (utcTime: string) => {
    const [hours, minutes, seconds] = utcTime.split(':').map(Number);
 
    // Create a UTC date (today's date with given time in UTC)
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, seconds, 0);
 
    // Convert to local string in AM/PM format
    return utcDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
 
  const makeStringToShow = (data: any) => {
    // console.log('data', data);
    const timeString = data.SchedulingTime;
    const formattedTime = convertUtcToLocal(timeString);
 
    setTime(formattedTime);
 
    // Format date (e.g., 21/10/2024)
    const dateString = data.SchedulingDate;
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear();
    const formattedDate = `${day < 10 ? '0' : ''}${day}/${
      month < 10 ? '0' : ''
    }${month}/${year}`;
 
    setDate(formattedDate);
 
    // Set string1 and string2
    const stringArray = data.NotificationBody.split('.');
    const string1 = stringArray[0].replace('{0}', '');
    const string2 = stringArray[1];
 
    setString1(string1);
    setString2(string2);
    console.log('stringArray', stringArray);
  };
 
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={{marginTop: 25}}>
        <Image
          source={require('../assets/icons/NaraakumLogo.png')} // replace with the logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
 
      {/* Reminder Section */}
      <View style={styles.reminderBox}>
        <View
          style={{
            position: 'absolute',
            height: 80,
            width: 80,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 100,
            marginTop: -40,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}>
          <Image
            source={require('../assets/icons/AlarmIcon.png')} // replace with the clock icon path
            style={styles.clockIcon}
          />
        </View>
        <View
          style={{
            marginTop: 30,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.title}>{data.Subject}</Text>
          <Text style={styles.subtitle}>{string1}</Text>
        </View>
 
        {/* Appointment Time */}
        <View style={styles.timeBox}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
 
        <Text style={styles.note}>{string2}</Text>
 
        {/* OK Button */}
        <TouchableOpacity onPress={onPressButton} style={styles.okButton}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F0F4',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 30,
  },
  reminderBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  clockIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2B2B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 15,
  },
  timeBox: {
    backgroundColor: '#E9F5F7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  time: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  date: {
    fontSize: 16,
    color: '#6B6B6B',
  },
  note: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#0A9F9D',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
 
export default AlarmScreen;