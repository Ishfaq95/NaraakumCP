import React from 'react';
import Svg, {Path} from 'react-native-svg';

const RightArrow = ({width = 24, height = 24, color = '#000'}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default RightArrow; 