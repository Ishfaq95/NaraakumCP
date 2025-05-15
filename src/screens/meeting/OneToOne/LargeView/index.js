import { useParticipant } from "@videosdk.live/react-native-sdk";
import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { NetworkIcon } from "../../../../assets/icons";
import colors from "../../../../styles/colors";
import useParticipantStat from "../../Hooks/useParticipantStat";
import LargeVideoRTCView from "./LargeVideoRTCView";
import MicIconOff from '../../../../assets/icons/MicIconOff';

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
export default LargeViewContainer = ({
  participantId,
  openStatsBottomSheet,
  name,
}) => {
  const {
    screenShareOn,
    screenShareStream,
    webcamOn,
    webcamStream,
    displayName,
    setQuality,
    isLocal,
    micOn,
  } = useParticipant(participantId, {});

  const { score } = useParticipantStat({
    participantId,
  });

  useEffect(() => {
    setQuality("high");
  }, []);

  return (
    <View
      style={{
        height:'100%',
        width:'100%',
        backgroundColor: colors.primary[800],
        overflow: "hidden",
      }}
    >
      
        <>
          <LargeVideoRTCView
            isOn={webcamOn}
            stream={webcamStream}
            displayName={name}
            objectFit={"cover"}
            isLocal={isLocal}
          />
          {micOn || webcamOn ? (
            <TouchableOpacity
              style={{
                ...buttonStyle,
                backgroundColor:
                  score && score > 7
                    ? "#3BA55D"
                    : score > 4
                    ? "#faa713"
                    : "#FF5D5D",
              }}
              disabled={true}
              onPress={() => {
                openStatsBottomSheet({ pId: participantId });
              }}
            >
              <NetworkIcon fill={"#fff"} />
            </TouchableOpacity>
          ) : null}
           {!micOn ? (
            <View
              style={{
                alignItems: "center",
                position: "absolute",
                top: 10,
                padding: 8,
                height: 26,
                aspectRatio: 1,
                borderRadius: 12,
                justifyContent: "center",
                right: 10,
              }}
            >
              <MicIconOff height={22} width={22} />
            </View>
          ) : null}
        </>
     
    </View>
  );
};
