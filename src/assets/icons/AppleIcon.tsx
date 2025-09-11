import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface Props {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

const AppleIcon = ({ width = 24, height = 24, style, color = '#000000' }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M17.05 12.314c-.014-1.578.685-2.767 2.104-3.644-0.79-1.154-1.989-1.785-3.574-1.895-1.498-.106-3.13.891-3.75.891-.645 0-2.169-.857-3.361-.857C6.176 6.809 4 8.419 4 11.773c0 .988.176 2.009.527 3.062.469 1.379 2.162 4.764 3.932 4.723.926-.019 1.573-.667 2.766-.667 1.16 0 1.752.667 2.766.667 1.787-.026 3.318-3.126 3.766-4.508-2.385-1.091-2.708-3.17-2.708-2.736zm-2.504-5.41c1.122-1.358.996-2.604.961-2.904-0.951.061-2.064.641-2.708 1.384-.592.678-1.089 1.734-.95 2.779 1.042.08 1.989-.483 2.697-1.259z"
      fill={color}
    />
  </Svg>
);

export default AppleIcon; 