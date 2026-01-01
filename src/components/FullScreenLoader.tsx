import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';

interface FullScreenLoaderProps {
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ visible }) => {
  // Return null immediately when not visible - no rendering, no blocking
  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
      collapsable={false}
    >
      <View 
        style={styles.overlay} 
        pointerEvents="auto"
      >
        <View style={styles.loaderContainer}>
          <LoaderKit
            style={{ width: 100, height: 100 }}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
      </View>
    </View>
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
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 9999 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
    backgroundColor: 'transparent',
  },
});

export default FullScreenLoader;
