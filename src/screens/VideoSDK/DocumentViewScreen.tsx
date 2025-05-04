import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {WebView} from 'react-native-webview';

interface DocumentViewScreenProps {
  url: string;
  onClose: () => void;
}

const DocumentViewScreen: React.FC<DocumentViewScreenProps> = ({
  url,
  onClose,
}) => {
  const INJECTED_JAVASCRIPT = `
  (function() {
    // Overwrite window.open to send the full URL and query params to React Native app
    window.open = function(url) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ url: url}));
    };
  })();
  true;
`;

  const handleMessage = async (event: any) => {
    const {
      url,
      userInfo,
      event: eventHandler,
      data,
      fileName,
      status,
    } = JSON.parse(event.nativeEvent.data);

    console.log('url', eventHandler, data);
  };

  const onNavigationStateChange = (url: any) => {
    console.log('url', url);
  };
  return (
    <View style={styles.container}>
      <WebView
        source={{uri: url}}
        useWebKit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        cacheEnabled={true}
        cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
        thirdPartyCookiesEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        geolocationEnabled={true}
        javaScriptEnabledAndroid={true}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={handleMessage}
        setSupportMultipleWindows={true}
        userAgent={
          Platform.OS === 'android'
            ? 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
            : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'
        }
        originWhitelist={['https://*', 'http://*', 'file://*', 'sms://*']}
        onNavigationStateChange={onNavigationStateChange}
        style={{flex: 1}}
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
