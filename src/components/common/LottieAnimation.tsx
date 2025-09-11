import React from 'react';
import { ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieAnimationProps {
  source: any;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  onAnimationFinish?: () => void;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  style,
  autoPlay = true,
  loop = true,
  speed = 1,
  onAnimationFinish,
}) => {
  return (
    <LottieView
      source={source}
      style={style}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      onAnimationFinish={onAnimationFinish}
    />
  );
};

export default LottieAnimation; 