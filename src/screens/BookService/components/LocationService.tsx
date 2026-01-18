import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../../../components/common/Header';
import ArrowRightIcon from '../../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../shared/utils/routes';
import { useSelector } from 'react-redux';
import { globalTextStyles } from '../../../styles/globalStyles';
import MapTab from '../LocationTabs/MapTab';
import SavedAddresses from '../LocationTabs/SavedAddresses';
import { useNavigation } from '@react-navigation/native';

const TABS = [
    { key: 'map', label: 'Select Location' },
    { key: 'list', label: 'Patient Saved Addresses' },
];

const LocationScreen = ({ onPressLocation, patientInfo }: { onPressLocation: () => void, patientInfo: any }) => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('map');
    const category = useSelector((state: any) => state.root.booking.category);

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{t('booking')}</Text>
            }
            leftComponent={
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bookButton}>
                    <ArrowRightIcon />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* {renderHeader()} */}
            <View style={styles.tabContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ flex: 1 }}>
                {activeTab === 'map' ? <MapTab onPressLocation={() => onPressLocation()} /> : <SavedAddresses onPressLocation={() => onPressLocation()} patientInfo={patientInfo} />}
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff',borderTopLeftRadius: 20,borderTopRightRadius: 20 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    activeTab: {
        backgroundColor: '#36a6ad',
    },
    tabLabel: {
        ...globalTextStyles.bodyMedium,
        color: '#333',
        fontFamily: globalTextStyles.h3.fontFamily,
    },
    activeTabLabel: {
        ...globalTextStyles.bodyMedium,
        color: '#fff',
        fontFamily: globalTextStyles.h3.fontFamily,
    },
    content: { flex: 1 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
    },
    headerTitle: {
        ...globalTextStyles.h3,
        color: '#000'
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    bookButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    }
});

export default LocationScreen; 