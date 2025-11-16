import { View, Text, SafeAreaView } from 'react-native'
import React, { memo, useEffect, useMemo, useRef } from 'react'
import { useNavigation } from '@react-navigation/native';
import ChatScreen from './ChatSceen';
import { useSelector } from 'react-redux';
import WebSocketService from '../../components/WebSocketService';

const MemoizedChatScreen = memo(ChatScreen);

const ChatScreenMainView = ({route}: any) => {
    const {patientId, serviceProviderId, displayName,item} = route.params;
    const socketService = useRef(WebSocketService.getInstance());
    const user = useSelector((state: any) => state.root.user.user);

    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack();
    }

      // Update chatScreenProps
  const chatScreenProps = useMemo(
    () => ({
      patientId: patientId,
      serviceProviderId: serviceProviderId,
      onBackPress: handleBackPress,
      displayName,
    }),
    [
      patientId,
      serviceProviderId,
      displayName,
    ],
  );

  // Add sendReadReceipt function
  const sendReadReceipt = () => {
    if (socketService.current.getSocket()) {
      const socketEvent = {
        ConnectionMode: 1,
        Command: 72,
        FromUser: {Id: user.Id},
        Conversation: {
          ConversationId: item?._id,
          SenderId:  item?.patientId,
          ReceiverId:item?.careProviderId,
        },
        Message: JSON.stringify({
          ConversationId: item?._id,
          SenderId: item?.patientId,
          ReceiverId:item?.careProviderId, 
        }),
        timestamp: new Date().toISOString(),
      };

      socketService.current.sendMessage(socketEvent);
    }
  };

  useEffect(() => {
    if(item?.unseenmsgCount > 0){
      sendReadReceipt();
    }
  }, [item?.unseenmsgCount]);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
      <MemoizedChatScreen {...chatScreenProps} />
    </SafeAreaView>
  )
}

export default ChatScreenMainView