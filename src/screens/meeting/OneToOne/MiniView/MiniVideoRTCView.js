import { RTCView, MediaStream } from "@videosdk.live/react-native-sdk";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { NetworkIcon } from "../../../../assets/icons";
import Avatar from "../../../../components/Avatar";
import colors from "../../../../styles/colors";
import useParticipantStat from "../../Hooks/useParticipantStat";

const buttonStyle = {
  alignItems: "center",
  position: "absolute",
  top: 10,
  padding: 8,
  height: 26,
  aspectRatio: 1,
  borderRadius: 12,
  justifyContent: "center",
  left: 10,
};

export default MiniVideoRTCView = ({
  stream,
  isOn,
  displayName,
  isLocal,
  openStatsBottomSheet,
  micOn,
  participantId,
}) => {
  const { score } = useParticipantStat({
    participantId,
  });
  return (
    <View
      style={{
        position: "absolute",
        height:'100%',
        width:'100%',
        aspectRatio: 0.7,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#424242",
      }}
    >
      {isOn && stream ? (
        <View style={{
          flex: 1,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#424242"
        }}>
          <RTCView
            objectFit="cover"
            zOrder={1}
            mirror={isLocal ? true : false}
            style={{ 
              flex: 1,
              borderRadius: 10,
              overflow: "hidden"
            }}
            streamURL={new MediaStream([stream.track]).toURL()}
          />
        </View>
      ) : (
        <Avatar
          fullName={displayName}
          containerBackgroundColor={colors.primary[600]}
          fontSize={24}
          style={{
            // backgroundColor: colors.primary[500],
            // height: 60,
            aspectRatio: 1,
            borderRadius: 40,
          }}
        />
      )}
    </View>
  );
};
