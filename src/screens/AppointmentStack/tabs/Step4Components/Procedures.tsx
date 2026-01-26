import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Dropdown from '../../../../components/common/Dropdown';
import { globalTextStyles } from '../../../../styles/globalStyles';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';
import Voice from '@dev-amirzubair/react-native-voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface ProceduresData {
  Id?: number;
  VisitMainId?: number;
  Procedurees?: string;
  CatProcedureId?: number;
  Comments?: string;
}

interface ProceduresProps {
  data?: ProceduresData[];
  onDataChange?: (data: ProceduresData[]) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const PROCEDURE_OPTIONS = [
  { label: 'Select an option', value: '' },
  { label: 'Dental Cleaning', value: 'dental_cleaning' },
  { label: 'Root Canal Treatment', value: 'root_canal' },
  { label: 'Tooth Extraction', value: 'tooth_extraction' },
  { label: 'Cavity Filling', value: 'cavity_filling' },
];

const Procedures: React.FC<ProceduresProps> = ({ data, onDataChange, scrollToInput }) => {
  const [procedures, setProcedures] = useState<ProceduresData[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const commentInputRef = useRef<TextInput>(null);
  const commentCardRef = useRef<View>(null);
  const isInitialized = useRef(false);
  const [procedureOptions, setProcedureOptions] = useState<any[]>([]);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);
  const activeFieldRef = useRef<string | null>(null);

  useEffect(() => {
    getAllProcedures();
  }, []);

  const getAllProcedures =async ()=>{
    try {
      const response = await addVisitRecordService.getAllProcedure();
      if(response.ResponseStatus.STATUSCODE === 200){
        const proceduresList =[
          { label: 'Select an option', value: '' },
          ...response.list.map((item: any) => ({
            label: item.Title,
            value: item.Id.toString(),
          }))
        ]
        setProcedureOptions(proceduresList);
      }
  
    } catch (error) {
      console.log("error", error);
    }
    
  }

  useEffect(() => {
    // Only initialize once from backend data
    if (!isInitialized.current && data && data.length > 0) {
      setProcedures(data);
      // Set first procedure data if available
      if (data[0]) {
        setSelectedProcedure(data[0].CatProcedureId?.toString() || '');
        setComments(data[0].Comments || '');
      }
      isInitialized.current = true;
    }
  }, [data]);

  useEffect(() => {
    // Notify parent of changes
    if (isInitialized.current && onDataChange) {
      const updatedData = [{
        CatProcedureId: parseInt(selectedProcedure) || 0,
        Comments: comments,
        Procedurees: procedureOptions.find((option: any) => option.value === selectedProcedure)?.label || '',
        VisitMainId: data?.[0]?.VisitMainId || 0,
        Id: data?.[0]?.Id || 0,
      }];
      onDataChange(updatedData);

    }
  }, [selectedProcedure, comments]);

  const handleCommentFocus = () => {
    if (scrollToInput && commentCardRef.current) {
      scrollToInput(commentCardRef);
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

    if (fieldKey === 'comments') {
      setComments(prev => appendValue(prev));
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
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Procedures</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Procedure</Text>
        <View style={styles.dropdownWrapper}>
          <Dropdown
            data={procedureOptions}
            value={selectedProcedure}
            placeholder="Select an option"
            onChange={(value) => setSelectedProcedure(value as string)}
            containerStyle={styles.dropdownContainer}
            dropdownStyle={styles.dropdownInner}
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Comments</Text>
        <View ref={commentCardRef} style={styles.commentCard}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Procedures"
            placeholderTextColor="#9ba0a5"
            multiline
            value={comments}
            onChangeText={setComments}
            onFocus={handleCommentFocus}
          />
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleMicPress('comments')}
          >
            {listeningField === 'comments' ? (
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
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    ...globalTextStyles.bodySmall,
    color: '#1a2c32',
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce5e4',
    overflow: 'hidden',
  },
  dropdownContainer: {
    height: 48,
  },
  dropdownInner: {
    height: 48,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 110,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce5e4',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentInput: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
  },
  commentAction: {
    marginLeft: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f2f6f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Procedures;


