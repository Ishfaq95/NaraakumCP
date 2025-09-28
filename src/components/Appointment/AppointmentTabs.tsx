import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type TabType = 'previous' | 'today' | 'upcoming';

interface AppointmentTabsProps {
  onTabChange: (tab: TabType) => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'previous' && styles.activeTab,
            { borderTopLeftRadius: 25, borderBottomLeftRadius: 25 }
          ]}
          onPress={() => handleTabPress('previous')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'previous' && styles.activeTabText
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'today' && styles.activeTab
          ]}
          onPress={() => handleTabPress('today')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'today' && styles.activeTabText
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab,
            { borderTopRightRadius: 25, borderBottomRightRadius: 25 }
          ]}
          onPress={() => handleTabPress('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding:5,
    borderRadius: 25,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderRadius: 25,
    backgroundColor: '#00A19D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AppointmentTabs;
