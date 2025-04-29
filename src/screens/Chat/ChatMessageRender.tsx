// ChatMessageRender.js
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useSelector} from 'react-redux';
import MessageSentIcon from '../../assets/icons/MessageSent';
import MessageDeliveredIcon from '../../assets/icons/MessageDelivered';
import MessageSeenIcon from '../../assets/icons/MessageSeen';
import DocumentIcon from '../../assets/icons/DocumentIcon';
import DocumentIconBlack from '../../assets/icons/DocumentIconBlack';
import RNFS from 'react-native-fs';
import {Alert} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {MediaBaseURL} from '../../Network/axiosInstance';
import DownloadIcon from '../../assets/icons/DownloadIcon';
import DownloadIconBlack from '../../assets/icons/DownloadIconBlack';
import Sound from 'react-native-sound';
import VoiceNoteIcon from '../../assets/icons/VoiceNoteIcon';
import VoiceNoteIconBlack from '../../assets/icons/VoiceNoteIconBlack';


interface Message {
  SenderId: string;
  Text: string;
  FilePath: string;
  Type: string;
  DateTime: string;
  status: string;
}

const ChatMessageRender = ({item}: {item: Message}) => {
  const {userinfo} = useSelector((state: any) => state.root.user);
  const isOwnMessage = item.SenderId == userinfo.Id;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [sound]);

  const formattedTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Determine message status indicator
  const getStatusIndicator = () => {
    if (!isOwnMessage) return null;

    if (item.status == 'Seen') {
      return <MessageSeenIcon color="#59de6a" />;
    } else if (item.status == 'Delivered') {
      return <MessageDeliveredIcon color="#888" />;
    } else {
      return <MessageSentIcon color="#888" />;
    }
  };

  const downloadFileFromChat = (url: string) => {
    if (isDownloading) return;

    setIsDownloading(true);
    const fileURL = `${MediaBaseURL}${url}`;
    let fileName = getFileNameFromUrl(fileURL);
    if (Platform.OS === 'ios') {
      downloadFIleForIOS(fileURL, fileName);
    } else {
      downloadFile(fileURL, fileName);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    return parts.pop();
  };

  const downloadFIleForIOS = (url: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;
    const DocumentDir = fs.dirs.DocumentDir;
    const filePath = `${DocumentDir}/${fileName}`;

    config({
      fileCache: true,
      path: filePath,
    })
      .fetch('GET', url)
      .then(res => {
        Alert.alert(
          'File downloaded successfully',
          'The file is saved to your device.',
        );
        RNFetchBlob.ios.previewDocument(filePath);
      })
      .catch(error => {
        Alert.alert('File downloading error.');
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const downloadFile = (url: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;
    const DownloadDir = fs.dirs.DownloadDir;
    const filePath = `${DownloadDir}/${fileName}`;

    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: filePath,
      },
    })
      .fetch('GET', url)
      .then(res => {
        Alert.alert('File downloaded successfully');
      })
      .catch(error => {
        Alert.alert('File downloading error.');
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cleanUrl = (url: string) => {
    return url.split('^')[0];
  };

  const playVoiceNote = (url: string) => {
    console.log('Starting playVoiceNote with URL:', url);

    if (isPlaying) {
      console.log('Currently playing, stopping...');
      sound?.stop();
      setIsPlaying(false);
      progressAnim.setValue(0);
      setCurrentTime(0);
      return;
    }

    if (sound) {
      console.log('Using existing sound instance');
      sound.play(success => {
        if (success) {
          console.log('Successfully played existing sound');
          setIsPlaying(false);
          progressAnim.setValue(0);
          setCurrentTime(0);
        } else {
          console.error('Failed to play existing sound');
          Alert.alert('Error', 'Failed to play voice note');
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
      return;
    }

    const cleanFileURL = cleanUrl(url);
    console.log('Cleaned URL:', cleanFileURL);
    console.log('Initializing new Sound instance...');

    // Enable playback in silence mode
    Sound.setCategory('Playback');
    console.log('Set Sound category to Playback');

    // For iOS, we need to download the file first
    if (Platform.OS === 'ios') {
      console.log('iOS platform detected, downloading file first');
      const fileName = getFileNameFromUrl(cleanFileURL);
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      console.log('Downloading to:', filePath);

      RNFS.downloadFile({
        fromUrl: cleanFileURL,
        toFile: filePath,
        background: true,
        begin: res => {
          console.log('Download started:', res);
        },
        progress: res => {
          console.log('Download progress:', res);
        },
      })
        .promise.then(() => {
          console.log('File downloaded successfully to:', filePath);

          const voiceNote = new Sound(filePath, '', error => {
            if (error) {
              console.error('Error loading voice note:', error);
              console.error('Error details:', {
                message: error.message,
                code: error.code,
                domain: error.domain,
              });
              Alert.alert(
                'Error',
                'Failed to load voice note. Please try again.',
              );
              return;
            }

            const duration = voiceNote.getDuration();
            console.log('Voice note loaded successfully:', {
              duration,
              numberOfChannels: voiceNote.getNumberOfChannels(),
              volume: voiceNote.getVolume(),
            });

            setDuration(duration);

            // Set volume to maximum
            voiceNote.setVolume(1.0);
            console.log('Set volume to maximum');

            voiceNote.play(success => {
              if (success) {
                console.log('Voice note played successfully');
                setIsPlaying(false);
                progressAnim.setValue(0);
                setCurrentTime(0);
              } else {
                console.error('Failed to play voice note');
                Alert.alert(
                  'Error',
                  'Failed to play voice note. Please try again.',
                );
                setIsPlaying(false);
              }
            });
            setIsPlaying(true);
          });
          setSound(voiceNote);
        })
        .catch(error => {
          console.error('Error downloading file:', error);
          Alert.alert(
            'Error',
            'Failed to download voice note. Please try again.',
          );
        });
    } else {
      // Android implementation remains the same
      const voiceNote = new Sound(cleanFileURL, undefined, error => {
        if (error) {
          console.error('Error loading voice note:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            domain: error.domain,
          });
          Alert.alert('Error', 'Failed to load voice note. Please try again.');
          return;
        }

        const duration = voiceNote.getDuration();
        console.log('Voice note loaded successfully:', {
          duration,
          numberOfChannels: voiceNote.getNumberOfChannels(),
          volume: voiceNote.getVolume(),
        });

        setDuration(duration);

        // Set volume to maximum
        voiceNote.setVolume(1.0);
        console.log('Set volume to maximum');

        voiceNote.play(success => {
          if (success) {
            console.log('Voice note played successfully');
            setIsPlaying(false);
            progressAnim.setValue(0);
            setCurrentTime(0);
          } else {
            console.error('Failed to play voice note');
            Alert.alert(
              'Error',
              'Failed to play voice note. Please try again.',
            );
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      });
      setSound(voiceNote);
    }
  };

  useEffect(() => {
    if (isPlaying && sound) {
      const interval = setInterval(() => {
        sound.getCurrentTime(seconds => {
          setCurrentTime(seconds);
          const progress = seconds / duration;
          progressAnim.setValue(progress);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, sound, duration, progressAnim]);

  if (item.Type === 'FilePath' && item.FilePath) {
    return (
      <TouchableOpacity
        onPress={() => !isDownloading && downloadFileFromChat(item.FilePath)}
        disabled={isDownloading}
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isDownloading && styles.disabledMessage,
        ]}>
        <View style={styles.fileBox}>
          {isOwnMessage ? <DocumentIcon /> : <DocumentIconBlack />}
          <Text style={styles.fileName} numberOfLines={1}>
            {getFileNameFromUrl(item.FilePath)}
          </Text>
        </View>
        <View style={styles.messageFooter}>
          <View style={styles.downloadIconContainer}>
            {isDownloading ? (
              <ActivityIndicator
                size="small"
                color={isOwnMessage ? 'white' : 'black'}
              />
            ) : isOwnMessage ? (
              <DownloadIcon />
            ) : (
              <DownloadIconBlack />
            )}
          </View>
          <Text
            style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
            ]}>
            {formattedTime(item.DateTime)}
          </Text>
          {getStatusIndicator()}
        </View>
      </TouchableOpacity>
    );
  }

  if (item.Type === 'VoiceNote' && item.FilePath) {
    return (
      <TouchableOpacity
        onPress={() => playVoiceNote(item.FilePath)}
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          styles.voiceNoteBubble,
        ]}>
        <View style={styles.voiceNoteContainer}>
          <Text
            style={[
              styles.voiceNoteDuration,
              isOwnMessage && styles.ownVoiceNoteDuration,
            ]}>
            {formatTime(currentTime)}
          </Text>
          <View style={styles.voiceNoteControls}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isOwnMessage
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                    isOwnMessage && styles.ownProgressFill,
                  ]}
                />
              </View>
            </View>
            <View
              style={[
                styles.playButton,
                isPlaying && styles.playingButton,
                {
                  backgroundColor: isOwnMessage
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.1)',
                },
                isPlaying && {
                  backgroundColor: isOwnMessage
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.2)',
                },
              ]}>
              <View
                style={[
                  styles.playIcon,
                  isPlaying && styles.pauseIcon,
                  {
                    borderLeftColor: isOwnMessage ? 'white' : 'black',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                  },
                  isPlaying && {
                    borderLeftColor: isOwnMessage ? 'white' : 'black',
                    borderRightColor: isOwnMessage ? 'white' : 'black',
                  },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
            ]}>
            {formattedTime(item.DateTime)}
          </Text>
          {getStatusIndicator()}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        // socketStatus?.isPending && styles.pendingMessage,
        // socketStatus?.isFailed && styles.failedMessage,
      ]}>
      <Text
        style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
        ]}>
        {item.Text}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
          {formattedTime(item.DateTime)}
        </Text>
        {getStatusIndicator()}
      </View>
    </View>
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
    backgroundColor: '#23a2a4',
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
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#23a2a4',
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
    backgroundColor: '#23a2a4',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  sendingMessage: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    gap: 4,
    position: 'relative',
    paddingLeft: 30,
  },
  timestamp: {
    fontSize: 10,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'black',
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
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#23a2a4',
  },
  sendButtonDisabled: {
    backgroundColor: '#313131',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusFailed: {
    color: '#FF4C4C', // red
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusPending: {
    color: '#FFA500', // orange
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusSeen: {
    color: '#4CAF50', // green
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statusDelivered: {
    color: '#2196F3', // blue
    fontSize: 12,
    marginTop: 4,
  },
  statusSent: {
    color: '#9E9E9E', // grey
    fontSize: 12,
    marginTop: 4,
  },
  fileBox: {
    alignItems: 'center',
    padding: 10,
  },
  fileName: {
    color: 'black',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  downloadIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  disabledMessage: {
    opacity: 0.5,
  },
  voiceNoteBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '70%',
    maxWidth: 280,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceNoteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playingButton: {
    // backgroundColor is now handled inline
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderRightWidth: 16,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    marginLeft: 0,
    marginRight: 4,
  },
  pauseIcon: {
    width: 16,
    height: 24,
    borderWidth: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    marginLeft: 0,
    marginRight: 0,
  },
  progressContainer: {
    flex: 1,
    maxWidth: 200,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'black',
  },
  ownProgressFill: {
    backgroundColor: 'white',
  },
  voiceNoteDuration: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
    marginRight: 12,
  },
  ownVoiceNoteDuration: {
    color: 'white',
  },
});

export default ChatMessageRender;
