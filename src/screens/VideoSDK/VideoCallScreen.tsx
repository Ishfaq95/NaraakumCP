import ProfileIcon from '../../assets/icons/ProfileIcon';
import NetworkSignalIcon from '../../assets/icons/NetworkSignalIcon';
import React, {useEffect, useRef, useState, useCallback, memo, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
} from 'react-native';
import MicIconWithCircle from '../../assets/icons/MicIconWithCircle';
import MicIconOff from '../../assets/icons/MicIconOff';
import CameraIconWithCircle from '../../assets/icons/CameraIconWithCircle';
import CameraIconOff from '../../assets/icons/CameraIconOff';
import MessageIconWithCircle from '../../assets/icons/MessageIconWithCircle';
import FlipCameraIcon from '../../assets/icons/FlipCameraIcon';
import HangUpIcon from '../../assets/icons/HangUpIcon';
import CallIcon from '../../assets/icons/CallIcon';
import ExportIcon from '../../assets/icons/ExportIcon';
import ExpandIcon from '../../assets/icons/ExpandIcon';
import {
  Constants,
  getAudioDeviceList,
  RTCView,
  useMeeting,
  useParticipant,
} from '@videosdk.live/react-native-sdk';
import Toast from 'react-native-simple-toast';
import VideosdkRPK from '../../../VideosdkRPK';
import MiniView from '../../screens/meeting/OneToOne/MiniView';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../shared/utils/routes';
import LargeView from '../../screens/meeting/OneToOne/LargeView';
import useParticipantStat from '../../screens/meeting/Hooks/useParticipantStat';
import BackIcon from '../../assets/icons/BackIcon';
import ChatScreen from '../../screens/Chat/ChatSceen';
import WebSocketService from '../../components/WebSocketService';
import {useSelector} from 'react-redux';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const SMALL_VIDEO_WIDTH = 140;
const SMALL_VIDEO_HEIGHT = 180;

// Memoize the ChatScreen component to prevent unnecessary re-renders
const MemoizedChatScreen = memo(ChatScreen);

// Memoize the MiniView component
const MemoizedMiniView = memo(MiniView);

const VideoCallScreen = ({
  sessionStartTime,
  sessionEndTime,
  displayName,
  Data,
}: any) => {
  const {
    join,
    participants,
    localWebcamOn,
    localMicOn,
    leave,
    end,
    changeWebcam,
    toggleWebcam,
    toggleMic,
    presenterId,
    localScreenShareOn,
    toggleScreenShare,
    meetingId,
    startRecording,
    stopRecording,
    meeting,
    recordingState,
    enableScreenShare,
    disableScreenShare,
  } = useMeeting({
    onError: data => {
      const {code, message} = data;
      Toast.show(`Error: ${code}: ${message}`);
    },
  });

  const navigation = useNavigation();
  const [remainingTime, setRemainingTime] = useState(0);
  const [messageText, setMessageText] = useState('');
  const participantIds = [...participants.keys()];

  const participantCount = participantIds ? participantIds.length : null;

  const {webcamOn, webcamStream, setQuality, isLocal} = useParticipant(
    participantIds[0],
    {},
  );

  const {score} = useParticipantStat({
    participantId: participantIds[0],
  });

  const {user} = useSelector((state: any) => state.root.user);
  const socketService = useRef(WebSocketService.getInstance());

  const [mongoConverstionId, setMongoConverstionId] = useState<string | null>(null);
  const [mongoSenderId, setMongoSenderId] = useState<string | null>(null);
  const [mongoReceiverId, setMongoReceiverId] = useState<string | null>(null);

  useEffect(() => {
    setQuality('high');
  }, []);

  // Move state declarations to the top
  const [messageClicked, setMessageClicked] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Add WebSocket message handler
  useEffect(() => {
    const socket = socketService.current.getSocket();
    if (!socket) return;

    const handleMessage = async (event: any) => {
      try {
        const socketEvent = JSON.parse(event.data);
        console.log('WebSocket message received in VideoCallScreen:', socketEvent);
        
        if (socketEvent.Command === 56) {
          const parsedData = JSON.parse(socketEvent.Message);
          console.log('Parsed message data:', parsedData);
          
          if (parsedData.MessageType === 'Text' || parsedData.MessageType === 'FilePath') {
            console.log('Message type matches, messageClicked:', messageClicked);
            // Only increment count if chat is closed
            if (!messageClicked) {
              console.log('Incrementing unread count');
              setUnreadMessageCount(prev => {
                console.log('Previous count:', prev);
                return prev + 1;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    // Store the original onmessage handler
    const originalOnMessage = socket.onmessage;

    // Set our handler
    socket.onmessage = (event) => {
      // Call our handler
      handleMessage(event);
      
      // Call the original handler if it exists
      if (originalOnMessage) {
        originalOnMessage(event);
      }
    };

    return () => {
      // Restore the original handler on cleanup
      socket.onmessage = originalOnMessage;
    };
  }, [messageClicked]);

  const openStatsBottomSheet = ({pId}) => {};

  const calculateRemainingTime = () => {
    const time = new Date(sessionStartTime);

    const endTime = new Date(sessionEndTime);
    const now = new Date();
    const timeLeft = endTime - now; // in milliseconds

    if (timeLeft > 0) {
      setRemainingTime(timeLeft);
    } else {
      //   clearInterval(timer); // stop the timer when time is up
      setRemainingTime(0);
    }
  };

  const formatTime = time => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(calculateRemainingTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const dragPosition = useRef(new Animated.ValueXY()).current;
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragPosition.setOffset({
          x: dragPosition.x._value,
          y: dragPosition.y._value,
        });
        dragPosition.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (event, gestureState) => {
        const newX = gestureState.dx + dragPosition.x._offset;
        const newY = gestureState.dy + dragPosition.y._offset;

        // Ensure the small video stays within the screen bounds
        const clampedX = Math.max(
          0,
          Math.min(newX, SCREEN_WIDTH - SMALL_VIDEO_WIDTH),
        );
        const clampedY = Math.max(
          0,
          Math.min(newY, SCREEN_HEIGHT - 60 - SMALL_VIDEO_HEIGHT - 20), // Adjusted to ensure it doesn't go beyond the screen.
        );

        dragPosition.setValue({
          x: clampedX - dragPosition.x._offset,
          y: clampedY - dragPosition.y._offset,
        });
      },
      onPanResponderRelease: () => {
        dragPosition.flattenOffset();
      },
    }),
  ).current;

  const onPressHangUp = () => {
    leave();
    navigation.navigate(ROUTES.preViewCall, {Data: Data.Data});
  };

  // Add sendReadReceipt function
  const sendReadReceipt = () => {
    if (socketService.current.getSocket() && mongoConverstionId) {
      const socketEvent = {
        ConnectionMode: 1,
        Command: 72,
        FromUser: {Id: user.id},
        Conversation: {
          ConversationId: mongoConverstionId,
          SenderId: mongoSenderId,
          ReceiverId: mongoReceiverId,
        },
        Message: JSON.stringify({
          ConversationId: mongoConverstionId,
          SenderId: mongoSenderId,
          ReceiverId: mongoReceiverId,
        }),
        timestamp: new Date().toISOString(),
      };

      socketService.current.sendMessage(socketEvent);
    }
  };

  // Modify toggleChatScreen to properly handle state and read receipt
  const toggleChatScreen = useCallback(() => {
    setMessageClicked(prev => {
      const newState = !prev;
      console.log('Chat screen state changed to:', newState);
      if (newState) {
        // Send read receipt when opening chat
        console.log('Sending read receipt');
        sendReadReceipt();
      }
      return newState;
    });
  }, [mongoConverstionId, mongoSenderId, mongoReceiverId]);

  // Memoize the back press handler
  const handleBackPress = useCallback(() => {
    setMessageClicked(false);
  }, []);

  // Add handler for conversation IDs
  const handleConversationIds = useCallback((ids: { conversationId: string; senderId: string; receiverId: string }) => {
    setMongoConverstionId(ids.conversationId);
    setMongoSenderId(ids.senderId);
    setMongoReceiverId(ids.receiverId);
  }, []);

  // Update chatScreenProps
  const chatScreenProps = useMemo(
    () => ({
      patientId: Data?.Data?.patientId,
      serviceProviderId: Data?.Data?.serviceProviderId,
      onBackPress: handleBackPress,
      displayName,
      onNewMessage: handleNewMessage,
      onConversationIds: handleConversationIds,
    }),
    [Data?.Data?.patientId, Data?.Data?.serviceProviderId, displayName, handleNewMessage, handleConversationIds],
  );

  // Add effect to reset unread count when chat is opened
  useEffect(() => {
    if (messageClicked) {
      console.log('Resetting unread count');
      setUnreadMessageCount(0);
    }
  }, [messageClicked]);

  // Remove the separate handleNewMessage function since we're handling it directly in the WebSocket handler
  const handleNewMessage = useCallback(() => {
    // This function is now just a no-op since we handle the count directly in the WebSocket handler
  }, []);

  return (
    <View style={styles.container}>
      {!messageClicked ? (
        <>
          <View style={styles.header}>
            <View style={{}}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  backgroundColor: '#464646',
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.sessionText}>Session Time Left</Text>
              </View>
              <View style={{paddingHorizontal: 15}}>
                <Text style={styles.timerText}>
                  {formatTime(remainingTime)}
                </Text>
              </View>
            </View>
            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: 4,
                }}>
                <ProfileIcon />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    color: 'white',
                    paddingLeft: 5,
                  }}>
                  {displayName}
                </Text>
              </View>
              {score > 7 ? (
                <View
                  style={{
                    height: 32,
                    alignSelf: 'center',
                    borderRadius: 5,

                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                  }}></View>
              ) : score > 4 ? (
                <View
                  style={{
                    height: 32,
                    alignSelf: 'center',
                    borderRadius: 5,

                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                  }}></View>
              ) : (
                <View
                  style={{
                    height: 32,
                    alignSelf: 'center',
                    backgroundColor: '#313131',
                    borderRadius: 5,

                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                  }}>
                  <NetworkSignalIcon />
                  <View style={{paddingLeft: 6}}>
                    <Text
                      style={{fontSize: 12, fontWeight: '600', color: 'white'}}>
                      Poor connection{' '}
                    </Text>
                    <Text
                      style={{fontSize: 10, fontWeight: '400', color: 'white'}}>
                      Try moving to get better signal
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View style={styles.mainVideo}>
            {participantCount && participantCount > 1 ? (
              <View
                style={{height: '100%', width: '100%', backgroundColor: 'red'}}>
                <LargeView
                  participantId={participantIds[1]}
                  openStatsBottomSheet={openStatsBottomSheet}
                />
              </View>
            ) : (
              <>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{`في انتظار انضمام ${displayName}`}</Text>
                </View>
              </>
            )}
            <Animated.View
              style={[styles.smallVideo, dragPosition.getLayout()]}
              {...panResponder.panHandlers}>
              <MemoizedMiniView
                openStatsBottomSheet={openStatsBottomSheet}
                participantId={participantIds[0]}
              />
            </Animated.View>
            <View style={styles.controls}>
              {/* Only render the hang-up button */}
              <View style={styles.centeredButtonWrapper}>
                <TouchableOpacity
                  onPress={onPressHangUp}
                  style={styles.hangUpButton}>
                  <HangUpIcon />
                </TouchableOpacity>
              </View>

              {/* Right-aligned chat button */}
              <View style={styles.rightButtonWrapper}>
                <TouchableOpacity
                  onPress={() => changeWebcam()}
                  style={styles.controlButton}>
                  <FlipCameraIcon />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.bottomIcons}>
            <TouchableOpacity
              onPress={() => {
                toggleMic();
                setMicOn(!micOn);
              }}
              activeOpacity={1}
              style={styles.iconButton}>
              {micOn ? (
                <MicIconWithCircle height={35} width={35} />
              ) : (
                <MicIconOff />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                toggleWebcam();
                setVideoOn(!videoOn);
              }}
              style={styles.iconButton}>
              {videoOn ? <CameraIconWithCircle /> : <CameraIconOff />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleChatScreen}
              activeOpacity={1}
              style={styles.iconButton}>
              <View>
                <MessageIconWithCircle />
                {unreadMessageCount > 0 && (
                  <View style={styles.messageBadge}>
                    <Text style={styles.messageCount}>
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.fullView}>
          <MemoizedChatScreen 
            {...chatScreenProps} 
          />
          <Animated.View
            style={[styles.chatSmallVideo, dragPosition.getLayout()]}
            {...panResponder.panHandlers}>
            {participantCount && participantCount > 1 ? (
              <MemoizedMiniView
                openStatsBottomSheet={openStatsBottomSheet}
                participantId={participantIds[1]}
              />
            ) : (
              <View style={styles.waitingParticipantView}>
                <Text style={styles.waitingParticipantText}>
                  {`في انتظار انضمام ${displayName}`}
                </Text>
              </View>
            )}
            <View style={styles.exportButtonContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setMessageClicked(false);
                }}
                style={styles.exportButton}>
                <ExpandIcon height={20} width={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.miniViewControls}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  toggleMic();
                  setMicOn(!micOn);
                }}
                style={[styles.miniControlButton, !micOn && styles.miniControlButtonOff]}>
                {micOn ? (
                  <MicIconWithCircle height={22} width={22} />
                ) : (
                  <MicIconOff height={22} width={22} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  toggleWebcam();
                  setVideoOn(!videoOn);
                }}
                style={[styles.miniControlButton, !videoOn && styles.miniControlButtonOff]}>
                {videoOn ? (
                  <CameraIconWithCircle height={22} width={22} />
                ) : (
                  <CameraIconOff height={22} width={22} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={onPressHangUp}
                style={[styles.miniControlButton, styles.endCallButton]}>
                <CallIcon height={22} width={22} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: 'black',
    flexDirection: 'row',
    padding: 10,
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionText: {
    color: '#fff',
    fontSize: 14,
  },
  timerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  connectionStatus: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectionTip: {
    color: '#fff',
    fontSize: 14,
  },
  mainVideo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'gray',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mainVideoStream: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
  },
  smallVideo: {
    width: SMALL_VIDEO_WIDTH,
    height: SMALL_VIDEO_HEIGHT,
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#313131',
  },
  smallVideoStream: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    width: '70%',
    left: '27%',
    // paddingHorizontal: 20,
  },
  centeredButtonWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  rightButtonWrapper: {
    justifyContent: 'flex-end',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  hangUpButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'black',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#464646',
    borderRadius: 25,
  },
  containerChat: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 10,
  },
  myMessageContainer: {
    backgroundColor: '#4caf50',
    alignSelf: 'flex-end',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  otherMessageContainer: {
    backgroundColor: '#2196f3',
    alignSelf: 'flex-start',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fullView: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1a1a1a', // Match chat background
  },
  chatSmallVideo: {
    position: 'absolute',
    top: 70,
    right: 10,
    width: 140,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 10,
    backgroundColor: 'transparent', // Add this to prevent flickering
  },
  messageBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  messageCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waitingParticipantView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#313131',
    borderRadius: 10,
    overflow: 'hidden',
  },
  waitingParticipantText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  miniViewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  miniControlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#464646',
  },
  miniControlButtonOff: {
    // backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
  exportButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 20,
  },
  exportButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(VideoCallScreen);
