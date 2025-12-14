import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, FlatList, Dimensions, TouchableWithoutFeedback, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import FullScreenLoader from '../../components/FullScreenLoader';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');
const SLIDER_WIDTH = screenWidth - 80; // Account for padding

const ClientSectionScreen = () => {
    const navigation = useNavigation();
    const [serviceProviderPreferences, setServiceProviderPreferences] = useState<any>(null);
    const user = useSelector((state: any) => state.root.user.user);
    const [isAddPreferenceBottomSheetVisible, setIsAddPreferenceBottomSheetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingPreference, setEditingPreference] = useState<any>(null);
    
    // Modal state
    const [selectedGender, setSelectedGender] = useState<any>(null);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);

    // Range slider state - simple and clean
    const sliderWidth = SLIDER_WIDTH;
    const minAge = 0;
    const maxAge = 100;
    const [ageValues, setAgeValues] = useState([25, 70]);

    useEffect(() => {
        getServiceProviderPreferences();
    }, []);

    const getServiceProviderPreferences = async () => {
        try {
            setIsLoading(true);
            const payload = {
                UserloginInfoId: user.Id,
            };
            const response = await profileService.getServiceProviderPreferences(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setServiceProviderPreferences(response.list);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    const renderPreferenceItem = (item: any) => {
        return (
            <View style={styles.preferenceCard}>
                <View style={styles.preferenceContent}>
                    <View style={styles.preferenceRow}>
                        <Text style={styles.label}>Gender</Text>
                        <Text style={styles.value}>{item.ClientGender}</Text>
                    </View>
                    <View style={styles.preferenceRow}>
                        <Text style={styles.label}>Age Group</Text>
                        <Text style={styles.value}>{item.ClientAgeLowerLimit} - {item.ClientAgeUperLimit}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditPreference(item)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePreference(item)}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const handleEditPreference = (item: any) => {
        // Set the editing item
        setEditingPreference(item);
        
        // Pre-fill the form with existing values
        setSelectedGender((item.ClientGender == null || item.ClientGender == 'Both') ? null : item.ClientGender === 1 || item.ClientGender === 'Male' ? 'Male' : 'Female');
        setAgeValues([item.ClientAgeLowerLimit, item.ClientAgeUperLimit]);
        
        // Open the modal
        setIsAddPreferenceBottomSheetVisible(true);
    };

    const handleDeletePreference = async (item: any) => {
        try {
            setIsLoading(true);
            const payload = {
                PreferenceId: item.Id,
            };
            const response = await profileService.deleteServiceProviderPreference(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                getServiceProviderPreferences();
            }
        } catch (error) {
            setIsLoading(false);
        } finally {
           
        }
    };

    const handleAddPreference = () => {
        // Reset editing state
        setEditingPreference(null);
        
        // Reset to default values when opening modal
        setSelectedGender(null as any);
        setAgeValues([25, 70]);
        setIsAddPreferenceBottomSheetVisible(true);
    };

    const handleSavePreference = async () => {
        try {
            setIsLoading(true);
            const payload: any = {
                UserloginInfoId: user.Id,
                ClientGender: selectedGender == null ? null : selectedGender == 'Male' ? 1 : 0,
                ClientAgeLowerLimit: ageValues[0],
                ClientAgeUperLimit: ageValues[1],
            };
            
            // If editing, add the preference ID
            if (editingPreference) {
                payload.PreferencesId = editingPreference.Id;
            }
            
            const response = await profileService.addUpdateServiceProviderPreference(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setIsAddPreferenceBottomSheetVisible(false);
                setEditingPreference(null);
                setSelectedGender(null as any);
                setAgeValues([25, 70]);
                getServiceProviderPreferences(); // Refresh the list
            }

        } catch (error) {
            setIsLoading(false);
        } finally {
            
        }
    };

    const handleSliderChange = (values: number[]) => {
        setAgeValues(values);
    };

    const renderRangeSlider = () => {
        return (
            <View style={styles.sliderContainer}>
                <MultiSlider
                    values={ageValues}
                    onValuesChange={handleSliderChange}
                    min={minAge}
                    max={maxAge}
                    step={1}
                    sliderLength={sliderWidth}
                    selectedStyle={{
                        backgroundColor: '#23a2a4',
                    }}
                    unselectedStyle={{
                        backgroundColor: '#e0e0e0',
                    }}
                    markerStyle={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 2,
                        borderColor: '#23a2a4',
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 3,
                    }}
                    pressedMarkerStyle={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 2,
                        borderColor: '#23a2a4',
                        height: 26,
                        width: 26,
                        borderRadius: 13,
                    }}
                    containerStyle={{
                        height: 40,
                    }}
                    trackStyle={{
                        height: 4,
                        borderRadius: 2,
                    }}
                />
            </View>
        );
    };

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Client Section</Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                    {renderHeader()}
                    <View style={{ flex: 1, padding: 12 }}>
                        <Text style={styles.title}>You can specify the gender and age group of clients who can book an appointment with you</Text>
                        <View style={{ flex: 1, marginTop: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', paddingBottom: 10 }}>My Preferences</Text>
                        </View>
                    </View>
                </View>
                <FullScreenLoader visible={true} />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                {renderHeader()}
                <View style={{ flex: 1, padding: 12 }}>
                    <Text style={styles.title}>You can specify the gender and age group of clients who can book an appointment with you</Text>
                    <View style={{ flex: 1, marginTop: 10 }}>
                        <Text style={{ fontSize: 20, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20, paddingBottom: 10 }}>My Preferences</Text>

                        <FlatList
                            data={serviceProviderPreferences}
                            keyExtractor={(item) => item.Id.toString()}
                            renderItem={({ item }) => renderPreferenceItem(item)}
                            ListEmptyComponent={
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                    <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', lineHeight: Platform.OS === 'ios' ? 0 : 20, paddingBottom: 10 }}>No preferences found</Text>
                                </View>
                            }
                        />

                        {serviceProviderPreferences?.length == 0 && <TouchableOpacity style={styles.addButton} onPress={() => handleAddPreference()}>
                            <Ionicons name="add-circle" size={24} color="#fff" />
                            <Text style={styles.addButtonText}>Add Preference</Text>
                        </TouchableOpacity>}

                    </View>
                </View>

                <CustomBottomSheet
                    visible={isAddPreferenceBottomSheetVisible}
                    onClose={() => {
                        setIsAddPreferenceBottomSheetVisible(false);
                        setShowGenderDropdown(false);
                        setEditingPreference(null);
                    }}
                    showHandle={false}
                    maxHeight="50%"
                    backdropClickable={true}
                >
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingPreference ? 'Edit Preferences' : 'Add Preferences'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsAddPreferenceBottomSheetVisible(false);
                                    setEditingPreference(null);
                                }}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSeparator} />

                        {/* Client Gender Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Client Gender</Text>
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                                >
                                    <Text style={styles.dropdownText}>{selectedGender == null ? '--Select--' : selectedGender == 'Male' ? 'Male' : 'Female'}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#333" />
                                </TouchableOpacity>

                                {showGenderDropdown && (
                                    <View style={styles.dropdown}>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedGender(null as any);
                                                setShowGenderDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>--Select--</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedGender('Male');
                                                setShowGenderDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>Male</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedGender('Female');
                                                setShowGenderDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>Female</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Age Group Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Age Group</Text>
                            {renderRangeSlider()}
                            <View style={styles.ageRangeText}>
                                <Text style={styles.ageRangeLabel}>
                                    From <Text style={styles.ageRangeValue}>{ageValues[0]}</Text> to <Text style={styles.ageRangeValue}>{ageValues[1]}</Text> years
                                </Text>
                            </View>
                        </View>

                        {/* Add/Update Button */}
                        <TouchableOpacity style={styles.addPreferenceButton} onPress={handleSavePreference}>
                            <Text style={styles.addPreferenceButtonText}>
                                {editingPreference ? 'Update' : '+ Add'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </CustomBottomSheet>
            </View>

           
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    title: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#666',
        lineHeight: 20,
        paddingVertical: 6,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 12,
    },
    preferenceCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 4,
    },
    preferenceContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    preferenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    label: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#333',
        lineHeight: 20,
    },
    value: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#333',
        lineHeight:  20,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        flex: 0.45,
        alignItems: 'center',
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: '#ff4444',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        flex: 0.45,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#23a2a4',
    },
    deleteButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#ff4444',
    },
    addButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#23a2a4',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 10,
    },
    addButtonText: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#333',
        marginBottom: 10,
    },
    dropdownContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        position: 'relative',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginTop: 2,
        zIndex: 1000,
        elevation: 5,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    sliderContainer: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageRangeText: {
        alignItems: 'center',
    },
    ageRangeLabel: {
        fontSize: 14,
        color: '#333',
    },
    ageRangeValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#23a2a4',
    },
    addPreferenceButton: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    addPreferenceButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#FFFFFF',
    },
});

export default ClientSectionScreen