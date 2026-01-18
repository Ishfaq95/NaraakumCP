import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import Dropdown from '../../../components/common/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { addVisitRecordService } from '../../../services/api/addVisitRecord';
import { setVisitMainId } from '../../../shared/redux/reducers/generalDataReducer';
import SvgUri from 'react-native-svg-uri';
import PatientComplaint from '../../../assets/icons/PatientComplaint';
import Voice from '@dev-amirzubair/react-native-voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface Step1Props {
  patientData: any;
  onNext: () => void;
  onDataChange?: (data: any) => void;
}

const Step1PatientComplaint: React.FC<Step1Props> = ({ patientData, onNext, onDataChange }) => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [presentIllness, setPresentIllness] = useState('');
  const [durationValue, setDurationValue] = useState('0');
  const [durationUnit, setDurationUnit] = useState('Day');
  const [otherComplaint, setOtherComplaint] = useState('');
  const [visible, setVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  const user: any = useSelector((state: any) => state.root.user.user);
  const dispatch = useDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const chiefComplaintRef = useRef<TextInput>(null);
  const presentIllnessRef = useRef<TextInput>(null);
  const durationValueRef = useRef<TextInput>(null);
  const otherComplaintRef = useRef<TextInput>(null);
  const chiefComplaintContainerRef = useRef<View>(null);
  const presentIllnessContainerRef = useRef<View>(null);
  const durationContainerRef = useRef<View>(null);
  const otherComplaintContainerRef = useRef<View>(null);
  const inputPositions = useRef<{ [key: string]: number }>({});
  const keyboardHeight = useRef(0);
  const pendingScrollKey = useRef<string | null>(null);
  const stopRequestedRef = useRef(false);
  const activeFieldRef = useRef<string | null>(null);
  const [listeningField, setListeningField] = useState<string | null>(null);

  const durationOptions = [
    { label: 'Day', value: '1' },
    { label: 'Week', value: '2' },
    { label: 'Month', value: '3' },
    { label: 'Year', value: '4' },
    { label: 'Hour', value: '5' },
    { label: 'Minutes', value: '6' },
  ];

  const handleDurationValueChange = (text: string) => {
    // Remove any non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    // Limit to 5 digits maximum
    if (numericValue.length <= 5) {
      setDurationValue(numericValue);
    }
  };

  useEffect(() => {
    if (visitRecordData) {
      manageVisitRecordData();
    }
  }, [visitRecordData]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
        keyboardHeight.current = e.endCoordinates.height;
        setIsKeyboardVisible(true);
        // Scroll to pending input if any
        if (pendingScrollKey.current) {
          setTimeout(() => {
            scrollToInput(pendingScrollKey.current!);
            pendingScrollKey.current = null;
          }, 100);
        }
      });

      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        keyboardHeight.current = 0;
        setIsKeyboardVisible(false);
        pendingScrollKey.current = null;
      });

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }
  }, []);

  const manageVisitRecordData = () => {
    setChiefComplaint(visitRecordData?.PatientComplaint[0]?.ChiefComplaint);
    setPresentIllness(visitRecordData?.PatientComplaint[0]?.PresentIllness);
    setDurationValue(visitRecordData?.PatientComplaint[0]?.DurationOfComplaint?.toString());
    setDurationUnit(visitRecordData?.PatientComplaint[0]?.CatTimeUnitId?.toString());
    setOtherComplaint(visitRecordData?.PatientComplaint[0]?.OtherComplaint);
  };

  const handleAddVisitMain = async () => {
    const payload: any = {
      UserloginInfoId: user?.Id,
      TaskMainId: patientData?.Detail[0]?.TaskMainId,
    };
    const response = await addVisitRecordService.addVisitMain(payload);
    if (response?.StatusCode?.STATUSCODE == 12001) {
      dispatch(setVisitMainId(response.VisitMain[0]?.VisitMainId));
      handleSave(response.VisitMain[0]?.VisitMainId);
    }
  };

  const handleSave = async (visitId?: any) => {
    const payload: any = {
      VisitMainId: visitId || visitmainId,
      ChiefComplaint: chiefComplaint,
      PresentIllness: presentIllness,
      DurationOfComplaint: durationValue,
      CatTimeUnitId: durationUnit,
      OtherComplaint: otherComplaint,
    };

    const response = await addVisitRecordService.addEditVisitRecord(payload);
    if (response?.ResponseStatus?.STATUSCODE === 200) {
      onNext();
    }
  };

  const isDataValid = () => {
    if (chiefComplaint.trim() == '' && presentIllness.trim() == '' && otherComplaint.trim() == '') {
      return true;
    }
    return false;
  };

  const scrollToInput = (key: string) => {
    if (Platform.OS !== 'ios' || !scrollViewRef.current) return;
    
    // Use stored position from onLayout (this is relative to ScrollView content container)
    const position = inputPositions.current[key];
    if (position !== undefined) {
      // When keyboard appears, KeyboardAvoidingView with padding behavior adds padding at bottom
      // We need to scroll so the input is visible above the keyboard
      // Scroll to position minus some offset to keep input visible
      // The offset should account for some header space (around 100-150px)
      const scrollOffset = 150;
      const targetScrollY = Math.max(0, position - scrollOffset);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: targetScrollY,
          animated: true,
        });
      }, 250);
    }
  };

  const handleInputLayout = (key: string, event: any) => {
    if (Platform.OS === 'ios') {
      const { y } = event.nativeEvent.layout;
      inputPositions.current[key] = y;
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
      case 'chiefComplaint':
        setChiefComplaint(prev => appendValue(prev));
        break;
      case 'presentIllness':
        setPresentIllness(prev => appendValue(prev));
        break;
      case 'duration':
        setDurationValue(prev => appendValue(prev));
        break;
      case 'otherComplaint':
        setOtherComplaint(prev => appendValue(prev));
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

      if (Platform.OS === 'ios' && listeningField) {
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
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Platform.OS === 'ios' ? (isKeyboardVisible ? 100 : 20) : 20 }
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header with Icon */}
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <PatientComplaint width={50} height={50} />
            </View>
            <Text style={styles.headerTitle}>Patient Complaint</Text>
          </View>

          {/* Chief Complaint */}
          <View 
            ref={chiefComplaintContainerRef}
            style={styles.fieldContainer}
            onLayout={(event) => handleInputLayout('chiefComplaint', event)}
          >
            <Text style={styles.label}>Chief Complaint</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={chiefComplaintRef}
                style={styles.textInput}
                placeholder="Chief Complaint"
                placeholderTextColor="#999"
                value={chiefComplaint}
                onChangeText={setChiefComplaint}
                multiline
                onFocus={() => {
                  if (Platform.OS === 'ios') {
                    pendingScrollKey.current = 'chiefComplaint';
                    // If keyboard is already visible, scroll immediately
                    if (keyboardHeight.current > 0) {
                      setTimeout(() => scrollToInput('chiefComplaint'), 300);
                    }
                  }
                }}
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMicPress('chiefComplaint')}
              >
                {listeningField === 'chiefComplaint' ? <FontAwesome name="square" size={18} color="red" /> : <Ionicons name="mic" size={20} color="#666" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Present Illness */}
          <View 
            ref={presentIllnessContainerRef}
            style={styles.fieldContainer}
            onLayout={(event) => handleInputLayout('presentIllness', event)}
          >
            <Text style={styles.label}>Present Illness</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={presentIllnessRef}
                style={styles.textInput}
                placeholder="Description"
                placeholderTextColor="#999"
                value={presentIllness}
                onChangeText={setPresentIllness}
                multiline
                onFocus={() => {
                  if (Platform.OS === 'ios') {
                    pendingScrollKey.current = 'presentIllness';
                    // If keyboard is already visible, scroll immediately
                    if (keyboardHeight.current > 0) {
                      setTimeout(() => scrollToInput('presentIllness'), 300);
                    }
                  }
                }}
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMicPress('presentIllness')}
              >
                {listeningField === 'presentIllness' ? <FontAwesome name="square" size={18} color="red" /> : <Ionicons name="mic" size={20} color="#666" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration Of Complaint */}
          <View 
            ref={durationContainerRef}
            style={styles.fieldContainer}
            onLayout={(event) => handleInputLayout('duration', event)}
          >
            <Text style={styles.label}>Duration Of Complaint</Text>
            <View style={styles.durationContainer}>
              <View style={styles.durationInputWrapper}>
                <TextInput
                  ref={durationValueRef}
                  style={styles.durationInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={durationValue}
                  onChangeText={handleDurationValueChange}
                  keyboardType="numeric"
                  maxLength={5}
                  onFocus={() => {
                    if (Platform.OS === 'ios') {
                      pendingScrollKey.current = 'duration';
                      // If keyboard is already visible, scroll immediately
                      if (keyboardHeight.current > 0) {
                        setTimeout(() => scrollToInput('duration'), 300);
                      }
                    }
                  }}
                />
              </View>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  data={durationOptions}
                  value={durationUnit}
                  onChange={(value) => setDurationUnit(value as string)}
                  placeholder="Select"
                  // containerStyle={styles.dropdown}
                  containerStyle={{ height: 45 }}
                  dropdownStyle={[{ height: 45 }]}
                />
              </View>
            </View>
          </View>

          {/* Other Complaint */}
          <View 
            ref={otherComplaintContainerRef}
            style={styles.fieldContainer}
            onLayout={(event) => handleInputLayout('otherComplaint', event)}
          >
            <Text style={styles.label}>Other Complaint</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={otherComplaintRef}
                style={styles.textInput}
                placeholder="Other Complaint"
                placeholderTextColor="#999"
                value={otherComplaint}
                onChangeText={setOtherComplaint}
                multiline
                onFocus={() => {
                  if (Platform.OS === 'ios') {
                    pendingScrollKey.current = 'otherComplaint';
                    // If keyboard is already visible, scroll immediately
                    if (keyboardHeight.current > 0) {
                      setTimeout(() => scrollToInput('otherComplaint'), 300);
                    }
                  }
                }}
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleMicPress('otherComplaint')}
              >
                {listeningField === 'otherComplaint' ? <FontAwesome name="square" size={18} color="red" /> : <Ionicons name="mic" size={20} color="#666" />}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Save / Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.nextButton]} onPress={() => {
            if (!visitRecordData && isDataValid()) {
              setVisible(true);
            } else {
              if (visitmainId) {
                handleSave();
              } else {
                handleAddVisitMain();
              }
            }
          }}>
            <Text style={[styles.nextButtonText, { color: !visitRecordData ? '#fff' : '#fff' }]}>Save / Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomBottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        backdropClickable={true}
        showHandle={false}
        maxHeight={"20%"}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: 16, paddingVertical: 16}}>
            <Text style={{...globalTextStyles.buttonLarge, color: '#000'}}>Warning</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 16}}>
            <Text style={{...globalTextStyles.bodyMedium, color: '#000'}}>please provide data before saving.</Text>
          </View>
          <View style={{width:100,alignSelf:'center',marginVertical: 16}}>
            <TouchableOpacity style={styles.bottomSheetButton} onPress={() => setVisible(false)}>
              <Text style={styles.bottomSheetButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#e6f7f5',
    // borderRadius: 25,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#23a2a4',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textInput: {
    flex: 1,
    ...globalTextStyles.bodySmall,
    color: '#333',
    minHeight: 40,
    paddingVertical: 0,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f0f8f7',
    borderRadius: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  durationInputWrapper: {
    height: 44,
    width: '39%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
  },
  durationInput: {
    ...globalTextStyles.bodySmall,
    color: '#333',
    paddingVertical: 12,
  },
  dropdownWrapper: {
    height: 45,
    width: '59%',
  },
  durationMicButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 4,
  },
  dropdown: {
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#fff',
  },
  bottomSheetContainer: {
    flex: 1,
  },
  bottomSheetButton: {
    backgroundColor: '#23a2a4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetButtonText: {
    ...globalTextStyles.buttonLarge,
    color: '#fff',
  },
});

export default Step1PatientComplaint;

