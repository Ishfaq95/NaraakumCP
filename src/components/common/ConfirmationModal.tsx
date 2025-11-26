import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  onYes: () => void;
  onNo: () => void;
  onClose?: () => void;
  yesText?: string;
  noText?: string;
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  onYes,
  onNo,
  onClose,
  yesText = 'Yes',
  noText = 'No',
  title = 'Confirmation',
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onNo();
    }
  };

  const handleBackdropPress = () => {
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header with Title and Close Button */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AntDesign name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={onYes}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{yesText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={onNo}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{noText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: screenHeight * 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  message: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000000',
    textAlign: 'left',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#179c8e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    color: '#FFFFFF',
  },
});

export default ConfirmationModal;

