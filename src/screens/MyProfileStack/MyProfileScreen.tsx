import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppHeader from '../../components/common/AppHeader'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileManagementGrid from '../../components/Profile/ProfileManagementGrid';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { appointmentService } from '../../services/api/appointmentService';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';

const MyProfileScreen = () => {
  const [profileOptions, setProfileOptions] = useState([
    {
      id: 'service',
      title: 'Service Profile',
      icon: 'medical-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('service'),
    },
    {
      id: 'personal',
      title: 'Personal Profile',
      icon: 'person-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('personal'),
    },
    {
      id: 'payment',
      title: 'Payment Profile',
      icon: 'wallet-outline',
      iconColor: '#00A19D',
      isComplete: false,
      onPress: () => handleProfileOptionPress('payment'),
    },
    {
      id: 'clients',
      title: 'Clients Profile',
      icon: 'people-outline',
      iconColor: '#00A19D',
      isComplete: true,
      onPress: () => handleProfileOptionPress('clients'),
    },
  ]);

  const [serviceProvider, setServiceProvider] = useState<any>(null);
  const user = useSelector((state: any) => state.root.user.user);
  const [profileSummary, setProfileSummary] = useState<any>({});
  const navigation = useNavigation();
  console.log('profileSummary',profileSummary);

  useEffect(() => {
    getServiceProviderByUserId();
    getServiceProviderMainSummary();
  }, []);

  useEffect(() => {
    if (Object.keys(profileSummary).length > 0) {
      updateProfileOptionsStatus(profileSummary);
    }
  }, [profileSummary]);

  const getServiceProviderByUserId = async () => {
    try {
      const payload = {
        OrganizationId: user.OrganizationId,
        UserloginInfoId:user.Id,
      };
      const response = await profileService.getServiceProviderByUserId(payload);
      if (response?.ResponseStatus?.STATUSCODE === 200) {
        setServiceProvider(response.ServiceProvider[0]);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const getServiceProviderMainSummary = async () => {
    const payload = {
      UserloginInfoId: user?.Id,
    };
    const response = await appointmentService.getServiceProviderMainSummary(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      setProfileSummary(response.ServiceProviderSummary[0]);
      updateProfileOptionsStatus(response.ServiceProviderSummary[0]);
    }
  };

  const updateProfileOptionsStatus = (profileSummaryData: any) => {
    setProfileOptions(prevOptions => 
      prevOptions.map(option => {
        let isComplete = false;
        
        switch (option.id) {
          case 'service':
            isComplete = profileSummaryData.ServiceProfile === 'Completed';
            break;
          case 'payment':
            isComplete = profileSummaryData.PaymentProfile === 'Completed';
            break;
          case 'personal':
            isComplete = profileSummaryData.ProfileManagement === 'Completed';
            break;
          case 'clients':
            // Keep existing logic for clients or use OrganizationStatus
            isComplete = profileSummaryData.OrganizationStatus === true;
            break;
          default:
            isComplete = option.isComplete;
        }
        
        return {
          ...option,
          isComplete: isComplete
        };
      })
    );
  };

  const calculateCompletionPercentage = (): number => {
    let completionPercentage = 0;
    
    // ProfileManagement is worth 33%
    if (profileSummary.ProfileManagement == 'Completed') {
      completionPercentage += 33;
    }
    
    // PaymentProfile is worth 33%
    if (profileSummary.PaymentProfile == 'Completed') {
      completionPercentage += 33;
    }
    
    // ServiceProfile is worth 34%
    if (profileSummary.ServiceProfile == 'Completed') {
      completionPercentage += 34;
    }
    
    return completionPercentage;
  };

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NotificationListScreen as never);
  };

  const handleMessagesPress = () => {
    navigation.navigate(ROUTES.ConversationListScreen as never);
  };

  const handleAlarmPress = () => {
    console.log('Alarm pressed');
    navigation.navigate(ROUTES.ReminderListScreen as never);
  };

  const handleProfileOptionPress = (optionId: string) => {
    if (optionId == 'clients') {
      navigation.navigate(ROUTES.ClientsProfileScreen as never);
    }else if (optionId == 'personal') {
      navigation.navigate(ROUTES.PersonalProfileScreen as never);
    }else if (optionId == 'payment') {
      navigation.navigate(ROUTES.PaymentProfileScreen as never);
    }else if (optionId == 'service') {
      navigation.navigate(ROUTES.ServiceProfileScreen as never);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="My Profile"
        showNotification={true}
        notificationCount={0}
        showMessages={true}
        showAlarm={true}
        onNotificationPress={handleNotificationPress}
        onMessagesPress={handleMessagesPress}
        onAlarmPress={handleAlarmPress}
      />
      <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
        <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
        <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -80 }}>
          {/* Profile Header */}
          <ProfileHeader
            name={serviceProvider?.FullNamePlang}
            gender={serviceProvider?.Gender == true ? "Male" : "Female"}
            rating={serviceProvider?.AccumulativeRatingAvg}
            reviewCount={serviceProvider?.AccumulativeRatingNum}
            isActive={profileSummary?.OrganizationStatus == true ? true : false}
            completionPercentage={calculateCompletionPercentage()}
            profileImage={serviceProvider?.ImagePath}
          />
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
            {/* Profile Management Grid */}
            <ProfileManagementGrid options={profileOptions} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default MyProfileScreen

const styles = StyleSheet.create({
  scrollContainer: {
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
});