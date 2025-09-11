import { StyleSheet } from 'react-native';

// Cairo Font Family Constants
export const CAIRO_FONT_FAMILY = {
  regular: 'Cairo-Regular',
  light: 'Cairo-Light',
  medium: 'Cairo-Medium',
  semiBold: 'Cairo-SemiBold',
  bold: 'Cairo-Bold',
  extraBold: 'Cairo-ExtraBold',
  black: 'Cairo-Black',
};

// Global Text Styles with Cairo Font
export const globalTextStyles = StyleSheet.create({
  // Heading styles
  h1: {
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 32,
    color: '#333',
  },
  h2: {
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 28,
    color: '#333',
  },
  h3: {
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    fontSize: 24,
    color: '#333',
  },
  h4: {
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    fontSize: 20,
    color: '#333',
  },
  h5: {
    fontFamily: CAIRO_FONT_FAMILY.medium,
    fontSize: 18,
    color: '#333',
  },
  h6: {
    fontFamily: CAIRO_FONT_FAMILY.medium,
    fontSize: 16,
    color: '#333',
  },

  // Body text styles
  bodyLarge: {
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 18,
    color: '#333',
  },
  bodyMedium: {
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 16,
    color: '#333',
  },
  bodySmall: {
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 14,
    color: '#333',
  },

  // Button text styles
  buttonLarge: {
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 18,
    color: '#fff',
  },
  buttonMedium: {
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    fontSize: 16,
    color: '#fff',
  },
  buttonSmall: {
    fontFamily: CAIRO_FONT_FAMILY.medium,
    fontSize: 14,
    color: '#fff',
  },

  // Caption and label styles
  caption: {
    fontFamily: CAIRO_FONT_FAMILY.light,
    fontSize: 12,
    color: '#666',
  },
  label: {
    fontFamily: CAIRO_FONT_FAMILY.medium,
    fontSize: 14,
    color: '#333',
  },

  // Arabic text specific styles
  arabicText: {
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  arabicTextBold: {
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

// Helper function to get font family
export const getFontFamily = (weight: keyof typeof CAIRO_FONT_FAMILY = 'regular') => {
  return CAIRO_FONT_FAMILY[weight];
};

// Helper function to create text style with Cairo font
export const createCairoTextStyle = (
  fontSize: number,
  weight: keyof typeof CAIRO_FONT_FAMILY = 'regular',
  color: string = '#333'
) => ({
  fontFamily: CAIRO_FONT_FAMILY[weight],
  fontSize,
  color,
}); 