import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/Home';
import AlarmScreen from '../screens/AlarmScreen';
import PreViewScreen from '../screens/VideoSDK/preViewScreen';
import VideoCallScreen from '../screens/VideoSDK/VideoCallScreen';
import meeting from '../screens/meeting';
import { ROUTES } from '../shared/utils/routes';
import WelcomeScreen from '../screens/AuthModule/WelcomeScreen';
import LoginScreen from '../screens/AuthModule/loginScreen';
import BottomTabs from './AppNavigator';
import SignUpScreen from '../screens/AuthModule/SignUpScreen';
import ConfirmPassword from '../screens/ForgotPassword/ConfirmPassword';
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword';
import ForgotOTP from '../screens/ForgotPassword/ForgotOTP';
import CalendarScreen from '../screens/AppointmentStack/CalendarScreen';
import PromotionAndDiscount from '../screens/SettingStack/PromotionAndDiscount';
import HelpScreen from '../screens/SettingStack/HelpScreen';
import DeleteAccountScreen from '../screens/SettingStack/DeleteAccount';
import ClientsProfileScreen from '../screens/MyProfileStack/ClientsProfileScreen';
import ClientSectionScreen from '../screens/MyProfileStack/ClientSection';
import PersonalProfileScreen from '../screens/MyProfileStack/PersonalProfile';
import CareProviderBioScreen from '../screens/MyProfileStack/CareProviderBio';
import MedicalLicenseScreen from '../screens/MyProfileStack/MedicalLicense';
import AccountInformationScreen from '../screens/MyProfileStack/AccountInformation';
import PaymentProfileScreen from '../screens/MyProfileStack/PaymentProfile';
import PaymentDetailsScreen from '../screens/MyProfileStack/PaymentDetails';
import SignTheContractScreen from '../screens/MyProfileStack/SignTheContract';
import SignatureViewerScreen from '../screens/MyProfileStack/SignatureViewer';
import VisitDetailScreen from '../screens/AppointmentStack/VisitDetail';
import AddSessionRecord from '../screens/AppointmentStack/AddSessionRecord';
import ConversationListScreen from '../screens/Chat/ConversationListScreen';
import ChatScreenMainView from '../screens/Chat/ChatScreenMainView';
import NotificationListScreen from '../screens/Notifications/NotificationList';
import ServiceProfileScreen from '../screens/MyProfileStack/ServiceProfile';
import ReminderListScreen from '../screens/Notifications/ReminderList';
import Meeting from '../screens/meeting';
import BookingHistory from '../screens/MyClientsStack/BookingHistory';
import BusinessHours from '../screens/MyProfileStack/BusinessHours';
import DurationAndPrice from '../screens/MyProfileStack/DurationAndPrice';
import PrescriptionListScreen from '../screens/MyClientsStack/PrescriptionListScreen';
import BookingMainScreen from '../screens/BookService/BookingMainScreen';
import SuccessScreen from '../screens/BookService/SuccessScreen';
import PrivicyPolicy from '../screens/AuthModule/PrivicyPolicy';
import AfterContractSign from '../screens/MyProfileStack/AfterContractSign';
import PrescriptionView from '../screens/MyClientsStack/PrescriptionView';
import EnglishBioScreen from '../screens/MyProfileStack/EnglishBio';
import ArabicBioScreen from '../screens/MyProfileStack/ArabicBio';
import WorkAreas from '../screens/MyProfileStack/WorkAreas';
import DeleteConfirmationScreen from '../screens/SettingStack/DeleteConfirmationScreen';
import NetworkErrorScreen from '../screens/NetworkScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const user = useSelector((state: any) => state.root.user.user);
  const signUpFlow = useSelector((state: any) => state.root.user.signUpFlow);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.welcomeScreen} component={WelcomeScreen} />
        <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SignUp} component={SignUpScreen} />
        <Stack.Screen name={ROUTES.ForgotPassword} component={ForgotPassword} />
        <Stack.Screen name={ROUTES.ForgotOTP} component={ForgotOTP} />
        <Stack.Screen name={ROUTES.ConfirmPassword} component={ConfirmPassword} />
        <Stack.Screen name={ROUTES.PrivacyPolicy} component={PrivicyPolicy} />
        <Stack.Screen name={ROUTES.NetworkError} component={NetworkErrorScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTES.AppNavigator}
        component={BottomTabs}
      />
      <Stack.Screen name={ROUTES.CalendarScreen} component={CalendarScreen} />
      <Stack.Screen name={ROUTES.PromotionAndDiscount} component={PromotionAndDiscount} />
      <Stack.Screen name={ROUTES.HelpScreen} component={HelpScreen} />
      <Stack.Screen name={ROUTES.DeleteAccountScreen} component={DeleteAccountScreen} />
      <Stack.Screen name={ROUTES.ClientsProfileScreen} component={ClientsProfileScreen} />
      <Stack.Screen name={ROUTES.ClientSectionScreen} component={ClientSectionScreen} />
      <Stack.Screen name={ROUTES.PersonalProfileScreen} component={PersonalProfileScreen} />
      <Stack.Screen name={ROUTES.CareProviderBioScreen} component={CareProviderBioScreen} />
      <Stack.Screen name={ROUTES.MedicalLicenseScreen} component={MedicalLicenseScreen} />
      <Stack.Screen name={ROUTES.AccountInformationScreen} component={AccountInformationScreen} />
      <Stack.Screen name={ROUTES.PaymentProfileScreen} component={PaymentProfileScreen} />
      <Stack.Screen name={ROUTES.PaymentDetailsScreen} component={PaymentDetailsScreen} />
      <Stack.Screen name={ROUTES.SignTheContractScreen} component={SignTheContractScreen} />
      <Stack.Screen name={ROUTES.SignatureViewerScreen} component={SignatureViewerScreen} />
      <Stack.Screen name={ROUTES.VisitDetailScreen} component={VisitDetailScreen} />
      <Stack.Screen name={ROUTES.AddSessionRecord} component={AddSessionRecord} />
      <Stack.Screen name={ROUTES.ConversationListScreen} component={ConversationListScreen} />
      <Stack.Screen name={ROUTES.ChatScreenMainView} component={ChatScreenMainView} />
      <Stack.Screen name={ROUTES.NotificationListScreen} component={NotificationListScreen} />
      <Stack.Screen name={ROUTES.ServiceProfileScreen} component={ServiceProfileScreen} />
      <Stack.Screen name={ROUTES.ReminderListScreen} component={ReminderListScreen} />
      <Stack.Screen name={ROUTES.preViewCall} component={PreViewScreen} />
      <Stack.Screen name={ROUTES.Meeting} component={Meeting} />
      <Stack.Screen name={ROUTES.BookingHistory} component={BookingHistory} />
      <Stack.Screen name={ROUTES.BusinessHours} component={BusinessHours} />
      <Stack.Screen name={ROUTES.DurationAndPrice} component={DurationAndPrice} />
      <Stack.Screen name={ROUTES.PrescriptionListScreen} component={PrescriptionListScreen} />
      <Stack.Screen name={ROUTES.BookNewService} component={BookingMainScreen} />
      <Stack.Screen name={ROUTES.SuccessScreen} component={SuccessScreen} />
      <Stack.Screen name={ROUTES.AfterContractSign} component={AfterContractSign} />
      <Stack.Screen name={ROUTES.PrescriptionView} component={PrescriptionView} />
      <Stack.Screen name={ROUTES.EnglishBioScreen} component={EnglishBioScreen} />
      <Stack.Screen name={ROUTES.ArabicBioScreen} component={ArabicBioScreen} />
      <Stack.Screen name={ROUTES.WorkAreas} component={WorkAreas} />
      <Stack.Screen name={ROUTES.DeleteConfirmationScreen} component={DeleteConfirmationScreen} />
      <Stack.Screen name={ROUTES.NetworkError} component={NetworkErrorScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
