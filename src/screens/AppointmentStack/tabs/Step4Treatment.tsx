import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalTextStyles } from '../../../styles/globalStyles';
import Procedures, { ProceduresData } from './Step4Components/Procedures';
import Prescription, { PrescriptionData } from './Step4Components/Prescription';
import PatientInstructions, { PatientInstructionsData } from './Step4Components/PatientInstructions';
import NewService, { NewServiceData } from './Step4Components/NewService';
import ReferralConsultation, { ReferralData } from './Step4Components/ReferralConsultation';
import Notes, { NotesData } from './Step4Components/Notes';
import SvgUri from 'react-native-svg-uri';

interface Step4Props {
  // onComplete: () => void;
  onPrevious: () => void;
  patientData: any;
  data?: {
    procedures?: ProceduresData;
    prescription?: PrescriptionData;
    patientInstructions?: PatientInstructionsData;
    newService?: NewServiceData;
    referralConsultation?: ReferralData;
    notes?: NotesData;
  };
  onDataChange?: (data: any) => void;
}

type TabType =
  | 'procedures'
  | 'prescription'
  | 'patientInstructions'
  | 'newService'
  | 'referralConsultation'
  | 'notes';

const Step4Treatment: React.FC<Step4Props> = ({
  patientData,
  onPrevious,
  data,
  onDataChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('procedures');
  const [formData, setFormData] = useState({
    procedures: data?.procedures || {},
    prescription: data?.prescription || {},
    patientInstructions: data?.patientInstructions || {},
    newService: data?.newService || {},
    referralConsultation: data?.referralConsultation || {},
    notes: data?.notes || {},
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'procedures', label: 'Procedures' },
    { key: 'prescription', label: 'Prescription' },
    { key: 'patientInstructions', label: 'Patient Instructions' },
    { key: 'newService', label: 'New Service' },
    { key: 'referralConsultation', label: 'Referral / Consultation' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSubDataChange = useCallback((tab: TabType, subData: any) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: subData,
    }));
  }, []);

  // useEffect(() => {
  //   onDataChange?.(formData);
  // }, [formData, onDataChange]);

  // const tabChangeHandlers = useMemo(
  //   () => ({
  //     procedures: (subData: ProceduresData) => handleSubDataChange('procedures', subData),
  //     prescription: (subData: PrescriptionData) => handleSubDataChange('prescription', subData),
  //     patientInstructions: (subData: PatientInstructionsData) =>
  //       handleSubDataChange('patientInstructions', subData),
  //     newService: (subData: NewServiceData) => handleSubDataChange('newService', subData),
  //     referralConsultation: (subData: ReferralData) =>
  //       handleSubDataChange('referralConsultation', subData),
  //     notes: (subData: NotesData) => handleSubDataChange('notes', subData),
  //   }),
  //   [handleSubDataChange],
  // );

  const handleComplete = () => {
    onDataChange?.(formData);
    // onComplete();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'procedures':
        return (
          <Procedures onDataChange={(data) => handleSubDataChange('procedures', data)} />
        );
      case 'prescription':
        return (
          <Prescription onDataChange={(data) => handleSubDataChange('prescription', data)} />
        );
      case 'patientInstructions':
        return (
            <PatientInstructions
            onDataChange={(data) => handleSubDataChange('patientInstructions', data)}
          />
        );
      case 'newService':
        return (
          <NewService patientData={patientData} onDataChange={(data) => handleSubDataChange('newService', data)} />
        );
      case 'referralConsultation':
        return (
          <ReferralConsultation
            onDataChange={(data) => handleSubDataChange('referralConsultation', data)}
          />
        );
      case 'notes':
        return (
          <Notes onDataChange={(data) => handleSubDataChange('notes', data)} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerIconContainer}>
          <SvgUri
            width={50}
            height={50}
            source={require('../../../assets/icons/TreatmentPlan.svg')}
          />
        </View>
        <Text style={styles.headerTitle}>Treatment Plan</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>{renderTabContent()}</View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Save & Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f7',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
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
  tabsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 25,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tabsScrollContent: {
    paddingHorizontal: 2,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#179c8e',
  },
  tabText: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f0f8f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#179c8e',
  },
  backButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#179c8e',
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
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
  completeButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
});

export default Step4Treatment;

