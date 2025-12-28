import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import VitalSigns from './Step3Components/VitalSigns';
import OE from './Step3Components/OE';
import LabXRays from './Step3Components/LabXRays';
import DX from './Step3Components/DX';
import { useDispatch, useSelector } from 'react-redux';
import { addVisitRecordService } from '../../../services/api/addVisitRecord';
import SvgUri from 'react-native-svg-uri';
import PatientAssessment from '../../../assets/icons/PatientAssessment';

interface Step3Props {
  onNext: () => void;
  onSkip: () => void;
  getVisitMainRecordDetail: () => void;
}

type TabType = 'vitalSigns' | 'oe' | 'labXRays' | 'dx';

const Step3PatientAssessment: React.FC<Step3Props> = ({ 
  onNext, 
  onSkip,
  getVisitMainRecordDetail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('vitalSigns');
  const visitRecordData: any = useSelector((state: any) => state.root.generalData.visitRecordData);
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  const dispatch = useDispatch();
  const [assessmentData, setAssessmentData] = useState({
    vitalSigns: [],
    oe: [],
    labXRays: [],
    dx: [],
  });

  useEffect(() => {
    if (visitRecordData) {
      manageAssessmentData();
    } }, [visitRecordData]);

  const manageAssessmentData = () => {
    setAssessmentData({
      vitalSigns: visitRecordData?.PatientAssessment[0]?.VitalSigns,
      oe: visitRecordData?.PatientAssessment[0]?.OE,
      labXRays: visitRecordData?.PatientAssessment[0]?.LabXRays,
      dx: visitRecordData?.PatientAssessment[0]?.Diagnosis,
    });
  };

  const handleSave = async () => {
    await handleSaveVitalSigns();
  };

  const handleSaveVitalSigns = async () => {
    try {
      const payload = {
        VisitMainId: visitmainId,
        Tem: assessmentData.vitalSigns[0]?.Tem,
        HR: assessmentData.vitalSigns[0]?.HR,
        P4O2: assessmentData.vitalSigns[0]?.P4O2,
        RR: assessmentData.vitalSigns[0]?.RR,
        Bp: assessmentData.vitalSigns[0]?.Bp,
      };
      const response = await addVisitRecordService.addEditVisitPatientVitalSigns(payload);
      if (response?.StatusCode?.STATUSCODE == 12007) {
        getVisitMainRecordDetail();
      }
    } catch (error: any) {
    }
    
  };



  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSubDataChange = (tab: TabType, subData: any) => {
    const updatedData = {
      ...assessmentData,
      [tab]: subData,
    };
    setAssessmentData(updatedData);
  };

  const handleNext = () => {
    onNext();
  };

  const tabs = [
    { key: 'vitalSigns' as TabType, label: 'Vital Signs' },
    { key: 'oe' as TabType, label: 'O/E' },
    { key: 'labXRays' as TabType, label: 'Lab & X-Rays' },
    { key: 'dx' as TabType, label: 'DX' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vitalSigns':
        return (
          <VitalSigns
            data={assessmentData.vitalSigns}
            onDataChange={(data) => handleSubDataChange('vitalSigns', data)}
          />
        );
      case 'oe':
        return (
          <OE
            data={assessmentData.oe}
            onDataChange={(data) => handleSubDataChange('oe', data)}
          />
        );
      case 'labXRays':
        return (
          <LabXRays
            data={assessmentData.labXRays}
            onDataChange={(data) => handleSubDataChange('labXRays', data)}
            visitmainId={visitmainId}
            onSaveSuccess={() => getVisitMainRecordDetail()}
          />
        );
      case 'dx':
        return (
          <DX
            data={assessmentData.dx}
            onDataChange={(data) => handleSubDataChange('dx', data)}
          />
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
          {/* <SvgUri
            width={50}
            height={50}
            source={require('../../../assets/icons/PatientAssessment.svg')}
          /> */}
          <PatientAssessment width={50} height={50} />
        </View>
        <Text style={styles.headerTitle}>Patient Assessment</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
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

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleSave}>
          <Text style={styles.nextButtonText}>Save / Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f8f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#179c8e',
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
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 24,
    color: '#fff',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 24,
    color: '#666',
  },
});

export default Step3PatientAssessment;

