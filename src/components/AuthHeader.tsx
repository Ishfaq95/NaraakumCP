import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, I18nManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { changeLanguage } from '../utils/language/i18nextConfig';
import { globalTextStyles } from '../styles/globalStyles';

// Simple inline SVG for back arrow
const BackArrow = ({ color = '#222', size = 24 }) => (
  <View style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const AuthHeader = ({
  onBack,
  onLanguageSwitch,
  language = 'ع',
  style = {},
}: {
  onBack?: () => void;
  onLanguageSwitch?: () => void;
  language?: string;
  style?: any;
}) => {
  const navigation = useNavigation();

  const onChangeLanguage = () => {
    changeLanguage(I18nManager.isRTL ? 'en' : 'ar');
  }

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack ? onBack : () => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BackArrow />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity disabled={true} style={styles.langBtn} onPress={onChangeLanguage}>
        {/* <Text style={styles.langText}>{I18nManager.isRTL ? 'En' : 'Ar'}</Text> */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eaf6f6',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 56,
  },
  backBtn: {
    padding: 4,
  },
  langBtn: {
    // backgroundColor: '#22A6A7',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    ...globalTextStyles.buttonMedium,
    color: '#fff',
  },
});

export default AuthHeader; 