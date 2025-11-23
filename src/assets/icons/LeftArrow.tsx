import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LeftArrowProps {
  width?: number;
  height?: number;
  color?: string;
}

const LeftArrow: React.FC<LeftArrowProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#239EA0' 
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LeftArrow; 