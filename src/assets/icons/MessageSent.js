import React from 'react';
import Svg, {Path} from 'react-native-svg';

const MessageSent = ({width = 16, height = 16, color = '#9E9E9E'}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MessageSent; 