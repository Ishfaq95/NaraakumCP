import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Dropdown from '../../../../components/common/Dropdown';
import { globalTextStyles } from '../../../../styles/globalStyles';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';
import { useSelector } from 'react-redux';
import Voice from '@dev-amirzubair/react-native-voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface ReferralData {
  Id?: number;
  VisitMainId?: number;
  CatSpecializationId?: number;
  Title?: string;
  ReferTo?: string;
  Organization?: string;
}

interface ReferralConsultationProps {
  data?: ReferralData[];
  onDataChange?: (data: ReferralData[]) => void;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const REFERRAL_TYPES = [
  { label: 'Select an option', value: '' },
  { label: 'In-house Referral', value: 'in_house' },
  { label: 'External Specialist', value: 'external' },
  { label: 'Follow-up Consultation', value: 'follow_up' },
];

const ReferralConsultation: React.FC<ReferralConsultationProps> = ({ data, onDataChange, scrollToInput }) => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralType, setReferralType] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const organizationCardRef = useRef<View>(null);
  const notesCardRef = useRef<View>(null);
  const isInitialized = useRef(false);
  const [specializationOptions, setSpecializationOptions] = useState<any[]>([]);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);
  const activeFieldRef = useRef<string | null>(null);
  useEffect(() => {
    getAllSpecialization();
  }, []);

  const getAllSpecialization = async () => {
    const response = await addVisitRecordService.getAllSpecialization();
    if(response.ResponseStatus.STATUSCODE === 200){
      const specializationList = response.list.map((item: any) => ({
        label: item.Title,
        value: item.Id.toString(),
      }));
      setSpecializationOptions(specializationList);
    }
  }

  useEffect(() => {
    // Only initialize once from backend data
    if (!isInitialized.current && data && data.length > 0) {
      setReferrals(data);
      // Set first referral data if available
      if (data[0]) {
        setReferralType(data[0].CatSpecializationId?.toString() || '');
        setOrganization(data[0].Organization || '');
        setNotes(data[0].ReferTo || '');
      }
      isInitialized.current = true;
    }
  }, [data]);

  useEffect(() => {
    // Notify parent of changes
    if (isInitialized.current && onDataChange) {
      const updatedData = [{
        CatSpecializationId: parseInt(referralType) || 0,
        Title: specializationOptions.find((item: any) => item.value === referralType)?.label || '',
        ReferTo: notes,
        Organization: organization,
        Id: data?.[0]?.Id || 0,
        VisitMainId: data?.[0]?.VisitMainId || 0,
      }];
      onDataChange(updatedData);
    }
  }, [referralType, organization, notes]);

  const handleOrganizationFocus = () => {
    if (scrollToInput && organizationCardRef.current) {
      scrollToInput(organizationCardRef);
    }
  };

  const handleNotesFocus = () => {
    if (scrollToInput && notesCardRef.current) {
      scrollToInput(notesCardRef);
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

    switch (fieldKey) {
      case 'organization':
        setOrganization(prev => appendValue(prev));
        break;
      case 'referralNotes':
        setNotes(prev => appendValue(prev));
        break;
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
        <Text style={styles.sectionTitle}>Referral / Consultation</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Referral Type</Text>
          <View style={styles.dropdownWrapper}>
            <Dropdown
              data={specializationOptions}
              value={referralType}
              placeholder="Select an option"
              onChange={(value) => setReferralType(value as string)}
              containerStyle={styles.dropdownContainer}
              dropdownStyle={styles.dropdownInner}
            />
          </View>
        </View>

        <View ref={organizationCardRef} style={styles.card}>
          <Text style={styles.label}>Organization</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.singleLine}
              placeholder="Enter organization name"
              placeholderTextColor="#9ba0a5"
              value={organization}
              onChangeText={setOrganization}
              onFocus={handleOrganizationFocus}
            />
            <TouchableOpacity 
              style={styles.micButton}
              onPress={() => handleMicPress('organization')}
            >
              {listeningField === 'organization' ? (
                <FontAwesome name="square" size={18} color="red" />
              ) : (
                <Ionicons name="mic" size={20} color="#6f7c82" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View ref={notesCardRef} style={styles.card}>
          <Text style={styles.label}>Notes</Text>
          <View style={styles.textAreaRow}>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Add additional notes for the referral"
              placeholderTextColor="#9ba0a5"
              value={notes}
              onChangeText={setNotes}
              onFocus={handleNotesFocus}
            />
            <TouchableOpacity 
              style={styles.micButton}
              onPress={() => handleMicPress('referralNotes')}
            >
              {listeningField === 'referralNotes' ? (
                <FontAwesome name="square" size={18} color="red" />
              ) : (
                <Ionicons name="mic" size={20} color="#6f7c82" />
              )}
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  singleLine: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
    borderWidth: 1,
    borderColor: '#dce5e4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  textAreaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    minHeight: 120,
    ...globalTextStyles.bodyMedium,
    color: '#1a2c32',
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

export default ReferralConsultation;


