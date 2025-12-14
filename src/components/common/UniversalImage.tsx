import React, { useState } from 'react';
import { Image, ImageStyle, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface UniversalImageProps {
  source: { uri: string };
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const UniversalImage: React.FC<UniversalImageProps> = ({ 
  source, 
  style, 
  resizeMode = 'cover' 
}) => {
  const [svgError, setSvgError] = useState(false);
  const uri = source.uri;
  
  // Check if the URI is an SVG
  const isSvg = uri && (
    uri.toLowerCase().endsWith('.svg') || 
    uri.toLowerCase().includes('svg') ||
    uri.toLowerCase().includes('image/svg+xml')
  );

  // Check if the URI is a valid image URL
  const isValidImageUrl = uri && (
    uri.startsWith('http://') || 
    uri.startsWith('https://') || 
    uri.startsWith('file://') ||
    uri.startsWith('data:image/')
  );

  // If SVG failed to load, fallback to regular Image
  if (svgError) {
    return (
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        defaultSource={require('../../assets/icons/DoctorIcon.png')}
        onError={(error) => {}}
      />
    );
  }

  // Try to render SVG if it's an SVG file
  if (isSvg && isValidImageUrl) {
    // Extract dimensions from style, with fallbacks
    const width = typeof style?.width === 'number' ? style.width : 50;
    const height = typeof style?.height === 'number' ? style.height : 50;
    
    // Ensure minimum dimensions for SVG
    const svgWidth = Math.max(width, 30);
    const svgHeight = Math.max(height, 30);
    
    return (
      <View style={[style, { 
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }]}>
        <View style={{
          width: svgWidth,
          height: svgHeight,
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden'
        }}>
          <SvgUri
            width="100%"
            height="100%"
            uri={uri}
            style={{ 
              width: '100%', 
              height: '100%'
            }}
            onError={() => {
              setSvgError(true);
            }}
          />
        </View>
      </View>
    );
  }

  // For non-SVG images (PNG, JPG, etc.)
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      defaultSource={require('../../assets/icons/DoctorIcon.png')}
      onError={(error) => {}}
    />
  );
};

export default UniversalImage; 