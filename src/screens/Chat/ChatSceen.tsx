// ChatScreen.js - Chat component with WebSocket integration

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  AppState,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import useMutationHook from '../../Network/useMutationHook';
import {getMessagesList} from '../../Network/getMessagesList';
import {useSelector} from 'react-redux';
import ChatMessageRender from './ChatMessageRender';
import WebSocketService from '../../components/WebSocketService';
import {
  RightArrowWhite as RightArrowWhiteIcon,
  SendIcon,
  ClipIcon,
  DocumentIcon,
  VoiceNoteIcon
} from '../../assets/icons';
import {launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import FilePicker from 'react-native-file-picker';
import {BaseURL} from '../../Network/axiosInstance';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import {store} from '../../shared/redux/store';

interface Message {
  Id: string;
  Text: string;
  SenderId: string;
  ReceiverId: string;
  DateTime: string;
  status: string;
  FilePath?: string | null;
  FileType?: string | null;
  FileName?: string | null;
  FileSize?: number | null;
}

interface ScrollEvent {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
  };
}

interface ViewableItems {
  viewableItems: Array<{
    index: number;
    item: Message;
  }>;
}

interface WebSocketEvent {
  data: string;
}

interface WebSocketResponse {
  status: string;
  message?: string;
}

interface WebSocketError {
  message: string;
  code?: string;
}

interface WebSocketService {
  connect: (mode: number, communicationKey: string, userId: string) => Promise<void>;
  disconnect: () => void;
  getSocket: () => WebSocket | null;
  sendMessage: (message: any) => Promise<WebSocketResponse>;
  getInstance: () => WebSocketService;
}

const ChatScreen = ({
  patientId,
  serviceProviderId,
  onBackPress,
  displayName,
  onNewMessage,
  onConversationIds,
}: {
  patientId: string;
  serviceProviderId: string;
  onBackPress: () => void;
  displayName: string;
  onNewMessage?: () => void;
  onConversationIds?: (ids: { conversationId: string; senderId: string; receiverId: string }) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const {user} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mongoSenderId, setMongoSenderId] = useState<string | null>(null);
  const [mongoReceiverId, setMongoReceiverId] = useState<string | null>(null);
  const [mongoConverstionId, setMongoConverstionId] = useState<string | null>(
    null,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const firstVisibleMessageIndex = useRef<number | null>(null);
  const firstVisibleMessageOffset = useRef<number | null>(null);
  const lastMessageIndex = useRef<number | null>(null);
  const [lastLoadedMessagesCount, setLastLoadedMessagesCount] = useState(0);
  const previousMessagesLength = useRef(0);
  const flatListRef = useRef<FlatList<Message>>(null);
  const listContentOffsetY = useRef(0);
  const oldContentHeight = useRef(0);
  const socketService = useRef(WebSocketService.getInstance());
  const messagesEndRef = useRef(null);
  const screenHeight = useRef<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentlyPlayingVoice, setCurrentlyPlayingVoice] = useState<
    string | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  });

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      firstVisibleMessageIndex.current = viewableItems[0].index;
    }
  });

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);

      // Handle reconnection when app comes to foreground
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        user?.communicationKey
      ) {
        initializeSocket();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState, user]);

  // Initialize socket connection
  const initializeSocket = async () => {
    try {
      if (user?.communicationKey && user?.id) {
        await socketService.current.connect(
          1, // Presence value (1 for online)
          user?.communicationKey,
          user?.id,
        );

        console.log('socketConnected')
        setSocketConnected(true);

        // Set up socket message handler
        setupSocketListeners();
      }
    } catch (err) {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
    }
  };

  // Set up socket event listeners
  const setupSocketListeners = useCallback(() => {
    if (!socketService.current) return;

    const socket = socketService.current.getSocket();
    if (!socket) return;

    socket.onmessage = async event => {
      try {
        const socketEvent = JSON.parse(event.data);
        
        if (socketEvent.Command === 76) {
          updateMessageStatus('Sent', 'Delivered');
        } else if (socketEvent.Command === 73) {
          updateMessageStatus('Delivered', 'Seen');
        } else if (socketEvent.Command === 56) {
          const parsedData = JSON.parse(socketEvent.Message);
          const messageType = parsedData.MessageType;

          if (messageType === 'Text' || messageType === 'FilePath') {
            const newMessageObj = {
              Id: Math.random().toString(36).substr(2, 9),
              SenderId: socketEvent.FromUser,
              Text: parsedData.Text,
              FilePath: messageType === 'FilePath' ? parsedData.FilePath : null,
              Type: messageType,
              DateTime: new Date().toISOString(),
              status: 'Seen',
            };

            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            
            // Send read receipt immediately for new messages
            if (socketConnected) {
              const readReceiptEvent = {
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

              socketService.current.sendMessage(readReceiptEvent);
            }

            flatListRef?.current?.scrollToEnd({animated: true});
            
            // Notify parent component about new message
            // onNewMessage?.();?
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
  }, [user.id, mongoConverstionId, mongoSenderId, mongoReceiverId, socketConnected, onNewMessage]);

  // Clean up socket listeners
  useEffect(() => {
    setupSocketListeners();
    return () => {
      const socket = socketService.current?.getSocket();
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [setupSocketListeners]);

  // Update message status in state
  const updateMessageStatus = (findStatus, setStatusVal) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.status === findStatus ? {...msg, status: setStatusVal} : msg,
      ),
    );
  };

  // Initial setup - Connect to socket and fetch messages
  useEffect(() => {
    setLoading(true);

    // Initialize WebSocket connection
    initializeSocket();

    // Fetch previous messages
    fetchPreviousMessages(1).finally(() => {
      setLoading(false);
      // Scroll to bottom after initial messages are loaded
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: false});
        }
      }, 100);
    });

    // Cleanup function for component unmount
    return () => {
      if (socketService.current.getSocket()) {
        socketService.current.getSocket().onmessage = null;
      }
    };
  }, []);

  useEffect(() => {
    // Get screen height when component mounts
    const getScreenHeight = () => {
      const windowHeight = Dimensions.get('window').height;
      screenHeight.current = windowHeight;
    };
    getScreenHeight();
  }, []);

  // Track scroll position
  const handleScroll = (event: ScrollEvent) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    listContentOffsetY.current = offsetY;

    // Only load more when very close to the top and not already loading
    if (offsetY < 20 && hasMoreMessages && !isLoadingMore && !isFetchingMore) {
      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set new timeout to prevent multiple calls
      scrollTimeout.current = setTimeout(() => {
        // Store the current messages length before loading more
        previousMessagesLength.current = messages.length;
        fetchPreviousMessages(pageNumber);
      }, 300);
    }
  };

  // Fetch previous messages
  const fetchPreviousMessages = async (page = 1) => {
    if (!hasMoreMessages && page !== 1) return;
    if (isFetchingMore || isLoadingMore) return;

    setIsLoadingMore(true);
    if (page > 1) setIsFetchingMore(true);

    try {
      const messagesResponse = await getMessagesList({
        PatientId: patientId,
        CareProviderId: serviceProviderId,
        PageNumber: page,
        PageSize: 20,
      });

      const data = messagesResponse?.Data || [];

      if (data.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      // Your existing ID setup code
      if (page === 1) {
        if (data[0]?.senderDetails?.userlogininfoId != user.id) {
          setMongoSenderId(data[0]?.senderId);
          setMongoReceiverId(data[0]?.receiverId);
          setMongoConverstionId(data[0]?.conversationId);
        } else {
          setMongoSenderId(data[0]?.receiverId);
          setMongoReceiverId(data[0]?.senderId);
          setMongoConverstionId(data[0]?.conversationId);
        }

        // Pass conversation IDs to parent
        onConversationIds?.({
          conversationId: data[0]?.conversationId,
          senderId: data[0]?.senderDetails?.userlogininfoId != user.id ? data[0]?.senderId : data[0]?.receiverId,
          receiverId: data[0]?.senderDetails?.userlogininfoId != user.id ? data[0]?.receiverId : data[0]?.senderId,
        });
      }

      let tempMessagesArray: Message[] = [];

      data.forEach((item: any) => {
        
        let message: Message = {
          Id: item._id,
          SenderId: item.senderDetails?.userlogininfoId,
          Text: item.content?.text,
          FilePath:
            item.content.type === 'FilePath' ||
            item.content.type === 'VoiceNote'
              ? item.content?.text
              : null,
          Type: item.content.type,
          DateTime: item.createdAt,
          status: item.readByRecipient?.status,
        };
        tempMessagesArray.push(message);
      });

      const reversedMessages = tempMessagesArray.reverse();

      if (page === 1) {
        setMessages(reversedMessages);
      } else {
        // Add new messages to the beginning
        setMessages(prevMessages => [...reversedMessages, ...prevMessages]);
      }

      if (data.length < 20) {
        setHasMoreMessages(false);
      } else {
        setPageNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error('messages list error', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoadingMore(false);
      setIsFetchingMore(false);
    }
  };

  const safeScrollToIndex = index => {
    try {
      if (flatListRef.current && index >= 0 && index < messages.length) {
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewOffset: 0,
        });
      }
    } catch (error) {
      // Fallback
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: 0,
          animated: false,
        });
      }
    }
  };

  // Handle maintaining scroll position when loading older messages
  const onContentSizeChange = (width: number, height: number) => {
    // When we've loaded more messages and need to maintain position
    if (isFetchingMore && previousMessagesLength.current > 0) {
      const newMessagesCount = messages.length - previousMessagesLength.current;

      if (newMessagesCount > 0) {
        // Use safeScrollToIndex instead of direct scrollToIndex
        safeScrollToIndex(newMessagesCount);
      }
    }
  };

  // Send a message through WebSocket
  const sendMessage = () => {
    if (messageText.trim() === '' || !socketConnected || !mongoConverstionId)
      return;

    // Create message data
    const messageData = {
      Id: Math.random().toString(36).substr(2, 9),
      SenderId: user.id,
      Text: messageText,
      FilePath: null,
      Type: 'Text',
      DateTime: new Date().toISOString(),
      status: 'Sent',
    };

    // Add to local state immediately (optimistic UI)
    setMessages(prevMessages => [...prevMessages, messageData]);

    // Scroll to bottom after adding new message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 100);

    // Prepare WebSocket message event
    const socketEvent = {
      Id: messageData.Id,
      ConnectionMode: 1,
      Command: 70,
      FromUser: {Id: user.id},
      ToUserList: [{Id: patientId}],
      Message: JSON.stringify({
        Text: messageText,
        FilePath: null,
        CatFileTypeId: 0,
        MessageType: 'Text',
      }),
      timestamp: new Date().toISOString(),
    };

    // Send via WebSocket
    socketService.current
      .sendMessage(socketEvent)
      .then(response => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.Id === messageData.Id
              ? {...msg, isSent: true, isPending: false}
              : msg,
          ),
        );
      })
      .catch(err => {
        console.error('Failed to send message:', err);
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.Id === messageData.Id
              ? {...msg, isFailed: true, isPending: false}
              : msg,
          ),
        );
      });

    setMessageText('');
  };

  // Check if message is from current user
  const isOwnMessage = (message: any) => {
    return message.SenderId === patientId;
  };

  // Handle new incoming messages
  useEffect(() => {
    if (messages.length > 0 && !isFetchingMore && !isLoadingMore) {
      const lastMessage = messages[messages.length - 1];
      const isNewMessage =
        Date.now() - new Date(lastMessage.DateTime).getTime() < 5000 &&
        lastMessage.SenderId === user.id;

      // Auto-scroll to bottom for new messages from current user
      if (isNewMessage) {
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 100);
      }
    }
  }, [messages.length, isFetchingMore, isLoadingMore]);

  // View for rendering individual messages
  const renderMessage = ({item}: any) => {
    return <ChatMessageRender item={item} />;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Force scroll to bottom when keyboard appears
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 100);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle scroll to bottom when keyboard is shown
  useEffect(() => {
    if (keyboardVisible && flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [keyboardVisible]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const handleFileSelection = async () => {
    try {

      const pickresult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      let pickerResult = null;
      if(Platform.OS === 'ios'){
        pickerResult = pickresult;
      }else{
        pickerResult = pickresult[0];
      }

      if (!pickerResult) {
        return;
      }

      const file = {
        uri: pickerResult.uri,
        type: pickerResult.type || 'application/octet-stream',
        name: pickerResult.name,
        size: pickerResult.size,
      };

      await uploadFile(file, pickerResult);
    } catch (err) {
      console.error('File selection error:', err);

      if (DocumentPicker.isCancel(err)) {
        return;
      }

      if (err instanceof Error) {
        Alert.alert(
          'Error',
          `Failed to select file: ${err.message}. Please try again.`,
        );
      } else {
        Alert.alert('Error', 'Failed to select file. Please try again.');
      }
    }
  };

  const uploadFile = async (file: any, pickerResult: any) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      let url = 'https://hhcmedia.innotech-sa.com/api/common/upload';
      let ResourceCategoryId = '2';

      let fileType = file.name.split('.').pop();
      if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
      else if (
        fileType == 'jpg' ||
        fileType == 'jpeg' ||
        fileType == 'gif' ||
        fileType == 'png' ||
        fileType == 'JPG' ||
        fileType == 'JPEG' ||
        fileType == 'GIF' ||
        fileType == 'PNG'
      )
        ResourceCategoryId = '1';

      const formData = new FormData();
      // Create file object that matches backend expectations
      const fileData = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', fileData);
      formData.append('UserType', user.catUserTypeId);
      formData.append('Id', user.id);
      formData.append('ResourceCategory', ResourceCategoryId);
      formData.append('ResourceType', '9');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${store.getState().root.user.mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      if (responseData.ResponseStatus?.STATUSCODE === '200') {
        // Add the file message to the chat
        const newMessage: Message = {
          Id: responseData.Data?.id || Math.random().toString(36).substr(2, 9),
          SenderId: user.id,
          Text: file.name,
          FilePath: responseData.Data?.AbsolutePath || responseData.Data?.Path,
          Type: 'FilePath',
          DateTime: new Date().toISOString(),
          status: 'Sent',
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);

        const socketEvent = {
          Id: newMessage.Id,
          ConnectionMode: 1,
          Command: 70,
          FromUser: {Id: user.id},
          ToUserList: [{Id: patientId}],
          Message: JSON.stringify({
            Text: messageText,
            FilePath: responseData.Data?.AbsolutePath || responseData.Data?.Path,
            CatFileTypeId: 0,
            MessageType: 'FilePath',
          }),
          timestamp: new Date().toISOString(),
        };
    
        // Send via WebSocket
        socketService.current
          .sendMessage(socketEvent)
          .then(response => {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.Id === newMessage.Id
                  ? {...msg, isSent: true, isPending: false}
                  : msg,
              ),
            );
          })
          .catch(err => {
            console.error('Failed to send message:', err);
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.Id === newMessage.Id
                  ? {...msg, isFailed: true, isPending: false}
                  : msg,
              ),
            );
          });

        // Scroll to bottom after adding new message
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 100);
      } else {
        throw new Error(
          responseData.ResponseStatus?.MESSAGE || 'Upload failed',
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Failed to upload file. Please try again.',
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const playVoiceNote = async (filePath: string) => {
    try {
      // Stop any currently playing sound
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
      }

      // Create a temporary file path
      const tempFilePath = `${RNFS.CachesDirectoryPath}/temp_voice_note.mp3`;

      // Download the file
      const response = await fetch(filePath);
      const blob = await response.blob();
      const base64Data = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Write the file
      await RNFS.writeFile(tempFilePath, base64Data, 'base64');

      // Initialize the sound
      const sound = new Sound(tempFilePath, '', error => {
        if (error) {
          console.error('Failed to load the sound', error);
          return;
        }

        // Play the sound
        sound.play(success => {
          if (success) {
            console.log('Successfully finished playing');
          } else {
            console.log('Playback failed due to audio decoding errors');
          }
          sound.release();
          setIsPlaying(false);
          setCurrentlyPlayingVoice(null);
        });

        setIsPlaying(true);
        setCurrentlyPlayingVoice(filePath);
        setCurrentSound(sound);
      });
    } catch (error) {
      console.error('Error playing voice note:', error);
      Alert.alert('Error', 'Failed to play voice note. Please try again.');
    }
  };

  const stopVoiceNote = () => {
    if (currentSound) {
      currentSound.stop();
      currentSound.release();
      setIsPlaying(false);
      setCurrentlyPlayingVoice(null);
      setCurrentSound(null);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const response = await fetch(filePath);
      const blob = await response.blob();
      const base64Data = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      await RNFS.writeFile(downloadDest, base64Data, 'base64');
      Alert.alert('Success', 'File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            fetchPreviousMessages(1);
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.containerChat}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 30}
      enabled>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <RightArrowWhiteIcon />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.chatTitle}>{displayName}</Text>
          {!socketConnected && (
            <Text style={styles.connectionStatus}>Offline</Text>
          )}
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {isFetchingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#0084ff" />
          <Text style={styles.loadingMoreText}>Loading older messages...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.Id.toString()}
        contentContainerStyle={[
          styles.messagesContainer,
          {paddingBottom: keyboardVisible ? 100 : 20},
        ]}
        onScroll={handleScroll}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={32}
        renderItem={renderMessage}
        inverted={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        onScrollToIndexFailed={info => {
          // Use a safe fallback
          setTimeout(() => {
            if (messages.length > 0) {
              safeScrollToIndex(info.index);
            }
          }, 100);
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
          placeholderTextColor="#8a8a8a"
          multiline
          onFocus={() => {
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({animated: true});
              }
            }, 100);
          }}
        />
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleFileSelection}
          disabled={isUploading}>
          <ClipIcon />
        </TouchableOpacity>
        {isUploading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#0084ff" />
            <Text style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (messageText.trim() === '' || !socketConnected) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={messageText.trim() == '' || !socketConnected}>
          <SendIcon />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  containerChat: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  loadingMoreContainer: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  loadingMoreText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0084ff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  connectionStatus: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 2,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#0084ff',
    fontSize: 16,
  },
  chatTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 50,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  sendingMessage: {
    opacity: 0.7,
  },
  failedMessage: {
    backgroundColor: '#ff4d4d',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  timestamp: {
    fontSize: 10,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusText: {
    fontSize: 12,
    color: '#8a8a8a',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 20,
    color: 'white',
    backgroundColor: '#313131',
    maxHeight: 100,
    marginRight: 8,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#0084ff',
  },
  sendButtonDisabled: {
    backgroundColor: '#313131',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  progressText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
  },
  voiceNoteContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    maxWidth: '80%',
  },
  voiceNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  voiceNoteIndicator: {
    marginLeft: 8,
  },
  voiceNoteText: {
    color: 'white',
    marginLeft: 8,
  },
  fileContainer: {
    marginVertical: 5,
    padding: 10,
  },
  fileBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    maxWidth: '80%',
    alignSelf: 'center',
  },
  fileName: {
    color: 'white',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  downloadText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ChatScreen;
