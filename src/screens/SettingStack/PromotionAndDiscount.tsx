import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import PromotionItem from '../../components/PromotionItem';
import { globalTextStyles } from '../../styles/globalStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { settingService } from '../../services/api/settingService';
import { useSelector } from 'react-redux';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';

const PromotionAndDiscount: React.FC = () => {
    const [promoCodeList, setPromoCodeList] = useState<any[]>([]);
    const user = useSelector((state: any) => state.root.user.user);
    const [addPromoCodeBottomSheetVisible, setAddPromoCodeBottomSheetVisible] = useState(false);
    
    // Form state
    const [promoCode, setPromoCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [multipleClientsCanUse, setMultipleClientsCanUse] = useState(false);
    const [numberOfClients, setNumberOfClients] = useState('');
    const [singleClientMultipleUse, setSingleClientMultipleUse] = useState(false);
    const [numberOfUsesPerClient, setNumberOfUsesPerClient] = useState('');
    const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
    
    // Validation error states
    const [promoCodeError, setPromoCodeError] = useState(false);
    const [discountError, setDiscountError] = useState(false);
    const [numberOfClientsError, setNumberOfClientsError] = useState(false);
    const [numberOfUsesError, setNumberOfUsesError] = useState(false);
    
    useEffect(() => {
        if (user) {
            getPromoCodeListFN();
        }
    }, []);

    const getPromoCodeListFN = async () => {
        const payload = {
            OrganizationId: user.OrganizationId,
            ServiceProviderId: user.Id,
        };

        const response = await settingService.getPromoCodeList(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            setPromoCodeList(response.Data);
        }
    };

    const addPromoCodeFN = async () => {
        const payload = {
            "UserLoginInfoId":user.Id,
            "PCode":"test",
            "DiscountPercentage":20,
            "HasExpiry":1,
            "ExpiryDate":"2025-11-20",
            "IsSingleUsage":1,
            "NumberOfUsageAllowed":"2",
            "IsSingleUserMultipleUsage":1,
            "ForSingleUserUsageAllowed":"2",
            "DiscountFromSystemPercentage":0,
            "PromoCodeId":null,
            "Detail":[{
                "OrganizationId":user.OrganizationId,
                "CatCategoryId":null,
                "CatServiceId":null,
                "CatSpecialityId":null,
                "ServiceProviderUserloginInfoId":user.Id,
                "ForPatientUserloginInfoId":null
            }]
        };

        const response = await settingService.addPromoCode(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            getPromoCodeListFN();
        }
    };


    const handleEditPromotion = (promotion: any) => {
        // Populate form with existing data
        setPromoCode(promotion.Pcode || '');
        setDiscountPercentage(promotion.Discount?.toString() || '');
        setHasExpiry(promotion.ExpiryDate != null);
        if (promotion.ExpiryDate) {
            setExpiryDate(new Date(promotion.ExpiryDate));
        } else {
            setExpiryDate(new Date());
        }
        setMultipleClientsCanUse(promotion.NumberOfUsageAllowed > 0);
        setNumberOfClients(promotion.NumberOfUsageAllowed > 0 ? promotion.NumberOfUsageAllowed.toString() : '');
        setSingleClientMultipleUse(promotion.IsSingleUserMultipleUsage === 1);
        setNumberOfUsesPerClient(promotion.ForSingleUserUsageAllowed > 0 ? promotion.ForSingleUserUsageAllowed.toString() : '');
        setEditingPromoId(promotion.Id);
        
        // Reset errors
        setPromoCodeError(false);
        setDiscountError(false);
        setNumberOfClientsError(false);
        setNumberOfUsesError(false);
        
        // Open bottom sheet
        setAddPromoCodeBottomSheetVisible(true);
    };

    const handleDeletePromotion = async (promotion: any) => {
        const payload = {
            PromocodeId: promotion.Id,
        };
        const response = await settingService.deletePromoCode(payload);
        if (response.StatusCode.STATUSCODE == 11021) {
            getPromoCodeListFN();
        }else{
            Alert.alert('Error', response.Message);
        }
    };

    const handleAddNewPromotion = () => {
        setAddPromoCodeBottomSheetVisible(true);
    };

    const resetForm = () => {
        setPromoCode('');
        setDiscountPercentage('');
        setHasExpiry(false);
        setExpiryDate(new Date());
        setMultipleClientsCanUse(false);
        setNumberOfClients('');
        setSingleClientMultipleUse(false);
        setNumberOfUsesPerClient('');
        setEditingPromoId(null);
        // Reset errors
        setPromoCodeError(false);
        setDiscountError(false);
        setNumberOfClientsError(false);
        setNumberOfUsesError(false);
    };

    const handleSavePromoCode = async () => {
        // Reset all errors first
        setPromoCodeError(false);
        setDiscountError(false);
        setNumberOfClientsError(false);
        setNumberOfUsesError(false);

        let hasError = false;

        // Validate promo code
        if (!promoCode.trim()) {
            setPromoCodeError(true);
            hasError = true;
        }

        // Validate discount percentage
        if (!discountPercentage.trim() || isNaN(Number(discountPercentage)) || Number(discountPercentage) < 1 || Number(discountPercentage) > 100) {
            setDiscountError(true);
            hasError = true;
        }

        // Validate number of clients if enabled
        if (multipleClientsCanUse && (!numberOfClients.trim() || isNaN(Number(numberOfClients)) || Number(numberOfClients) < 1)) {
            setNumberOfClientsError(true);
            hasError = true;
        }

        // Validate number of uses per client if enabled
        if (singleClientMultipleUse && (!numberOfUsesPerClient.trim() || isNaN(Number(numberOfUsesPerClient)) || Number(numberOfUsesPerClient) < 1)) {
            setNumberOfUsesError(true);
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const payload = {
            UserLoginInfoId: user.Id,
            PCode: promoCode,
            DiscountPercentage: Number(discountPercentage),
            HasExpiry: hasExpiry ? 1 : 0,
            ExpiryDate: hasExpiry ? expiryDate.toISOString().split('T')[0] : null,
            IsSingleUsage: multipleClientsCanUse ? 1 : 0,
            NumberOfUsageAllowed: multipleClientsCanUse ? numberOfClients : 0,
            IsSingleUserMultipleUsage: singleClientMultipleUse ? 1 : 0,
            ForSingleUserUsageAllowed: singleClientMultipleUse ? numberOfUsesPerClient : 0,
            DiscountFromSystemPercentage: 0,
            PromoCodeId: editingPromoId,
            Detail: [{
                OrganizationId: user.OrganizationId,
                CatCategoryId: null,
                CatServiceId: null,
                CatSpecialityId: null,
                ServiceProviderUserloginInfoId: user.Id,
                ForPatientUserloginInfoId: null
            }]
        };

        const response = await settingService.addPromoCode(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            getPromoCodeListFN();
            resetForm();
            setAddPromoCodeBottomSheetVisible(false);
        }
    };

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setExpiryDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomScreensHeader title="Promotions & Discounts" />

            <View style={styles.content}>
                {/* Header Section with Icon and Title */}
                <View style={styles.headerSection}>
                    <View style={styles.iconContainer}>
                        <Image source={require('../../assets/icons/PromotionIcon.png')} style={{ width: 48, height: 48 }} resizeMode="contain" />
                    </View>
                    <Text style={styles.mainTitle}>Promotions & Discounts</Text>
                </View>

                {/* Promotions List */}
                <FlatList
                    data={promoCodeList}
                    keyExtractor={(item) => item.Id}
                    renderItem={({ item }) => (
                        <PromotionItem
                            item={item}
                            onEditPromotion={handleEditPromotion}
                            onDeletePromotion={handleDeletePromotion}
                        />
                    )}
                    style={styles.flatListContainer}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}>No promotions found</Text>
                    </View>}
                />

                {/* Bottom Button */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddNewPromotion}
                    >
                        <Text style={styles.addButtonText}>Add New Promo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <CustomBottomSheet
                visible={addPromoCodeBottomSheetVisible}
                onClose={() => {
                    resetForm();
                    setAddPromoCodeBottomSheetVisible(false);
                }}
                showHandle={false}
                maxHeight="60%"
                style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden' }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={bottomSheetStyles.container}>
                        {/* Header */}
                        <View style={bottomSheetStyles.header}>
                            <Text style={bottomSheetStyles.headerTitle}>
                                {editingPromoId ? 'Edit Promo' : 'Add New Promo'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    resetForm();
                                    setAddPromoCodeBottomSheetVisible(false);
                                }}
                                style={bottomSheetStyles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Content */}
                        <ScrollView
                            style={bottomSheetStyles.scrollView}
                            contentContainerStyle={bottomSheetStyles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Promotional Code Input */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>Promotional Code</Text>
                                <TextInput
                                    style={[
                                        bottomSheetStyles.input,
                                        promoCodeError && bottomSheetStyles.inputError
                                    ]}
                                    placeholder="Promotional Code"
                                    placeholderTextColor="#999"
                                    value={promoCode}
                                    onChangeText={(text) => {
                                        setPromoCode(text);
                                        if (promoCodeError && text.trim()) {
                                            setPromoCodeError(false);
                                        }
                                    }}
                                />
                            </View>

                            {/* Discount Percentage Input */}
                            <View style={bottomSheetStyles.inputGroup}>
                                <Text style={bottomSheetStyles.label}>Discount Percentage ( 1-100)</Text>
                                <TextInput
                                    style={[
                                        bottomSheetStyles.input,
                                        discountError && bottomSheetStyles.inputError
                                    ]}
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={discountPercentage}
                                    onChangeText={(text) => {
                                        setDiscountPercentage(text);
                                        if (discountError && text.trim()) {
                                            setDiscountError(false);
                                        }
                                    }}
                                />
                            </View>

                            {/* Has Expiry Checkbox */}
                            <TouchableOpacity
                                style={bottomSheetStyles.checkboxContainer}
                                onPress={() => setHasExpiry(!hasExpiry)}
                            >
                                <View style={[bottomSheetStyles.checkbox, hasExpiry && bottomSheetStyles.checkboxChecked]}>
                                    {hasExpiry && <MaterialIcons name="check" size={18} color="#fff" />}
                                </View>
                                <Text style={bottomSheetStyles.checkboxLabel}>Has expiry</Text>
                            </TouchableOpacity>

                            {/* Expiry Date Input (shown when checkbox is checked) */}
                            {hasExpiry && (
                                <View style={bottomSheetStyles.conditionalInputContainer}>
                                    <TouchableOpacity
                                        style={bottomSheetStyles.input}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={bottomSheetStyles.dateText}>
                                            {formatDate(expiryDate)}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={expiryDate}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={handleDateChange}
                                            minimumDate={new Date()}
                                        />
                                    )}
                                </View>
                            )}

                            {/* Multiple Clients Can Use Checkbox */}
                            <TouchableOpacity
                                style={bottomSheetStyles.checkboxContainer}
                                onPress={() => setMultipleClientsCanUse(!multipleClientsCanUse)}
                            >
                                <View style={[bottomSheetStyles.checkbox, multipleClientsCanUse && bottomSheetStyles.checkboxChecked]}>
                                    {multipleClientsCanUse && <MaterialIcons name="check" size={18} color="#fff" />}
                                </View>
                                <Text style={bottomSheetStyles.checkboxLabel}>Multiple clients can use</Text>
                            </TouchableOpacity>

                            {/* Number of Clients Input (shown when checkbox is checked) */}
                            {multipleClientsCanUse && (
                                <View style={bottomSheetStyles.conditionalInputContainer}>
                                    <TextInput
                                        style={[
                                            bottomSheetStyles.input,
                                            numberOfClientsError && bottomSheetStyles.inputError
                                        ]}
                                        placeholder="Enter number"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                        value={numberOfClients}
                                        onChangeText={(text) => {
                                            setNumberOfClients(text);
                                            if (numberOfClientsError && text.trim()) {
                                                setNumberOfClientsError(false);
                                            }
                                        }}
                                    />
                                </View>
                            )}

                            {/* Single Client Multiple Times Checkbox */}
                            <TouchableOpacity
                                style={bottomSheetStyles.checkboxContainer}
                                onPress={() => setSingleClientMultipleUse(!singleClientMultipleUse)}
                            >
                                <View style={[bottomSheetStyles.checkbox, singleClientMultipleUse && bottomSheetStyles.checkboxChecked]}>
                                    {singleClientMultipleUse && <MaterialIcons name="check" size={18} color="#fff" />}
                                </View>
                                <Text style={bottomSheetStyles.checkboxLabel}>Single client can use multiple times</Text>
                            </TouchableOpacity>

                            {/* Number of Uses Per Client Input (shown when checkbox is checked) */}
                            {singleClientMultipleUse && (
                                <View style={bottomSheetStyles.conditionalInputContainer}>
                                    <TextInput
                                        style={[
                                            bottomSheetStyles.input,
                                            numberOfUsesError && bottomSheetStyles.inputError
                                        ]}
                                        placeholder="Enter number"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                        value={numberOfUsesPerClient}
                                        onChangeText={(text) => {
                                            setNumberOfUsesPerClient(text);
                                            if (numberOfUsesError && text.trim()) {
                                                setNumberOfUsesError(false);
                                            }
                                        }}
                                    />
                                </View>
                            )}
                        </ScrollView>

                        {/* Save Button */}
                        <View style={bottomSheetStyles.footer}>
                            <TouchableOpacity
                                style={bottomSheetStyles.saveButton}
                                onPress={handleSavePromoCode}
                            >
                                <Text style={bottomSheetStyles.saveButtonText}>
                                    {editingPromoId ? 'Update' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </CustomBottomSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: '#E4F1EF', // Light teal background as shown in image
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    iconContainer: {
        marginBottom: 8,
    },
    mainTitle: {
        ...globalTextStyles.h3,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    flatListContainer: {
        flex: 1,
    },
    flatListContent: {
        paddingBottom: 100, // Space for bottom button
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 4,
        // paddingBottom: 32, // Account for safe area
    },
    addButton: {
        backgroundColor: '#00A19D',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonText: {
        ...globalTextStyles.buttonLarge,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

const bottomSheetStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#000',
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    dateText: {
        fontSize: 15,
        color: '#000',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#00A19D',
        borderColor: '#00A19D',
    },
    checkboxLabel: {
        fontSize: 15,
        color: '#000',
        flex: 1,
    },
    conditionalInputContainer: {
        marginBottom: 16,
        paddingLeft: 36,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#00A19D',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default PromotionAndDiscount;
