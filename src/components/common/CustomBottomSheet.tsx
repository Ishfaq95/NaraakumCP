import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';

interface CustomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  style?: ViewStyle;
  showBackdrop?: boolean;
  backdropOpacity?: number;
  animationDuration?: number;
  showHandle?: boolean;
  handleColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  backdropClickable?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  visible,
  onClose,
  children,
  height = '50%',
  style,
  showBackdrop = true,
  backdropClickable=false,
  backdropOpacity = 0.5,
  animationDuration = 300,
  showHandle = true,
  handleColor = '#ccc',
  borderRadius = 20,
  backgroundColor = '#fff',
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim, animationDuration, backdropOpacity]);

  const handleBackdropPress = () => {
    if (showBackdrop) {
      onClose();
    }
  };

  const getHeightValue = () => {
    if (typeof height === 'number') {
      return height;
    }
    if (typeof height === 'string' && height.includes('%')) {
      const percentage = parseFloat(height) / 100;
      return screenHeight * percentage;
    }
    return screenHeight * 0.5; // Default to 50%
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        {showBackdrop && (
          <TouchableWithoutFeedback onPress={backdropClickable ? handleBackdropPress : undefined}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropAnim,
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: getHeightValue(),
              backgroundColor,
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              transform: [{ translateY: slideAnim }],
              zIndex: 1000,
            },
            style,
          ]}
        >
          {/* Handle */}
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: handleColor },
                ]}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 998,
  },
  bottomSheet: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 16,
  },
});

export default CustomBottomSheet; 