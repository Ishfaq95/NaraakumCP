import React from "react";
import { SafeAreaView } from "react-native";
import {
  MeetingConsumer,
  MeetingProvider,
} from "@videosdk.live/react-native-sdk";
import MeetingContainer from "./MeetingContainer";
import colors from "../../shared/utils/color";
import { ROUTES } from "../../shared/utils/routes";
import VideoCallScreen from "../VideoSDK/VideoCallScreen";

export default function ({ navigation, route }) {
  const token = route.params.token;
  const meetingId = route.params.meetingId;
  const micEnabled = route.params.micEnabled;
  const webcamEnabled = route.params.webcamEnabled;
  const name = route.params.name;
  const meetingType = route.params.meetingType;
  const defaultCamera = route.params.defaultCamera;
  const SessionStartTime=route.params.sessionStartTime
  const SessionEndTime=route.params.sessionEndTime
  const Data=route.params.Data

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primary[900]}}
    >
      <MeetingProvider
        config={{
          meetingId: meetingId,
          micEnabled: micEnabled,
          webcamEnabled: webcamEnabled,
          name: name,
          notification: {
            title: "Video SDK Meeting",
            message: "Meeting is running.",
          },
          defaultCamera: defaultCamera,
          
        }}
        token={token}
      >
        <MeetingConsumer
          {...{
            onMeetingLeft: () => {
              navigation.navigate(ROUTES.preViewCall);
            },
          }}
        >
          {() => {
            return (
              // <VideoCallScreen />
              <MeetingContainer
                webcamEnabled={webcamEnabled}
                meetingType={meetingType}
                SessionStartTime={SessionStartTime}
                sessionEndTime={SessionEndTime}
                Name={name}
                Data={Data}
              />
            );
          }}
        </MeetingConsumer>
      </MeetingProvider>
    </SafeAreaView>
  );
}
