import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { useAlert } from '../../contexts/AlertContext';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import { ROUTES } from '../../shared/utils/routes';

const ServiceProfile = () => {
    const navigation = useNavigation();
    const [onlineConsultationEnabled, setOnlineConsultationEnabled] = useState(false);
    const [homeVisitEnabled, setHomeVisitEnabled] = useState(false);
    const [serviceProviderRoleAndSpecialty, setServiceProviderRoleAndSpecialty] = useState<any>(null);
    const [onlineConsultationData, setOnlineConsultationData] = useState<any>({});
    const [homeVisitData, setHomeVisitData] = useState<any>({});
    const [isSpecialtyLevelBottomSheetVisible, setIsSpecialtyLevelBottomSheetVisible] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const user = useSelector((state: any) => state.root.user.user);
    const { showAlert } = useAlert();
    const defaultLevelRenderArray =['Consultant','Specialist','General Physician'];
    const isFocused = useIsFocused();

    useEffect(() => {
        getServiceProviderRoleAndSpecialty();
    }, [isFocused]);

    useEffect(() => {
        if (serviceProviderRoleAndSpecialty) {
            if (serviceProviderRoleAndSpecialty.CategorySummary) {
                parseServiceData(serviceProviderRoleAndSpecialty.CategorySummary);
            } else {
                // If CategorySummary doesn't exist, show both services with disabled switches
                setOnlineConsultationData({});
                setHomeVisitData({});
                setOnlineConsultationEnabled(false);
                setHomeVisitEnabled(false);
            }

            // Initialize selected level and specialties
            if (serviceProviderRoleAndSpecialty.Service && serviceProviderRoleAndSpecialty.Service.length > 0) {
                const firstService = serviceProviderRoleAndSpecialty.Service[0];
                setSelectedLevelId(firstService.CatLevelId);
            }
            
            if (serviceProviderRoleAndSpecialty.Specialty && serviceProviderRoleAndSpecialty.Specialty.length > 0) {
                const specialtyIds = serviceProviderRoleAndSpecialty.Specialty.map((s: any) => s.Id);
                setSelectedSpecialties(specialtyIds);
            }
        }
    }, [serviceProviderRoleAndSpecialty]);

    const parseServiceData = (categorySummary: any[]) => {
        // Check if categorySummary has valid data
        const hasValidData = categorySummary && 
                            categorySummary.length > 0 && 
                            categorySummary.some(item => item.CatServiceServeTypeId);

        if (!hasValidData) {
            // Set empty data objects so cards still render
            setOnlineConsultationData({});
            setHomeVisitData({});
            setOnlineConsultationEnabled(false);
            setHomeVisitEnabled(false);
            return;
        }

        // Find Online Consultation (CatServiceServeTypeId === 1)
        const onlineConsultation = categorySummary.find(
            (item) => item.CatServiceServeTypeId === 1
        );
        
        // Find Home Visit (CatServiceServeTypeId === 2)
        const homeVisit = categorySummary.find(
            (item) => item.CatServiceServeTypeId === 2
        );

        // Always set data (even if undefined) to ensure cards render
        setOnlineConsultationData(onlineConsultation || {});
        setOnlineConsultationEnabled(onlineConsultation?.isActive || false);

        setHomeVisitData(homeVisit || {});
        setHomeVisitEnabled(homeVisit?.isActive || false);
    };

    const getServiceProviderRoleAndSpecialty = async () => {
        try {
            const payload = {
                UserloginInfoId: user.Id,
            };
            const response = await profileService.getServiceProviderRoleAndSpecialty(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setServiceProviderRoleAndSpecialty(response);
            }
        } catch (error: any) {
        }
    };

    const assignRoleAndSpecialty = async () => {
        try {
            const payload = {
                CatLevelId: selectedLevelId,
                CatSpecialtyIds:selectedSpecialties.join(','),
                UserloginInfoId: user.Id,
            };
            const response = await profileService.assignRoleAndSpecialty(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setIsSpecialtyLevelBottomSheetVisible(false);
                getServiceProviderRoleAndSpecialty();
            }
        }
        catch (error: any) {
            showAlert({
                title: 'Error assigning role and specialty',
                message: error.message || 'Please try again',
                type: 'error',
            });
        }
        finally {
            setIsSpecialtyLevelBottomSheetVisible(false);
        }
    };

    const backButtonPress = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Service Profile</Text>
        </View>
    );

    const renderSpecialtyLevel = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Choose Your Specialty level</Text>
            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                    // Re-initialize selected values when opening bottom sheet
                    if (serviceProviderRoleAndSpecialty?.Service && serviceProviderRoleAndSpecialty.Service.length > 0) {
                        const firstService = serviceProviderRoleAndSpecialty.Service[0];
                        setSelectedLevelId(firstService.CatLevelId);
                    }
                    if (serviceProviderRoleAndSpecialty?.Specialty && serviceProviderRoleAndSpecialty.Specialty.length > 0) {
                        const specialtyIds = serviceProviderRoleAndSpecialty.Specialty.map((s: any) => s.Id);
                        setSelectedSpecialties(specialtyIds);
                    }
                    setIsSpecialtyLevelBottomSheetVisible(true);
                }}
            >
                <Text style={styles.menuItemText}>Specialty level</Text>
                <View style={styles.menuItemRight}>
                    <View style={[styles.completeBadge, serviceProviderRoleAndSpecialty?.Specialty?.length > 0 ? {backgroundColor: '#198754',paddingVertical: 0,borderRadius: 10} : {backgroundColor: '#ffdcdc',paddingVertical: 3,borderRadius: 10}]}>
                        <Text style={[styles.completeBadgeText,{color: serviceProviderRoleAndSpecialty?.Specialty?.length > 0 ? '#fff' : '#c50d0d'}]}>{serviceProviderRoleAndSpecialty?.Specialty?.length > 0 ? 'complete' : 'incomplete'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderServiceCard = (
        title: string,
        icon: any,
        enabled: boolean,
        onToggle: (value: boolean) => void,
        menuItems: Array<{title: string, onPress: () => void, isComplete: boolean}>
    ) => (
        <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                    {icon}
                </View>
                <Text style={styles.serviceTitle}>{title}</Text>
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    trackColor={{ false: '#DBDBDB', true: '#239ea0' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#DBDBDB"
                    style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7}, { scaleY: 0.7 }] } : {}}
                />
            </View>
            {enabled && (
                <View style={styles.expandedMenu}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.expandedMenuItem,
                                index < menuItems.length - 1 && styles.expandedMenuItemBorder
                            ]}
                            onPress={item.onPress}
                        >
                            <Text style={styles.expandedMenuItemText}>{item.title}</Text>
                            <View style={styles.menuItemRight}>
                                <View style={[
                                    styles.completeBadge,
                                    !item.isComplete && styles.incompleteBadge
                                ]}>
                                    <Text style={[styles.completeBadgeText,{color: !item.isComplete ? '#de574d' : '#198754'}]}>
                                        {item.isComplete ? 'complete' : 'incomplete'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#14b8a6" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    // Helper function to check if duration and price are complete
    const isDurationPriceComplete = (data: any) => {
        return !!(data?.SlotDurationId && data?.Price);
    };

    // Helper function to check if business hours is complete
    const isBusinessHoursComplete = (data: any) => {
        return !!data?.ServiceProviderAvailabilityId;
    };

    // Helper function to check if work areas is complete (only for home visit)
    const isWorkAreasComplete = (data: any) => {
        return !!data?.GoogleLocation;
    };

    // Generate menu items for Online Consultation
    const getOnlineConsultationMenuItems = () => {
        // Return empty array if no valid data exists
        if (!onlineConsultationData || Object.keys(onlineConsultationData).length === 0) {
            return [];
        }
        
        return [
            {
                title: 'Business hours',
                onPress: () => navigation.navigate(ROUTES.BusinessHours as never,{Data:onlineConsultationData}),
                isComplete: isBusinessHoursComplete(onlineConsultationData)
            },
            {
                title: 'Duration & Price',
                onPress: () => navigation.navigate(ROUTES.DurationAndPrice as never,{Data:onlineConsultationData}),
                isComplete: isDurationPriceComplete(onlineConsultationData)
            },
        ];
    };

    // Generate menu items for Home Visit
    const getHomeVisitMenuItems = () => {
        // Return empty array if no valid data exists
        if (!homeVisitData || Object.keys(homeVisitData).length === 0) {
            return [];
        }
        
        return [
            {
                title: 'Business hours',
                onPress: () => navigation.navigate(ROUTES.BusinessHours as never,{Data:homeVisitData}),
                isComplete: isBusinessHoursComplete(homeVisitData)
            },
            {
                title: 'Duration & Price',
                onPress: () => navigation.navigate(ROUTES.DurationAndPrice as never,{Data:homeVisitData}),
                isComplete: isDurationPriceComplete(homeVisitData)
            },
            {
                title: 'Work Areas',
                onPress: () => navigation.navigate(ROUTES.WorkAreas as never,{Data:homeVisitData}),
                isComplete: isWorkAreasComplete(homeVisitData)
            },
        ];
    };

    const onToggleService = (service: string, value: boolean) => {
        if (service === 'onlineConsultation') {
            if (Object.keys(onlineConsultationData).length === 0) {
                showAlert({
                    title: 'Please select your specialty level to proceed.',
                    message: '',
                    type: 'info',
                });
                return;
            }
            setOnlineConsultationEnabled(value);
        } else if (service === 'homeVisit') {
            if (Object.keys(homeVisitData).length === 0) {
                showAlert({
                    title: 'Please select your specialty level to proceed.',
                    message: '',
                    type: 'info',
                });
                return;
            }
            setHomeVisitEnabled(value);
        }
    };

    const handleLevelSelect = (levelId: number) => {
        setSelectedLevelId(levelId);
        
        // Clear specialties only when changing to General Physician (CatLevelId: 3)
        if (levelId === 3) {
            setSelectedSpecialties([]);
        } else {
            // For Consultant (1) or Specialist (2), keep or restore specialties
            // Check if we need to restore from API (when coming back from General Physician)
            if (selectedSpecialties.length === 0 && serviceProviderRoleAndSpecialty?.Specialty && serviceProviderRoleAndSpecialty.Specialty.length > 0) {
                // Restore all specialties from API (regardless of their CatLevelId)
                const specialtyIds = serviceProviderRoleAndSpecialty.Specialty.map((s: any) => s.Id);
                setSelectedSpecialties(specialtyIds);
            } else {
                // Keep current selected specialties - don't clear them
            }
        }
    };

    const handleSpecialtyToggle = (specialtyId: string) => {
        setSelectedSpecialties(prev => {
            if (prev.includes(specialtyId)) {
                return prev.filter(id => id !== specialtyId);
            } else {
                return [...prev, specialtyId];
            }
        });
    };

    const handleSaveSpecialtyLevel = async () => {
        try {
            // Validate selection
            if (!selectedLevelId) {
                showAlert({
                    title: 'Please select a specialty level',
                    message: '',
                    type: 'warning',
                });
                return;
            }

            // If Consultant or Specialist is selected, at least one specialty must be selected
            if ((selectedLevelId === 1 || selectedLevelId === 2) && selectedSpecialties.length === 0) {
                showAlert({
                    title: 'Please select at least one specialty',
                    message: '',
                    type: 'warning',
                });
                return;
            }

            // Prepare payload and call API here
            const payload = {
                UserloginInfoId: user.Id,
                CatLevelId: selectedLevelId,
                SpecialtyIds: selectedSpecialties,
            };

            // TODO: Call your API to save the specialty level
            // const response = await profileService.saveSpecialtyLevel(payload);
            
            // After successful save
            setIsSpecialtyLevelBottomSheetVisible(false);
            showAlert({
                title: 'Specialty level saved successfully',
                message: '',
                type: 'success',
            });

            // Refresh data
            getServiceProviderRoleAndSpecialty();

        } catch (error: any) {
            showAlert({
                title: 'Error saving specialty level',
                message: error.message || 'Please try again',
                type: 'error',
            });
        }
    };

    console.log("user?.CatUserRoleId",user?.CatUserRoleId)

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {renderHeader()}
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {user?.CatUserRoleId == 3 && renderSpecialtyLevel()}

                    {user?.CatUserRoleId == 3 && <View style={styles.divider} />}
                    
                    <Text style={styles.activateServicesTitle}>Activate Your Services</Text>
                    
                    {(user?.CatUserRoleId == 7 || user?.CatUserRoleId == 3) && renderServiceCard(
                        'Online Consultation',
                        <Image source={require('../../assets/icons/RemoteConsultant.png')} resizeMode='contain' style={{width: 50,height: 50}} />,
                        onlineConsultationEnabled,
                        (value: boolean) => onToggleService('onlineConsultation', value),
                        getOnlineConsultationMenuItems()
                    )}
                    
                    {renderServiceCard(
                        'Home Visit',
                        <Image source={require('../../assets/icons/HomeVisit.png')} resizeMode='contain' style={{width: 50,height: 50}} />,
                        homeVisitEnabled,
                        (value: boolean) => onToggleService('homeVisit', value),
                        getHomeVisitMenuItems()
                    )}
                </ScrollView>
            </View>

            <CustomBottomSheet
                visible={isSpecialtyLevelBottomSheetVisible}
                maxHeight={selectedLevelId ? (selectedLevelId === 1 || selectedLevelId === 2) ? "80%" : "35%" : "35%"}
                onClose={() => setIsSpecialtyLevelBottomSheetVisible(false)}
            >
                <View style={styles.bottomSheetContent}>
                    {/* Close Button */}
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setIsSpecialtyLevelBottomSheetVisible(false)}
                    >
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.bottomSheetTitle}>Specialty level</Text>

                    {/* Level Tabs */}
                    <View style={styles.levelTabsContainer}>
                        {defaultLevelRenderArray.map((levelName) => {
                            // Find the level from API data that matches the current name
                            const level = serviceProviderRoleAndSpecialty?.AllLevelService?.find(
                                (l: any) => l.TitlePlang === levelName
                            );
                            
                            // If level doesn't exist in API data, skip rendering it
                            if (!level) return null;
                            
                            return (
                                <TouchableOpacity
                                    key={level.CatLevelId}
                                    style={[
                                        styles.levelTab,
                                        selectedLevelId === level.CatLevelId && styles.levelTabActive
                                    ]}
                                    onPress={() => handleLevelSelect(level.CatLevelId)}
                                >
                                    <Text style={[
                                        styles.levelTabText,
                                        selectedLevelId === level.CatLevelId && styles.levelTabTextActive
                                    ]}>
                                        {level.TitlePlang}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Specialties List - Show only for Consultant (1) and Specialist (2) */}
                    {selectedLevelId && (selectedLevelId === 1 || selectedLevelId === 2) && (
                        <View style={styles.specialtiesContainer}>
                            <Text style={styles.specialtiesTitle}>Choose Specialties:</Text>
                            <ScrollView 
                                style={styles.specialtiesList}
                                showsVerticalScrollIndicator={true}
                            >
                                {serviceProviderRoleAndSpecialty?.AllSpecialty?.map((specialty: any, index: number) => {
                                    const isChecked = selectedSpecialties.includes(specialty.Id);
                                    
                                    return (
                                        <TouchableOpacity
                                            key={specialty.Id}
                                            style={[styles.specialtyItem,index == serviceProviderRoleAndSpecialty?.AllSpecialty?.length - 1 && {paddingBottom: 30}]}
                                            onPress={() => handleSpecialtyToggle(specialty.Id)}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                isChecked && styles.checkboxChecked
                                            ]}>
                                                {isChecked && (
                                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                                )}
                                            </View>
                                            <Text style={styles.specialtyText}>{specialty.TitlePlang}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={assignRoleAndSpecialty}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </CustomBottomSheet>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f4f3',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#e8f4f3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        paddingHorizontal: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginLeft: 4,
    },
    scrollContent: {
        flex: 1,
    },
    sectionContainer: {
        marginTop: 16,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    menuItemText: {
        fontSize: 16,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap: 2,
    },
    completeBadge: {
        // backgroundColor: '#198754',
        paddingHorizontal: 8,
        // paddingVertical: 4,
        borderRadius: 12,
    },
    incompleteBadge: {
        // backgroundColor: '#ef4444',
    },
    completeBadgeText: {
        color: '#198754',
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    activateServicesTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    serviceCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    serviceIconContainer: {
        marginRight: 12,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceTitle: {
        flex: 1,
        fontSize: 17,
        color: '#0F0F0F',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    expandedMenu: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    expandedMenuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor:'#239ea0',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom:6
    },
    expandedMenuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#239ea0',
    },
    expandedMenuItemText: {
        fontSize: 15,
        color: '#239ea0',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    // Online Consultation Icon Styles
    onlineConsultationIcon: {
        width: 60,
        height: 60,
        position: 'relative',
    },
    iconInner: {
        position: 'absolute',
        top: 8,
        left: 4,
        flexDirection: 'row',
        gap: 4,
    },
    iconPersonLeft: {
        width: 16,
        height: 20,
        backgroundColor: '#f0b8d8',
        borderRadius: 4,
    },
    iconPersonRight: {
        width: 16,
        height: 20,
        backgroundColor: '#a8d8f0',
        borderRadius: 4,
    },
    iconScreen: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        width: 44,
        height: 32,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#666',
    },
    // Home Visit Icon Styles
    homeVisitIcon: {
        width: 60,
        height: 60,
        position: 'relative',
    },
    houseRoof: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 0,
        height: 0,
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderBottomWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#ff6b6b',
    },
    houseBody: {
        position: 'absolute',
        top: 22,
        left: 10,
        width: 36,
        height: 28,
        backgroundColor: '#ffd4d4',
        borderRadius: 4,
    },
    houseDoor: {
        position: 'absolute',
        bottom: 0,
        left: 6,
        width: 10,
        height: 14,
        backgroundColor: '#ff6b6b',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    houseWindow: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 10,
        height: 10,
        backgroundColor: '#87ceeb',
        borderRadius: 2,
    },
    person: {
        position: 'absolute',
        bottom: 6,
        right: 4,
        width: 12,
        height: 18,
        backgroundColor: '#ffb8d4',
        borderRadius: 6,
    },
    medicalBag: {
        position: 'absolute',
        bottom: 10,
        right: 18,
        width: 8,
        height: 6,
        backgroundColor: '#ff6b6b',
        borderRadius: 2,
    },
    // Bottom Sheet Styles
    bottomSheetContent: {
        padding: 20,
        paddingTop: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginBottom: 20,
    },
    levelTabsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    levelTab: {
        flex: 1,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'lightgray',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelTabActive: {
        borderColor: '#239ea0',
        borderWidth: 1,
        backgroundColor: '#e4f1ef',
    },
    levelTabText: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: 'black',
    },
    levelTabTextActive: {
        color: '#239ea0',
    },
    specialtiesContainer: {
        marginBottom: 20,
    },
    specialtiesTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginBottom: 12,
    },
    specialtiesList: {
        maxHeight: 320,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
    },
    specialtyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
            backgroundColor: '#239ea0',
        borderColor: '#239ea0',
    },
    specialtyText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#239ea0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#0000001a',
        marginTop: 16,
        marginHorizontal: 16,
    },
});
export default ServiceProfile