import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';

interface FullScreenLoaderProps {
  visible: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ visible }) => {
  // Cleanup effect to ensure modal is properly closed
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
    };
  }, []);

  if (!visible) return null;
  
  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={() => {}}
      hardwareAccelerated={Platform.OS === 'android'}
      presentationStyle="overFullScreen"
    >
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    // Removed complex shadows that cause performance issues
  },
});

export default FullScreenLoader; 