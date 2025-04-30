import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import en from './json/en.json';
import ar from './json/ar.json'; // Arabic translations
import { LangCode } from './LanguageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'appLanguage'; 

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Initialize i18n and set the default language (Arabic by default)
export const initializeI18Next = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const defaultLanguage = savedLanguage || LangCode.ar; // Use saved language or default to Arabic
  const isRtl = defaultLanguage === LangCode.ar;

  // Set RTL or LTR based on the language
  I18nManager.forceRTL(isRtl);
  I18nManager.allowRTL(isRtl);

  i18n.use(initReactI18next).init({
    debug: false,
    resources,
    lng: defaultLanguage,
    fallbackLng: LangCode.en, // Fallback to English if translation is missing
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });
};

// Function to change language and handle RTL
export const changeLanguage = async (language: any) => {
  const isRtl = language === LangCode.ar;

  // Apply RTL or LTR direction
  I18nManager.forceRTL(isRtl);
  I18nManager.allowRTL(isRtl);
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  // Change language in i18n
  await i18n.changeLanguage(language);

  // Restart the app to apply changes
  RNRestart.Restart();
};
