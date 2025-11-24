import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Platform,
  I18nManager,
} from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { globalTextStyles } from '../../styles/globalStyles';
import CustomBottomSheet from './CustomBottomSheet';

interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  dialCode: string;
  pattern: string;
  maxLength: number;
}

interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCountryChange?: (country: Country) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  style?: any;
  initialCountry?: Country;
  inputContainerStyle?: any;
}

export const COUNTRIES: Country[] = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    dialCode: '+966',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    dialCode: '+971',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'قطر',
    flag: '🇶🇦',
    dialCode: '+974',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'KW',
    name: 'Kuwait',
    nameAr: 'الكويت',
    flag: '🇰🇼',
    dialCode: '+965',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'البحرين',
    flag: '🇧🇭',
    dialCode: '+973',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'OM',
    name: 'Oman',
    nameAr: 'عُمان',
    flag: '🇴🇲',
    dialCode: '+968',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'JO',
    name: 'Jordan',
    nameAr: 'الأردن',
    flag: '🇯🇴',
    dialCode: '+962',
    pattern: '# #### ####',
    maxLength: 9,
  },
  {
    code: 'LB',
    name: 'Lebanon',
    nameAr: 'لبنان',
    flag: '🇱🇧',
    dialCode: '+961',
    pattern: '## ### ###',
    maxLength: 8,
  },
  {
    code: 'EG',
    name: 'Egypt',
    nameAr: 'مصر',
    flag: '🇪🇬',
    dialCode: '+20',
    pattern: '## #### ####',
    maxLength: 10,
  },
  {
    code: 'IQ',
    name: 'Iraq',
    nameAr: 'العراق',
    flag: '🇮🇶',
    dialCode: '+964',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'IR',
    name: 'Iran',
    nameAr: 'إيران',
    flag: '🇮🇷',
    dialCode: '+98',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'TR',
    name: 'Turkey',
    nameAr: 'تركيا',
    flag: '🇹🇷',
    dialCode: '+90',
    pattern: '### ### ####',
    maxLength: 10,
  },
  // Additional countries (alphabetically by code)
  {
    code: 'AD',
    name: 'Andorra',
    nameAr: 'أندورا',
    flag: '🇦🇩',
    dialCode: '+376',
    pattern: '### ###',
    maxLength: 6,
  },
  {
    code: 'AF',
    name: 'Afghanistan',
    nameAr: 'أفغانستان',
    flag: '🇦🇫',
    dialCode: '+93',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'AG',
    name: 'Antigua and Barbuda',
    nameAr: 'أنتيغوا وبربودا',
    flag: '🇦🇬',
    dialCode: '+1268',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'AI',
    name: 'Anguilla',
    nameAr: 'أنغويلا',
    flag: '🇦🇮',
    dialCode: '+1264',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'AL',
    name: 'Albania',
    nameAr: 'ألبانيا',
    flag: '🇦🇱',
    dialCode: '+355',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'AM',
    name: 'Armenia',
    nameAr: 'أرمينيا',
    flag: '🇦🇲',
    dialCode: '+374',
    pattern: '## ######',
    maxLength: 8,
  },
  {
    code: 'AO',
    name: 'Angola',
    nameAr: 'أنغولا',
    flag: '🇦🇴',
    dialCode: '+244',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'AQ',
    name: 'Antarctica',
    nameAr: 'القارة القطبية الجنوبية',
    flag: '🇦🇶',
    dialCode: '+672',
    pattern: '### ###',
    maxLength: 6,
  },
  {
    code: 'AR',
    name: 'Argentina',
    nameAr: 'الأرجنتين',
    flag: '🇦🇷',
    dialCode: '+54',
    pattern: '## #### ####',
    maxLength: 10,
  },
  {
    code: 'AS',
    name: 'American Samoa',
    nameAr: 'ساموا الأمريكية',
    flag: '🇦🇸',
    dialCode: '+1684',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'AT',
    name: 'Austria',
    nameAr: 'النمسا',
    flag: '🇦🇹',
    dialCode: '+43',
    pattern: '### ######',
    maxLength: 9,
  },
  {
    code: 'AU',
    name: 'Australia',
    nameAr: 'أستراليا',
    flag: '🇦🇺',
    dialCode: '+61',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'AW',
    name: 'Aruba',
    nameAr: 'أروبا',
    flag: '🇦🇼',
    dialCode: '+297',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'AX',
    name: 'Åland Islands',
    nameAr: 'جزر آلاند',
    flag: '🇦🇽',
    dialCode: '+358',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'AZ',
    name: 'Azerbaijan',
    nameAr: 'أذربيجان',
    flag: '🇦🇿',
    dialCode: '+994',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    nameAr: 'البوسنة والهرسك',
    flag: '🇧🇦',
    dialCode: '+387',
    pattern: '## ### ###',
    maxLength: 8,
  },
  {
    code: 'BB',
    name: 'Barbados',
    nameAr: 'بربادوس',
    flag: '🇧🇧',
    dialCode: '+1246',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    nameAr: 'بنغلاديش',
    flag: '🇧🇩',
    dialCode: '+880',
    pattern: '#### ######',
    maxLength: 10,
  },
  {
    code: 'BE',
    name: 'Belgium',
    nameAr: 'بلجيكا',
    flag: '🇧🇪',
    dialCode: '+32',
    pattern: '### ## ## ##',
    maxLength: 9,
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    nameAr: 'بوركينا فاسو',
    flag: '🇧🇫',
    dialCode: '+226',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    nameAr: 'بلغاريا',
    flag: '🇧🇬',
    dialCode: '+359',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'BI',
    name: 'Burundi',
    nameAr: 'بوروندي',
    flag: '🇧🇮',
    dialCode: '+257',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'BJ',
    name: 'Benin',
    nameAr: 'بنين',
    flag: '🇧🇯',
    dialCode: '+229',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'BL',
    name: 'Saint Barthélemy',
    nameAr: 'سان بارتيليمي',
    flag: '🇧🇱',
    dialCode: '+590',
    pattern: '### ## ## ##',
    maxLength: 9,
  },
  {
    code: 'BM',
    name: 'Bermuda',
    nameAr: 'برمودا',
    flag: '🇧🇲',
    dialCode: '+1441',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'BN',
    name: 'Brunei',
    nameAr: 'بروناي',
    flag: '🇧🇳',
    dialCode: '+673',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'BO',
    name: 'Bolivia',
    nameAr: 'بوليفيا',
    flag: '🇧🇴',
    dialCode: '+591',
    pattern: '########',
    maxLength: 8,
  },
  {
    code: 'BQ',
    name: 'Caribbean Netherlands',
    nameAr: 'هولندا الكاريبية',
    flag: '🇧🇶',
    dialCode: '+599',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'BR',
    name: 'Brazil',
    nameAr: 'البرازيل',
    flag: '🇧🇷',
    dialCode: '+55',
    pattern: '## #####-####',
    maxLength: 11,
  },
  {
    code: 'BS',
    name: 'Bahamas',
    nameAr: 'جزر البهاما',
    flag: '🇧🇸',
    dialCode: '+1242',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'BT',
    name: 'Bhutan',
    nameAr: 'بوتان',
    flag: '🇧🇹',
    dialCode: '+975',
    pattern: '## ### ###',
    maxLength: 8,
  },
  {
    code: 'BV',
    name: 'Bouvet Island',
    nameAr: 'جزيرة بوفيت',
    flag: '🇧🇻',
    dialCode: '+47',
    pattern: '### ## ###',
    maxLength: 8,
  },
  {
    code: 'BW',
    name: 'Botswana',
    nameAr: 'بوتسوانا',
    flag: '🇧🇼',
    dialCode: '+267',
    pattern: '## ### ###',
    maxLength: 7,
  },
  {
    code: 'BY',
    name: 'Belarus',
    nameAr: 'بيلاروس',
    flag: '🇧🇾',
    dialCode: '+375',
    pattern: '## ###-##-##',
    maxLength: 9,
  },
  {
    code: 'BZ',
    name: 'Belize',
    nameAr: 'بليز',
    flag: '🇧🇿',
    dialCode: '+501',
    pattern: '###-####',
    maxLength: 7,
  },
  {
    code: 'CA',
    name: 'Canada',
    nameAr: 'كندا',
    flag: '🇨🇦',
    dialCode: '+1',
    pattern: '(###) ###-####',
    maxLength: 10,
  },
  {
    code: 'CC',
    name: 'Cocos Islands',
    nameAr: 'جزر كوكوس',
    flag: '🇨🇨',
    dialCode: '+61',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'CD',
    name: 'Democratic Republic of the Congo',
    nameAr: 'جمهورية الكونغو الديمقراطية',
    flag: '🇨🇩',
    dialCode: '+243',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'CF',
    name: 'Central African Republic',
    nameAr: 'جمهورية أفريقيا الوسطى',
    flag: '🇨🇫',
    dialCode: '+236',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'CG',
    name: 'Republic of the Congo',
    nameAr: 'جمهورية الكونغو',
    flag: '🇨🇬',
    dialCode: '+242',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'CH',
    name: 'Switzerland',
    nameAr: 'سويسرا',
    flag: '🇨🇭',
    dialCode: '+41',
    pattern: '## ### ## ##',
    maxLength: 9,
  },
  {
    code: 'CI',
    name: 'Ivory Coast',
    nameAr: 'ساحل العاج',
    flag: '🇨🇮',
    dialCode: '+225',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'CK',
    name: 'Cook Islands',
    nameAr: 'جزر كوك',
    flag: '🇨🇰',
    dialCode: '+682',
    pattern: '## ###',
    maxLength: 5,
  },
  {
    code: 'CL',
    name: 'Chile',
    nameAr: 'تشيلي',
    flag: '🇨🇱',
    dialCode: '+56',
    pattern: '# #### ####',
    maxLength: 9,
  },
  {
    code: 'CM',
    name: 'Cameroon',
    nameAr: 'الكاميرون',
    flag: '🇨🇲',
    dialCode: '+237',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'CN',
    name: 'China',
    nameAr: 'الصين',
    flag: '🇨🇳',
    dialCode: '+86',
    pattern: '### #### ####',
    maxLength: 11,
  },
  {
    code: 'CO',
    name: 'Colombia',
    nameAr: 'كولومبيا',
    flag: '🇨🇴',
    dialCode: '+57',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    nameAr: 'كوستاريكا',
    flag: '🇨🇷',
    dialCode: '+506',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'CU',
    name: 'Cuba',
    nameAr: 'كوبا',
    flag: '🇨🇺',
    dialCode: '+53',
    pattern: '# ### ####',
    maxLength: 8,
  },
  {
    code: 'CV',
    name: 'Cape Verde',
    nameAr: 'الرأس الأخضر',
    flag: '🇨🇻',
    dialCode: '+238',
    pattern: '### ## ##',
    maxLength: 7,
  },
  {
    code: 'CW',
    name: 'Curaçao',
    nameAr: 'كوراساو',
    flag: '🇨🇼',
    dialCode: '+599',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'CX',
    name: 'Christmas Island',
    nameAr: 'جزيرة الكريسماس',
    flag: '🇨🇽',
    dialCode: '+61',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'CY',
    name: 'Cyprus',
    nameAr: 'قبرص',
    flag: '🇨🇾',
    dialCode: '+357',
    pattern: '## ######',
    maxLength: 8,
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    nameAr: 'جمهورية التشيك',
    flag: '🇨🇿',
    dialCode: '+420',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'DE',
    name: 'Germany',
    nameAr: 'ألمانيا',
    flag: '🇩🇪',
    dialCode: '+49',
    pattern: '#### #######',
    maxLength: 11,
  },
  {
    code: 'DJ',
    name: 'Djibouti',
    nameAr: 'جيبوتي',
    flag: '🇩🇯',
    dialCode: '+253',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'DK',
    name: 'Denmark',
    nameAr: 'الدنمارك',
    flag: '🇩🇰',
    dialCode: '+45',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'DM',
    name: 'Dominica',
    nameAr: 'دومينيكا',
    flag: '🇩🇲',
    dialCode: '+1767',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    nameAr: 'جمهورية الدومينيكان',
    flag: '🇩🇴',
    dialCode: '+1',
    pattern: '(###) ###-####',
    maxLength: 10,
  },
  {
    code: 'DZ',
    name: 'Algeria',
    nameAr: 'الجزائر',
    flag: '🇩🇿',
    dialCode: '+213',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'EC',
    name: 'Ecuador',
    nameAr: 'الإكوادور',
    flag: '🇪🇨',
    dialCode: '+593',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'EE',
    name: 'Estonia',
    nameAr: 'إستونيا',
    flag: '🇪🇪',
    dialCode: '+372',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'EH',
    name: 'Western Sahara',
    nameAr: 'الصحراء الغربية',
    flag: '🇪🇭',
    dialCode: '+212',
    pattern: '##-####-###',
    maxLength: 9,
  },
  {
    code: 'ER',
    name: 'Eritrea',
    nameAr: 'إريتريا',
    flag: '🇪🇷',
    dialCode: '+291',
    pattern: '# ### ###',
    maxLength: 7,
  },
  {
    code: 'ES',
    name: 'Spain',
    nameAr: 'إسبانيا',
    flag: '🇪🇸',
    dialCode: '+34',
    pattern: '### ### ###',
    maxLength: 9,
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    nameAr: 'إثيوبيا',
    flag: '🇪🇹',
    dialCode: '+251',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'FI',
    name: 'Finland',
    nameAr: 'فنلندا',
    flag: '🇫🇮',
    dialCode: '+358',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'FJ',
    name: 'Fiji',
    nameAr: 'فيجي',
    flag: '🇫🇯',
    dialCode: '+679',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'FK',
    name: 'Falkland Islands',
    nameAr: 'جزر فوكلاند',
    flag: '🇫🇰',
    dialCode: '+500',
    pattern: '#####',
    maxLength: 5,
  },
  {
    code: 'FM',
    name: 'Micronesia',
    nameAr: 'ميكرونيزيا',
    flag: '🇫🇲',
    dialCode: '+691',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'FO',
    name: 'Faroe Islands',
    nameAr: 'جزر فارو',
    flag: '🇫🇴',
    dialCode: '+298',
    pattern: '######',
    maxLength: 6,
  },
  {
    code: 'FR',
    name: 'France',
    nameAr: 'فرنسا',
    flag: '🇫🇷',
    dialCode: '+33',
    pattern: '## ## ## ## ##',
    maxLength: 10,
  },
  {
    code: 'GA',
    name: 'Gabon',
    nameAr: 'الغابون',
    flag: '🇬🇦',
    dialCode: '+241',
    pattern: '## ## ## ##',
    maxLength: 8,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nameAr: 'المملكة المتحدة',
    flag: '🇬🇧',
    dialCode: '+44',
    pattern: '#### ######',
    maxLength: 10,
  },
  {
    code: 'GD',
    name: 'Grenada',
    nameAr: 'غرينادا',
    flag: '🇬🇩',
    dialCode: '+1473',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'GE',
    name: 'Georgia',
    nameAr: 'جورجيا',
    flag: '🇬🇪',
    dialCode: '+995',
    pattern: '### ## ## ##',
    maxLength: 9,
  },
  {
    code: 'GF',
    name: 'French Guiana',
    nameAr: 'غويانا الفرنسية',
    flag: '🇬🇫',
    dialCode: '+594',
    pattern: '### ## ## ##',
    maxLength: 9,
  },
  {
    code: 'GG',
    name: 'Guernsey',
    nameAr: 'غيرنزي',
    flag: '🇬🇬',
    dialCode: '+44',
    pattern: '#### ######',
    maxLength: 10,
  },
  {
    code: 'GH',
    name: 'Ghana',
    nameAr: 'غانا',
    flag: '🇬🇭',
    dialCode: '+233',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'GI',
    name: 'Gibraltar',
    nameAr: 'جبل طارق',
    flag: '🇬🇮',
    dialCode: '+350',
    pattern: '### #####',
    maxLength: 8,
  },
  {
    code: 'GL',
    name: 'Greenland',
    nameAr: 'غرينلاند',
    flag: '🇬🇱',
    dialCode: '+299',
    pattern: '## ## ##',
    maxLength: 6,
  },
  {
    code: 'GM',
    name: 'Gambia',
    nameAr: 'غامبيا',
    flag: '🇬🇲',
    dialCode: '+220',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'GN',
    name: 'Guinea',
    nameAr: 'غينيا',
    flag: '🇬🇳',
    dialCode: '+224',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'GP',
    name: 'Guadeloupe',
    nameAr: 'غوادلوب',
    flag: '🇬🇵',
    dialCode: '+590',
    pattern: '### ## ## ##',
    maxLength: 9,
  },
  {
    code: 'GQ',
    name: 'Equatorial Guinea',
    nameAr: 'غينيا الاستوائية',
    flag: '🇬🇶',
    dialCode: '+240',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'GR',
    name: 'Greece',
    nameAr: 'اليونان',
    flag: '🇬🇷',
    dialCode: '+30',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'GS',
    name: 'South Georgia and the South Sandwich Islands',
    nameAr: 'جورجيا الجنوبية وجزر ساندويتش الجنوبية',
    flag: '🇬🇸',
    dialCode: '+500',
    pattern: '#####',
    maxLength: 5,
  },
  {
    code: 'GT',
    name: 'Guatemala',
    nameAr: 'غواتيمالا',
    flag: '🇬🇹',
    dialCode: '+502',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'GU',
    name: 'Guam',
    nameAr: 'غوام',
    flag: '🇬🇺',
    dialCode: '+1671',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'GW',
    name: 'Guinea-Bissau',
    nameAr: 'غينيا بيساو',
    flag: '🇬🇼',
    dialCode: '+245',
    pattern: '# ######',
    maxLength: 7,
  },
  {
    code: 'GY',
    name: 'Guyana',
    nameAr: 'غيانا',
    flag: '🇬🇾',
    dialCode: '+592',
    pattern: '### ####',
    maxLength: 7,
  },
  {
    code: 'YE',
    name: 'Yemen',
    nameAr: 'اليمن',
    flag: '🇾🇪',
    dialCode: '+967',
    pattern: '# ### ####',
    maxLength: 8,
  }
];

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  onChangeText,
  onCountryChange,
  placeholder = 'Enter phone number',
  error,
  disabled = false,
  style,
  initialCountry,
  inputContainerStyle,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry || COUNTRIES[0]); // Use initialCountry or default to Saudi Arabia
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(COUNTRIES);
  const inputRef = useRef<TextInput>(null);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    // Filter countries based on search query
    if (searchQuery.trim() === '') {
      setFilteredCountries(COUNTRIES);
    } else {
      const filtered = COUNTRIES.filter(
        country =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.nameAr.includes(searchQuery) ||
          country.dialCode.includes(searchQuery)
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery]);

  useEffect(() => {
    setSelectedCountry(initialCountry || COUNTRIES[0]);
  }, [initialCountry]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
    setSearchQuery('');
    onCountryChange?.(country);
    
    // Clear the phone number when country changes
    onChangeText('');
    
    // Focus on input after country selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const formatPhoneNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    const pattern = selectedCountry.pattern;
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
      if (pattern[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += pattern[i];
      }
    }
    
    return formatted;
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const validatePhoneNumber = (): boolean => {
    const digits = value.replace(/\D/g, '');
    return digits.length === selectedCountry.maxLength;
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry.code === item.code && styles.selectedCountryItem,
      ]}
      onPress={() => handleCountrySelect(item)}
    >
      <View style={styles.countryItemContent}>
        <View style={[styles.flagContainer, {marginLeft: 12}]}>
          <CountryFlag isoCode={item.code} size={16} />
        </View>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.countryNameAr}>{item.nameAr}</Text>
        </View>
        <Text style={styles.countryCodeModal}>{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Phone Input Field */}
      <View style={[styles.inputContainer,inputContainerStyle, error && styles.inputError]}>
        {/* Country Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => {
            setShowCountryModal(true);
          }}
          disabled={disabled}
        >
          <View style={styles.flagContainer}>
            <CountryFlag isoCode={selectedCountry.code} size={16} />
          </View>
          <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Phone Number Input */}
        <TextInput
          ref={inputRef}
          style={[styles.phoneInput, Platform.OS === 'android' && styles.androidPhoneInput]}
          value={value}
          onChangeText={handlePhoneNumberChange}
          placeholder={'00 000 0000'}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={selectedCountry.pattern.length}
          editable={!disabled}
        />
      </View>

      {/* Country Selection Modal */}
      <CustomBottomSheet
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        maxHeight="65%"
        backdropClickable={true}
        showHandle={true}
      >
        <View style={styles.modalContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.countriesList}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </CustomBottomSheet>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    
  },
  inputContainer: {
    flexDirection: I18nManager.isRTL?'row-reverse':'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  countrySelector: {
    flexDirection:'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 20,
    marginLeft: 6,
  },
  countryCode: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  phoneInput: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#333',
    padding: 0,
    textAlign: 'left',
    // Force LTR direction for phone numbers regardless of app language
    writingDirection: 'ltr',
  },
  androidPhoneInput: {
    // Android-specific LTR forcing
    textAlign: 'left',
    textAlignVertical: 'center',
    // Force LTR layout on Android
    start: 0,
    end: undefined,
  },
  patternHint: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    marginTop: 8,
    marginLeft: 16,
    // Force LTR direction for pattern hint
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  errorText: {
    ...globalTextStyles.bodySmall,
    color: '#FF3B30',
    marginTop: 8,
    marginLeft: 16,
    // Force LTR direction for error text
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...globalTextStyles.bodyMedium,
    color: '#333',
  },
  countriesList: {
    paddingBottom: 20,
  },
  countryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCountryItem: {
    backgroundColor: '#F8F9FA',
  },
  countryItemContent: {
    flexDirection: I18nManager.isRTL?'row-reverse':'row',
    alignItems: 'center',
  },
  flagContainer: {
    marginLeft: 6,
    marginRight: 4,
    overflow: 'hidden',
    borderRadius: 2,
  },
  countryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  countryName: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    textAlign: I18nManager.isRTL?'right':'left',
  },
  countryNameAr: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    textAlign: I18nManager.isRTL?'right':'left',
  },
  countryCodeModal: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '600',
    color: '#666',
  },
  // Fallback modal styles
  fallbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fallbackModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  fallbackModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fallbackModalTitle: {
    ...globalTextStyles.h4,
    fontWeight: '600',
    color: '#333',
  },
  fallbackModalClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
});

export default CustomPhoneInput; 