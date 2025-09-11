import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface Props {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

const EyeIcon = ({ width = 24, height = 24, style, color = '#666666' }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill={color}
    />
  </Svg>
);

export default EyeIcon; 