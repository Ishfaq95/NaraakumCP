import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const CheckIcon = ({ width = 12, height = 12, color = '#FFFFFF' }) => (
  <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
    <Path
      d="M10 3L4.5 8.5L2 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckIcon; 