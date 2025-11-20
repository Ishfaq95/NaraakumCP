import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { globalTextStyles } from '../../styles/globalStyles'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const DurationAndPrice = ({route}: {route: any}) => {
    const navigation = useNavigation();
    const Data = route.params?.Data;
    console.log('Data',Data);

    const [visitDuration, setVisitDuration] = useState('');
    const [visitPrice, setVisitPrice] = useState('');
    const [allowWithNurse, setAllowWithNurse] = useState(false);
    const [nursePrice, setNursePrice] = useState('');
    const [errors, setErrors] = useState({
        visitDuration: false,
        visitPrice: false,
        nursePrice: false,
    });

    const backButtonPress = () => {
        navigation.goBack();
    }

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

        // Validate visit price
        const price = parseFloat(visitPrice);
        if (!visitPrice || isNaN(price) || price <= 0) {
            newErrors.visitPrice = true;
        }

        // Validate nurse price if checkbox is checked
        if (allowWithNurse) {
            const nPrice = parseFloat(nursePrice);
            if (!nursePrice || isNaN(nPrice) || nPrice < 0) {
                newErrors.nursePrice = true;
            }
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSave = () => {
        if (validateForm()) {
            // Handle save logic here
            console.log('Form is valid');
            // You can add your save API call here
        } else {
            console.log('Form has errors');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Duration & Price</Text>
        </View>
    );
    
    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.mainContent}>
                    <View style={styles.headerSection}>
                        <Image 
                            source={Data?.CatServiceServeTypeId == 1 ? require('../../assets/icons/RemoteConsultant.png') : require('../../assets/icons/HomeVisit.png')} 
                            style={styles.headerIcon} 
                        />
                        <Text style={styles.headerText}>
                            {Data?.CatServiceServeTypeId == 1 ? `Online Consultation Duration & Price` : `Home Visit Duration & Price`}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {Data?.CatServiceServeTypeId == 1 ? 'Online Consultation' : 'Home Visit'}
                            </Text>
                        </View>

                        {/* Visit Duration */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Visit Duration (Min 1-60)</Text>
                            <TextInput
                                style={[styles.input, errors.visitDuration && styles.inputError]}
                                value={visitDuration}
                                onChangeText={(text) => {
                                    setVisitDuration(text);
                                    setErrors({...errors, visitDuration: false});
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Visit Price */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Visit Price</Text>
                            <View style={[styles.priceInputContainer, errors.visitPrice && styles.inputError]}>
                                <TextInput
                                    style={styles.priceInput}
                                    value={visitPrice}
                                    onChangeText={(text) => {
                                        setVisitPrice(text);
                                        setErrors({...errors, visitPrice: false});
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                />
                                <Text style={styles.currency}>/ SAR</Text>
                            </View>
                        </View>

                        {/* Allow with nurse checkbox */}
                        {Data?.CatServiceServeTypeId == 2 && <TouchableOpacity 
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
                        {Data?.CatServiceServeTypeId == 2 && allowWithNurse && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price Of A Visit With A Nurse</Text>
                                <View style={[styles.priceInputContainer, errors.nursePrice && styles.inputError]}>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={nursePrice}
                                        onChangeText={(text) => {
                                            setNursePrice(text);
                                            setErrors({...errors, nursePrice: false});
                                        }}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                    />
                                    <Text style={styles.currency}>/ SAR</Text>
                                </View>
                            </View>
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
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        ...globalTextStyles.h6,
        marginLeft: 8,
        flex: 1,
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
        fontSize: 16,
        fontWeight: '600',
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
        backgroundColor: '#D1E8E4',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    inputGroup: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#FF0000',
        borderWidth: 1.5,
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
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    currency: {
        fontSize: 16,
        color: '#00A79D',
        fontWeight: '500',
        marginLeft: 8,
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
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
})

export default DurationAndPrice