import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  selected?: boolean;
  size?: number;
}

const LocationMarkerIcon: React.FC<Props> = ({ selected = false, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.05 10.45 8.09 11.21a1 1 0 0 0 1.18 0C13.95 21.45 21 16.25 21 11c0-4.97-4.03-9-9-9z"
      fill={ "#B0B0B0"}
    />
    <Circle
      cx="12"
      cy="11"
      r="3.5"
      fill={selected ? "#36a6ad" : "#fff"}
    />
  </Svg>
);

export default LocationMarkerIcon; 