import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

interface CustomAlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCancelButton?: boolean;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'info',
  showCancelButton = false,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkcircle', color: '#28a745' };
      case 'warning':
        return { name: 'warning', color: '#ffc107' };
      case 'error':
        return { name: 'closecircle', color: '#dc3545' };
      default:
        return { name: 'infocirlceo', color: '#17a2b8' };
    }
  };

  const iconConfig = getIconConfig();

  useEffect(() => {
  }, [visible, message]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="#888" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <AntDesign name={iconConfig.name} size={64} color={iconConfig.color} />
          </View>

          {/* Title */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !showCancelButton && styles.fullWidthButton,
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 400,
    minHeight: 160,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#179c8e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#333',
    textAlign: 'center',
    // marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#179c8e',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    color: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    color: '#333',
  },
});

export default CustomAlertModal;

