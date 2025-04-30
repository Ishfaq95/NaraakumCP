import React from 'react';
import Svg, {Path} from 'react-native-svg';

const ClipIcon = ({width = 24, height = 24, color = '#FFFFFF'}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.3877 2.12231 14.9927 1.58557 16.5977 1.58557C18.2027 1.58557 19.8077 2.12231 20.865 3.18C21.9227 4.23731 22.4594 5.84231 22.4594 7.44731C22.4594 9.05231 21.9227 10.6573 20.865 11.715L11.54 21.04"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ClipIcon; 