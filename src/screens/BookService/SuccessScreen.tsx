import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

interface SuccessScreenProps {
  route?: any;
  onAgree?: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  route,
  onAgree,
}) => {
  const handleClose = () => {
    if (onAgree) {
      onAgree();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark" size={64} color="#FFFFFF" />
        </View>

        {/* Main Message */}
        <Text style={styles.mainMessage}>
          Services Have Been Added{'\n'}To The Patient Successfully
        </Text>

        {/* Sub Message */}
        <Text style={styles.subMessage}>You can add more services</Text>
      </View>

      {/* Agree Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.agreeButton}
          onPress={handleClose}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#23a2a4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  mainMessage: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  subMessage: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#999999',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  agreeButton: {
    width: '100%',
    backgroundColor: '#23a2a4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#FFFFFF',
  },
});

export default SuccessScreen;

