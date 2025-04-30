import React from 'react';
import Svg, {Path} from 'react-native-svg';

const DocumentIcon = ({width = 24, height = 24, fill = '#FFFFFF'}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
        fill={fill}
      />
    </Svg>
  );
};

export default DocumentIcon; 