import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { tokenRefreshService } from '../../services/axios/tokenRefreshService';

const DeleteConfirmationScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { topic } = useSelector((state: any) => state.root.user);
  const handleAgree = () => {
    if(topic){
      messaging()
        .unsubscribeFromTopic(topic)
        .then(() => { });
    }
    dispatch(setUser(null));
    dispatch(setTopic(null));
    tokenRefreshService.reset();
  };

  // Handle Android hardware back button - works like agree button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        handleAgree();
        return true; // prevent default behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }
  }, []);

  // Handle iOS swipe back gesture - works like agree button
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      // Call handleAgree instead
      handleAgree();
    });

    return unsubscribe;
  }, [navigation, handleAgree]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Account deleted</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Waving Hand Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.handIcon}>
            <Ionicons name="hand-left-outline" size={70} color="#23a2a4" />
            
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Your account has been deleted</Text>

        {/* Description */}
        <Text style={styles.description}>
          We're sorry to see you go, and we hope we provided you with a valuable experience during your time on our platform. Please note that all your data has been permanently deleted and cannot be recovered.
        </Text>
      </View>

      {/* Agree Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.agreeButton}
          onPress={handleAgree}
          activeOpacity={0.8}
        >
          <Text style={styles.agreeButtonText}>Agree</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000000',
    lineHeight: Platform.OS === 'ios' ? 0 : 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#E6F3EF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  waveLine1: {
    position: 'absolute',
    right: -20,
    top: 5,
    width: 18,
    height: 2.5,
    backgroundColor: '#23a2a4',
    borderRadius: 1.5,
    transform: [{ rotate: '-20deg' }],
  },
  waveLine2: {
    position: 'absolute',
    right: -28,
    top: 18,
    width: 22,
    height: 2.5,
    backgroundColor: '#23a2a4',
    borderRadius: 1.5,
    transform: [{ rotate: '-12deg' }],
  },
  waveLine3: {
    position: 'absolute',
    right: -30,
    top: 32,
    width: 24,
    height: 2.5,
    backgroundColor: '#23a2a4',
    borderRadius: 1.5,
    transform: [{ rotate: '-5deg' }],
  },
  waveLine4: {
    position: 'absolute',
    right: -25,
    top: 45,
    width: 20,
    height: 2.5,
    backgroundColor: '#23a2a4',
    borderRadius: 1.5,
    transform: [{ rotate: '2deg' }],
  },
  heading: {
    fontSize: 20,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: Platform.OS === 'ios' ? 28 : 30,
  },
  description: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#666666',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 20 : 22,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
    paddingTop: 16,
    backgroundColor: '#E6F3EF',
  },
  agreeButton: {
    width: '100%',
    backgroundColor: '#23a2a4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#FFFFFF',
  },
});

export default DeleteConfirmationScreen;

