import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { useAlert } from '../../contexts/AlertContext';
import CustomSwitch from '../../components/common/CustomSwitch';

const DurationAndPrice = ({ route }: { route: any }) => {
    const navigation = useNavigation();
    const Data = route.params?.Data;
    const user = useSelector((state: any) => state.root.user.user);
    const { showAlert } = useAlert();
    const [visitDuration, setVisitDuration] = useState('');
    const [visitPrice, setVisitPrice] = useState('');
    const [allowWithNurse, setAllowWithNurse] = useState(false);
    const [nursePrice, setNursePrice] = useState('');
    const [durationAndPriceData, setDurationAndPriceData] = useState<any>(null);
    const [servicePricesAvailable, setServicePricesAvailable] = useState(false);
    const [servicePrices, setServicePrices] = useState<any>([]);
    const [errors, setErrors] = useState({
        visitDuration: false,
        visitPrice: false,
        nursePrice: false,
    });

    const backButtonPress = () => {
        navigation.goBack();
    }

    useEffect(() => {
        getServiceProviderDurationAndPrice();
    }, [Data]);

    useEffect(() => {
        if (durationAndPriceData) {
            setVisitDuration(durationAndPriceData?.SlotDuration?.toString());
            setVisitPrice(durationAndPriceData?.Price?.toString());
            if (durationAndPriceData?.PriceWithNurse) {
                setAllowWithNurse(true);
                setNursePrice(durationAndPriceData?.PriceWithNurse?.toString());
            } else {
                setAllowWithNurse(false);
                setNursePrice('');
            }
        }
    }, [durationAndPriceData]);

    const getServiceProviderDurationAndPrice = async () => {
        const payload: any = {
            UserloginInfoId: user.Id,
            CatCategoryId: Data.CatCategoryId,
            CatServiceServeTypeId: Data.CatServiceServeTypeId,
        }
        const response = await profileService.getServiceProviderDurationAndPrice(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            setDurationAndPriceData(response.Data[0]);
            if (response?.ServicePrice && response?.ServicePrice?.length > 0) {
                setServicePricesAvailable(true);
                // Format service prices with proper structure
                const formattedPrices = response.ServicePrice.map((item: any) => ({
                    Price: item.Price || 0,
                    CatServiceId: item.CatServiceId?.toString() || '',
                    isActive: item.isActive !== undefined ? item.isActive : false,
                    isDeleted: item.isDeleted !== undefined ? item.isDeleted : false,
                    TitleSlang: item.TitleSlang || '',
                    TitlePlang: item.TitlePlang || '',
                }));
                setServicePrices(formattedPrices);
            } else {
                setServicePricesAvailable(false);
                setServicePrices([]);
            }
        }
    };

    const clampNumberInput = (text: string, min: number, max: number) => {
        // Keep only digits
        const cleaned = text.replace(/[^\d]/g, '');
        if (cleaned === '') {
            return '';
        }
        // Limit to 5 digits maximum - prevent 6th digit input
        const limited = cleaned.length > 5 ? cleaned.substring(0, 5) : cleaned;
        let num = parseInt(limited, 10);
        if (isNaN(num)) {
            return '';
        }
        // Only apply min validation, don't auto-clamp to max
        if (num < min) num = min;
        return num.toString();
    };

    const handleDurationChange = (text: string) => {
        const value = clampNumberInput(text, 1, 60);
        setVisitDuration(value);
        setErrors(prev => ({ ...prev, visitDuration: false }));
    };

    const handleVisitPriceChange = (text: string) => {
        const value = clampNumberInput(text, 1, 99999);
        setVisitPrice(value);
        setErrors(prev => ({ ...prev, visitPrice: false }));
    };

    const handleNursePriceChange = (text: string) => {
        const value = clampNumberInput(text, 1, 99999);
        setNursePrice(value);
        setErrors(prev => ({ ...prev, nursePrice: false }));
    };

    const handleServicePriceToggle = async (item: any) => {
        try {
            const payload: any = {
                UserloginInfoId: user.Id,
                CatServiceId: item.CatServiceId,
                isActive: item.isActive ? 0 : 1,
            }

            console.log("payload", payload);

            const response = await profileService.updateServiceProviderServiceActiveStatus(payload);
            if (response.StatusCode.STATUSCODE == 11034) {
                getServiceProviderDurationAndPrice();
                showAlert({
                    title: response.StatusCode.MESSAGE,
                    message: '',
                    type: 'success',
                });
            }
        } catch (error) {
        }
    };

    const handleServicePriceChange = (index: number, text: string) => {
        const value = clampNumberInput(text, 1, 99999);
        const updatedPrices = [...servicePrices];
        updatedPrices[index].Price = parseInt(value) || 0;
        setServicePrices(updatedPrices);
    };
    const validateForm = () => {
        const newErrors = {
            visitDuration: false,
            visitPrice: false,
            nursePrice: false,
        };

        // Validate visit duration (1-60)
        const duration = parseInt(visitDuration);
        if (!visitDuration || isNaN(duration) || duration < 1 || duration > 60) {
            newErrors.visitDuration = true;
        }

        if (!servicePricesAvailable) {// Validate visit price (1-100000)
            const price = parseFloat(visitPrice);
            if (!visitPrice || isNaN(price) || price < 1 || price > 100000) {
                newErrors.visitPrice = true;
            }
        }

        // Validate nurse price if checkbox is checked
        if (allowWithNurse) {
            const nPrice = parseFloat(nursePrice);
            if (!nursePrice || isNaN(nPrice) || nPrice < 1 || nPrice > 100000) {
                newErrors.nursePrice = true;
            }
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSave = async () => {
        if (validateForm()) {
            const payload: any = {
                UserloginInfoId: user.Id,
                CatCategoryId: Data.CatCategoryId,
                SlotDuration: visitDuration,
                Price: visitPrice || 0,
                CatServiceServeTypeId: Data.CatServiceServeTypeId,
            };

            if (allowWithNurse) {
                payload.PriceWithNurse = nursePrice;
            }

            // Include service prices if available
            if (servicePricesAvailable && servicePrices.length > 0) {
                payload.ServicePriceList = servicePrices.map((item: any) => ({
                    Price: item.Price || 0,
                    CatServiceId: item.CatServiceId,

                }));
            }

            const response = await profileService.addServiceProviderDurationAndPrice(payload);
            if (response.StatusCode.STATUSCODE == 11025) {
                showAlert({
                    title: response.StatusCode.MESSAGE,
                    message: '',
                    type: 'success',
                });
            }
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Duration & Price</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    <View style={styles.mainContent}>
                        <View style={styles.headerSection}>
                            <Image
                                source={Data?.CatServiceServeTypeId == 1 ? require('../../assets/icons/RemoteConsultant.png') : require('../../assets/icons/HomeVisit.png')}
                                style={styles.headerIcon}
                                resizeMode='contain'
                            />
                            <Text style={styles.headerText}>
                                {Data?.CatServiceServeTypeId == 1 ? `Online Consultation Duration & Price` : `Home Visit Duration & Price`}
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {Data?.CatServiceServeTypeId == 1 ? 'Session' : 'Home Visit'}
                                </Text>
                            </View>

                            {/* Visit Duration */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{Data?.CatServiceServeTypeId == 1 ? 'Session Duration' : 'Visit Duration'} (Min 1-60)</Text>
                                <TextInput
                                    style={[styles.input, errors.visitDuration && styles.inputError]}
                                    value={visitDuration}
                                    onChangeText={handleDurationChange}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            {servicePricesAvailable ? (
                                <View style={styles.servicePricesContainer}>
                                    <Text style={styles.sessionPackagesTitle}>Select Session Packages</Text>
                                    {servicePrices.map((item: any, index: number) => {
                                        return (
                                            <View key={index} style={styles.servicePriceItem}>
                                                {/* Toggle Box */}
                                                <View style={styles.toggleBox}>
                                                    <Text style={styles.toggleBoxText} numberOfLines={2}>
                                                        {item.TitlePlang || item.TitleSlang}
                                                    </Text>
                                                    <CustomSwitch
                                                        value={item.isActive}
                                                        onValueChange={() => handleServicePriceToggle(item)}
                                                    />
                                                </View>

                                                {/* Package Price Input - Only show when toggle is active */}
                                                {item.isActive && (
                                                    <View style={styles.packagePriceSection}>
                                                        <Text style={styles.packagePriceLabel}>Package Price</Text>
                                                        <View style={styles.packagePriceInputContainer}>
                                                            <TextInput
                                                                style={styles.packagePriceInput}
                                                                value={item.Price?.toString() || '0'}
                                                                onChangeText={(text) => handleServicePriceChange(index, text)}
                                                                keyboardType="numeric"
                                                                placeholder="0"
                                                                placeholderTextColor="#999"
                                                            />
                                                            <Text style={styles.packagePriceCurrency}>/ SAR</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <>
                                    {/* Visit Price */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>{Data?.CatServiceServeTypeId == 1 ? 'Session Price' : 'Visit Price'}</Text>
                                        <View style={[styles.priceInputContainer, errors.visitPrice && styles.inputError]}>
                                            <TextInput
                                                style={styles.priceInput}
                                                value={visitPrice}
                                                onChangeText={handleVisitPriceChange}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="#999"
                                            />
                                            <Text style={styles.currency}>/ SAR</Text>
                                        </View>
                                    </View>

                                    {/* Allow with nurse checkbox */}
                                    {(Data?.CatServiceServeTypeId == 2 && Data.CatCategoryId == 32) && <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => setAllowWithNurse(!allowWithNurse)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, allowWithNurse && styles.checkboxChecked]}>
                                            {allowWithNurse && (
                                                <Ionicons name="checkmark" size={16} color="#fff" />
                                            )}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Allow with nurse</Text>
                                    </TouchableOpacity>}

                                    {/* Nurse Price (conditional) */}
                                    {(Data?.CatServiceServeTypeId == 2 && Data.CatCategoryId == 32 && allowWithNurse) && (
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Price Of A Visit With A Nurse</Text>
                                            <View style={[styles.priceInputContainer, errors.nursePrice && styles.inputError]}>
                                                <TextInput
                                                    style={styles.priceInput}
                                                    value={nursePrice}
                                                    onChangeText={handleNursePriceChange}
                                                    keyboardType="numeric"
                                                    placeholder="0"
                                                    placeholderTextColor="#999"
                                                />
                                                <Text style={styles.currency}>/ SAR</Text>
                                            </View>
                                        </View>
                                    )}
                                </>

                            )}


                        </View>
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
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
    headerSection: {
        padding: 16,
        backgroundColor: '#E8F4F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    headerText: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        marginTop: 16,
    },
    sectionHeader: {
        backgroundColor: '#e4f1ef',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0F0F0F',
    },
    inputGroup: {
        paddingHorizontal: 8,
        paddingTop: 16,
    },
    label: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0F0F0F',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#FF0000',
        borderWidth: 1,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    priceInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#000',
    },
    currency: {
        fontSize: 15,
        color: '#00A79D',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginLeft: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#00A79D',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#00A79D',
    },
    checkboxLabel: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
        fontWeight: '400',
    },
    buttonContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#00A79D',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    sessionPackagesTitle: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0F0F0F',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    servicePricesContainer: {
        paddingHorizontal: 8,
        paddingTop: 16,
    },
    servicePriceItem: {
        marginBottom: 20,
    },
    toggleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F4F3',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
    },
    toggleBoxText: {
        flex: 1,
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#0F0F0F',
        marginRight: 12,
    },
    packagePriceSection: {
        paddingHorizontal: 4,
    },
    packagePriceLabel: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#0F0F0F',
        marginBottom: 8,
    },
    packagePriceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    packagePriceInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    packagePriceCurrency: {
        fontSize: 15,
        color: '#00A79D',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginLeft: 4,
    },
})

export default DurationAndPrice