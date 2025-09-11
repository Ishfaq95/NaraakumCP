import React from "react";
import Svg, { Circle, Line } from "react-native-svg";

const SearchIcon = ({ width = 24, height = 24, color = "#FFFFFF" }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Circle
      cx="11"
      cy="11"
      r="7"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Line
      x1="16.65"
      y1="16.65"
      x2="21"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default SearchIcon; 