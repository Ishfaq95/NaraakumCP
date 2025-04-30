import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

interface DocumentViewScreenProps {
  url: string;
  onClose: () => void;
}

const DocumentViewScreen: React.FC<DocumentViewScreenProps> = ({
  url,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <WebView
        source={{uri: url}}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
});

export default DocumentViewScreen; 