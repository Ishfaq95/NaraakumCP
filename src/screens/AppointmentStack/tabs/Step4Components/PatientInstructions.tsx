import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { globalTextStyles } from '../../../../styles/globalStyles';
import Voice from '@dev-amirzubair/react-native-voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface PatientInstructionsData {
  Instructions?: string;
  Diagnosis?: string;
  Notes?: string;
  VisitMainId?: number;
  Id?: number;
}

interface PatientInstructionsProps {
  data?: any[];
  onDataChange?: (data: any[]) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const PatientInstructions: React.FC<PatientInstructionsProps> = ({ data, onDataChange, scrollToInput }) => {
  const [instructions, setInstructions] = useState<string>('');
  const instructionsCardRef = useRef<View>(null);
  const isInitialized = useRef(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);
  const activeFieldRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize once from backend data
    if (!isInitialized.current && data) {
      setInstructions(data[0]?.Instructions || '');
      isInitialized.current = true;
    }
  }, [data]);

  useEffect(() => {
    // Notify parent of changes
    if (isInitialized.current && onDataChange) {
      const updatedData = [{
        Instructions: instructions,
        Diagnosis: data?.[0]?.Diagnosis || '',
        Notes: data?.[0]?.Notes || '',
        VisitMainId: data?.[0]?.VisitMainId || 0,
        Id: data?.[0]?.Id || 0,
      }];
      onDataChange(updatedData);
    }
  }, [instructions]);

  const handleFocus = () => {
    if (scrollToInput && instructionsCardRef.current) {
      scrollToInput(instructionsCardRef);
    }
  };

  const updateFieldFromSpeech = (fieldKey: string, value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    const appendValue = (prevValue: string) => {
      const trimmedPrev = prevValue.trim();
      const trimmedNew = normalized;
      if (Platform.OS === 'android') {
        if (trimmedPrev && trimmedNew) {
          return `${trimmedPrev} ${trimmedNew}`;
        }
        return trimmedPrev || trimmedNew;
      }
      return normalized;
    };

    if (fieldKey === 'instructions') {
      setInstructions(prev => appendValue(prev));
    }
  };

  const startListening = async (fieldKey: string) => {
    try {
      if (listeningField && listeningField !== fieldKey) {
        stopRequestedRef.current = true;
        await Voice.stop();
      }

      stopRequestedRef.current = false;
      activeFieldRef.current = fieldKey;
      setListeningField(fieldKey);
      await Voice.start('en-US');
    } catch (error) {
      activeFieldRef.current = null;
      setListeningField(null);
    }
  };

  const stopListening = async () => {
    stopRequestedRef.current = true;
    try {
      await Voice.stop();
    } catch (error) {
      // ignore
    }
    activeFieldRef.current = null;
    setListeningField(null);
  };

  const handleMicPress = async (fieldKey: string) => {
    if(Platform.OS === 'ios') {
      await stopListening();

      if(listeningField || listeningField === fieldKey) {
        return
      }else {
        await startListening(fieldKey);
      }
    }else{
      if (listeningField === fieldKey) {
        await stopListening();
        return;
      } 
      await startListening(fieldKey);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = () => {
      if (activeFieldRef.current) {
        setListeningField(activeFieldRef.current);
      }
    };

    Voice.onSpeechResults = (event: any) => {
      const spokenText = event?.value?.[0] ?? '';
      if (!spokenText || !activeFieldRef.current) {
        return;
      }

      updateFieldFromSpeech(activeFieldRef.current, spokenText);
      if (Platform.OS === 'android') {
        activeFieldRef.current = null;
        setListeningField(null);
      }
    };

    Voice.onSpeechEnd = () => {
      if (stopRequestedRef.current) {
        stopRequestedRef.current = false;
        activeFieldRef.current = null;
        setListeningField(null);
        return;
      }

      if (Platform.OS === 'ios' && activeFieldRef.current) {
        Voice.start('en-US');
      }
    };

    Voice.onSpeechError = () => {
      stopRequestedRef.current = false;
      activeFieldRef.current = null;
      setListeningField(null);
    };

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Patient Instructions</Text>

        <View ref={instructionsCardRef} style={styles.card}>
          <TextInput
            style={styles.textInput}
            placeholder="Patient Instructions"
            placeholderTextColor="#999"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            onFocus={handleFocus}
          />
          <TouchableOpacity 
            style={styles.micButton}
            onPress={() => handleMicPress('instructions')}
          >
            {listeningField === 'instructions' ? (
              <FontAwesome name="square" size={18} color="red" />
            ) : (
              <Ionicons name="mic" size={20} color="#6f7c82" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...globalTextStyles.h5,
    color: '#1a3c40',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce5e4',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    ...globalTextStyles.bodySmall,
    color: '#1a2c32',
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 140,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
  textInput: {
    flex: 1,
    ...globalTextStyles.bodySmall,
    color: '#333',
    minHeight: 40,
    paddingVertical: 0,
  },
  micButton: {
    marginLeft: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f2f6f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PatientInstructions;


