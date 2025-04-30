import * as React from 'react';
import Svg, {Path, Defs, Rect, ClipPath, G} from 'react-native-svg';

function MicIconWithCircle(props) {
  const {height,width}=props;
  return (
    <Svg width={width} height={height} viewBox="0 0 33 33" fill="none">
      <Rect width={width} height={height} rx="16.5" fill="#464646" />
      <G clip-path="url(#clip0_1382_403)">
        <Path
          d="M21.7864 16.7777C21.7864 16.4561 21.5257 16.1953 21.204 16.1953C20.8824 16.1953 20.6216 16.4561 20.6216 16.7777C20.6213 19.054 18.7757 20.899 16.4994 20.8987C14.2236 20.8984 12.3787 19.0535 12.3784 16.7777C12.3784 16.4561 12.1176 16.1953 11.796 16.1953C11.4743 16.1953 11.2136 16.4561 11.2136 16.7777C11.2166 19.4706 13.2414 21.7318 15.9176 22.0312V23.5843H13.7995C13.4779 23.5843 13.2171 23.8451 13.2171 24.1667C13.2171 24.4884 13.4779 24.7491 13.7995 24.7491H19.2005C19.5222 24.7491 19.7829 24.4884 19.7829 24.1667C19.7829 23.8451 19.5222 23.5843 19.2005 23.5843H17.0824V22.0312C19.7586 21.7318 21.7834 19.4706 21.7864 16.7777Z"
          fill="white"
        />
        <Path
          d="M16.5 8.25C14.7062 8.25 13.252 9.70416 13.252 11.498V16.7573C13.2541 18.5502 14.7071 20.0031 16.5 20.0052C18.2929 20.0031 19.7458 18.5502 19.748 16.7573V11.498C19.748 9.70416 18.2938 8.25 16.5 8.25Z"
          fill="white"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1382_403">
          <Rect
            width={width/2}
            height={height/2}
            fill="white"
            transform="translate(8.25 8.25)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default MicIconWithCircle;
