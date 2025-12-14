import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalTextStyles } from '../../../styles/globalStyles';
import Dropdown from '../../../components/common/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { addVisitRecordService } from '../../../services/api/addVisitRecord';
import { setVisitMainId } from '../../../shared/redux/reducers/generalDataReducer';
import SvgUri from 'react-native-svg-uri';

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
  const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  const user: any = useSelector((state: any) => state.root.user.user);
  const dispatch = useDispatch();

  const durationOptions = [
    { label: 'Day', value: '1' },
    { label: 'Week', value: '2' },
    { label: 'Month', value: '3' },
    { label: 'Year', value: '4' },
    { label: 'Hour', value: '5' },
    { label: 'Minutes', value: '6' },
  ];

  useEffect(() => {
    if (visitRecordData) {
      manageVisitRecordData();
    }
  }, [visitRecordData]);

  const manageVisitRecordData = () => {
    setChiefComplaint(visitRecordData?.PatientComplaint[0]?.ChiefComplaint);
    setPresentIllness(visitRecordData?.PatientComplaint[0]?.PresentIllness);
    setDurationValue(visitRecordData?.PatientComplaint[0]?.DurationOfComplaint.toString());
    setDurationUnit(visitRecordData?.PatientComplaint[0]?.CatTimeUnitId.toString());
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Icon */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <SvgUri
              width={50}
              height={50}
              source={require('../../../assets/icons/PatientComplaint.svg')}
            />
          </View>
          <Text style={styles.headerTitle}>Patient Complaint</Text>
        </View>

        {/* Chief Complaint */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Chief Complaint</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Chief Complaint"
              placeholderTextColor="#999"
              value={chiefComplaint}
              onChangeText={setChiefComplaint}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Present Illness */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Present Illness</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Description"
              placeholderTextColor="#999"
              value={presentIllness}
              onChangeText={setPresentIllness}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Duration Of Complaint */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Duration Of Complaint</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInputWrapper}>
              <TextInput
                style={styles.durationInput}
                placeholder="0"
                placeholderTextColor="#999"
                value={durationValue}
                onChangeText={setDurationValue}
                keyboardType="numeric"
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
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Other Complaint</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Other Complaint"
              placeholderTextColor="#999"
              value={otherComplaint}
              onChangeText={setOtherComplaint}
              multiline
            />
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon name="create-outline" size={20} color="#179c8e" />
            </TouchableOpacity> */}
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

      <CustomBottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        backdropClickable={true}
        showHandle={false}
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
    ...globalTextStyles.h5,
    color: '#179c8e',
    fontWeight: '600',
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
    backgroundColor: '#179c8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  nextButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
  bottomSheetContainer: {
    flex: 1,
  },
  bottomSheetButton: {
    backgroundColor: '#179c8e',
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

