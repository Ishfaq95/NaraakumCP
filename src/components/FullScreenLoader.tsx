import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';

interface FullScreenLoaderProps {
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ visible }) => {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Reset layout state when visibility changes
  useEffect(() => {
    if (visible) {
      // Small delay to ensure layout is calculated before showing content
      const timer = setTimeout(() => {
        setIsLayoutReady(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsLayoutReady(false);
    }
  }, [visible]);

  if (!visible) return null;
  
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={() => {}}
      hardwareAccelerated={Platform.OS === 'android'}
      presentationStyle="overFullScreen"
    >
      <View 
        style={styles.container}
        collapsable={false}
        needsOffscreenAlphaCompositing={false}
      >
        <View 
          style={[
            styles.loaderContainer,
            // Ensure loader is absolutely centered even before flex layout completes
            { opacity: isLayoutReady ? 1 : 0 }
          ]}
        >
          <LoaderKit
            style={{ width: 100, height: 100 }}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
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
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 140,
    height: 140,
  },
});

export default FullScreenLoader; 