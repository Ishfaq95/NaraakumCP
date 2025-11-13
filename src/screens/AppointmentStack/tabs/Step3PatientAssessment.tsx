import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalTextStyles } from '../../../styles/globalStyles';
import VitalSigns from './Step3Components/VitalSigns';
import OE from './Step3Components/OE';
import LabXRays from './Step3Components/LabXRays';
import DX from './Step3Components/DX';

interface Step3Props {
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  data?: {
    vitalSigns?: any;
    oe?: any;
    labXRays?: any;
    dx?: any;
  };
  onDataChange?: (data: any) => void;
}

type TabType = 'vitalSigns' | 'oe' | 'labXRays' | 'dx';

const Step3PatientAssessment: React.FC<Step3Props> = ({ 
  onNext, 
  onPrevious, 
  onSkip,
  data, 
  onDataChange 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('vitalSigns');
  const [formData, setFormData] = useState({
    vitalSigns: data?.vitalSigns || {},
    oe: data?.oe || {},
    labXRays: data?.labXRays || {},
    dx: data?.dx || {},
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSubDataChange = (tab: TabType, subData: any) => {
    const updatedData = {
      ...formData,
      [tab]: subData,
    };
    setFormData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const handleNext = () => {
    if (onDataChange) {
      onDataChange(formData);
    }
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
            data={formData.vitalSigns}
            onDataChange={(data) => handleSubDataChange('vitalSigns', data)}
          />
        );
      case 'oe':
        return (
          <OE
            data={formData.oe}
            onDataChange={(data) => handleSubDataChange('oe', data)}
          />
        );
      case 'labXRays':
        return (
          <LabXRays
            data={formData.labXRays}
            onDataChange={(data) => handleSubDataChange('labXRays', data)}
          />
        );
      case 'dx':
        return (
          <DX
            data={formData.dx}
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
          <MaterialCommunityIcons name="stethoscope" size={30} color="#179c8e" />
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
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
    backgroundColor: '#e6f7f5',
    borderRadius: 25,
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
  nextButton: {
    flex: 2,
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
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  skipButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#666',
    fontWeight: '600',
  },
});

export default Step3PatientAssessment;

