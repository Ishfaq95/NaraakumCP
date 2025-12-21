import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { profileService } from '../../services/api/profileService';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { useAlert } from '../../contexts/AlertContext';

interface BioHead {
    Id: number;
    TitlePlang: string;
    TitleSlang: string;
}

interface SectionItem {
    id: string;
    valuePlang: string; // English value (used as label)
    valueSlang: string; // Arabic value (used in input)
}

interface SectionData {
    [key: number]: SectionItem[];
}

const ArabicBioScreen = () => {
    const [arabicBioHeads, setArabicBioHeads] = useState<BioHead[]>([]);
    const [aboutDoctor, setAboutDoctor] = useState<string>('');
    const [aboutDoctorPlang, setAboutDoctorPlang] = useState<string>('');
    const [sectionData, setSectionData] = useState<SectionData>({});
    const [serviceProviderBio, setServiceProviderBio] = useState<any>(null);
    const [originalApiData, setOriginalApiData] = useState<SectionData>({}); // Store original API data
    const user = useSelector((state: any) => state.root.user.user);
    const { showAlert } = useAlert();
    useEffect(() => {
        getServiceProviderBioHeads();
        getServiceProviderBio();
    }, []);

    const getServiceProviderBioHeads = async () => {
        try {
            const response = await profileService.getServiceProviderBioHeads();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setArabicBioHeads(response.list);
            }
        } catch (error: any) {
        }
    }

    const getServiceProviderBio = async () => {
        try {
            const payload = {
                UserloginInfoId: user?.Id,
            };
            const response = await profileService.getServiceProviderBio(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                
                // Set About Doctor
                const serviceProviderInfo = response.ServiceProvidersInfo?.[0];
                const aboutDoctorValue = serviceProviderInfo?.AboutSlang || '';
                setAboutDoctor(aboutDoctorValue);
                setAboutDoctorPlang(serviceProviderInfo?.AboutPlang || '');
                
                // Set the bio data array
                const bioData = response.ServiceProvidersBio || [];
                setServiceProviderBio(bioData);
            }
        }
        catch (error: any) {
        }
    }

    // Map API data to sectionData format
    useEffect(() => {
        if (arabicBioHeads.length > 0) {
            const mappedData: SectionData = {};
            
            // Process all bio items from API
            if (serviceProviderBio && Array.isArray(serviceProviderBio) && serviceProviderBio.length > 0) {
                
                // Group bio items by CatServiceProviderBioHeadId
                serviceProviderBio.forEach((bioItem: any, index: number) => {
                    const headId = bioItem.CatServiceProviderBioHeadId;
                    const valuePlang = bioItem.ValuePlang || '';
                    const valueSlang = bioItem.ValueSlang || '';
                    
                    if (headId) {
                        if (!mappedData[headId]) {
                            mappedData[headId] = [];
                        }
                        // Create unique ID
                        const uniqueId = `head-${headId}-item-${index}-${bioItem.UserloginInfoId || Date.now()}`;
                        mappedData[headId].push({
                            id: uniqueId,
                            valuePlang: valuePlang, // English value (label)
                            valueSlang: valueSlang // Arabic value (input)
                        });
                    }
                });
                
            }
            
            // Initialize empty sections for heads that don't have data
            arabicBioHeads.forEach((head: BioHead) => {
                if (!mappedData[head.Id] || mappedData[head.Id].length === 0) {
                    mappedData[head.Id] = [{ id: `head-${head.Id}-empty-${Date.now()}`, valuePlang: '', valueSlang: '' }];
                }
            });
            
            setSectionData(mappedData);
            setOriginalApiData(JSON.parse(JSON.stringify(mappedData))); // Store a deep copy of original data
        }
    }, [serviceProviderBio, arabicBioHeads]);

    const handleAddItem = (headId: number) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: [
                ...(prev[headId] || []),
                { id: Date.now().toString(), valuePlang: '', valueSlang: '' }
            ]
        }));
    };

    const handleDeleteItem = (headId: number, itemId: string) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: prev[headId].filter(item => item.id !== itemId)
        }));
    };

    const handleItemChange = (headId: number, itemId: string, value: string, isEnglish: boolean = false) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: prev[headId].map(item =>
                item.id === itemId 
                    ? { ...item, [isEnglish ? 'valuePlang' : 'valueSlang']: value } 
                    : item
            )
        }));
    };

    const makeBioPayload = () => {
        const payload: any[] = [];
        const processedItems = new Map<string, boolean>(); // Track processed items by ValuePlang + headId
        
        // First, process current sectionData (user's edits)
        Object.keys(sectionData).forEach((headIdStr) => {
            const headId = parseInt(headIdStr);
            const items = sectionData[headId] || [];
            
            // Include items that have either English text OR Arabic text
            const validItems = items.filter(item => 
                !item.id.startsWith('temp-') && 
                (item.valuePlang.trim() !== '' || item.valueSlang.trim() !== '')
            );
            
            validItems.forEach((item) => {
                const key = `${headId}-${item.valuePlang}`;
                if (!processedItems.has(key)) {
                    payload.push({
                        CatServiceProviderBioHeadId: headId,
                        ValuePlang: item.valuePlang || '',
                        ValueSlang: item.valueSlang || ''
                    });
                    processedItems.set(key, true);
                }
            });
        });
        
        // Then, merge with original API data to include items that weren't edited
        Object.keys(originalApiData).forEach((headIdStr) => {
            const headId = parseInt(headIdStr);
            const originalItems = originalApiData[headId] || [];
            
            originalItems.forEach((item) => {
                // Include items from original API that have English text (even if Arabic is empty)
                // and haven't been processed yet
                if (item.valuePlang && item.valuePlang.trim() !== '') {
                    const key = `${headId}-${item.valuePlang}`;
                    if (!processedItems.has(key)) {
                        payload.push({
                            CatServiceProviderBioHeadId: headId,
                            ValuePlang: item.valuePlang,
                            ValueSlang: item.valueSlang || '' // Preserve original Arabic or empty
                        });
                        processedItems.set(key, true);
                    }
                }
            });
        });
        
        return payload;
    }

    const handleSave = async () => {
        const payload = {
            UserloginInfoId: user?.Id,
            AboutPlang: aboutDoctorPlang,
            AboutSlang: aboutDoctor,
            Bio: makeBioPayload(),
        };
        const response = await profileService.updateServiceProviderBio(payload);
        if (response?.StatusCode?.STATUSCODE == 11018) {
            showAlert({
                title: response.StatusCode.MESSAGE,
                message: '',
                type: 'success',
            });
        }
    };

    const renderSection = (head: BioHead) => {
        const items = sectionData[head.Id] || [];
        const isMembership = head.Id === 6; // Membership doesn't have add button

        // If no items exist, show at least one empty input
        const displayItems = items.length > 0 ? items : [{ id: 'temp-' + head.Id, valuePlang: '', valueSlang: '' }];

        return (
            <View key={head.Id} style={styles.section}>
                <Text style={styles.sectionHeading}>{head.TitleSlang}</Text>
                {displayItems.map((item, index) => {
                    const isTempItem = item.id.startsWith('temp-');
                    const isPrimaryField = index === 0; // First field is primary, no delete button
                    const hasEnglishValue = item.valuePlang && item.valuePlang.trim() !== '';
                    const labelText = item.valuePlang || 'New';
                    
                    return (
                        <View key={item.id} style={styles.inputContainer}>
                            {hasEnglishValue && (
                                <Text style={styles.inputLabel}>{labelText} :(EN)</Text>
                            )}
                            <View style={styles.inputRow}>
                                {!isTempItem && !isPrimaryField && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteItem(head.Id, item.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                    </TouchableOpacity>
                                )}
                                <TextInput
                                    style={styles.input}
                                    placeholder={head.TitleSlang}
                                    value={item.valueSlang}
                                    onChangeText={(value) => {
                                        if (isTempItem) {
                                            // Initialize the section with this item (empty English value)
                                            setSectionData(prev => ({
                                                ...prev,
                                                [head.Id]: [{ id: Date.now().toString(), valuePlang: '', valueSlang: value }]
                                            }));
                                        } else {
                                            handleItemChange(head.Id, item.id, value);
                                        }
                                    }}
                                    placeholderTextColor="#999"
                                    textAlign="right"
                                />
                            </View>
                        </View>
                    );
                })}
                {!isMembership && (
                    <TouchableOpacity
                        style={styles.addItemButton}
                        onPress={() => {
                            if (items.length === 0) {
                                // Initialize with one item first
                                setSectionData(prev => ({
                                    ...prev,
                                    [head.Id]: [{ id: Date.now().toString(), valuePlang: '', valueSlang: '' }]
                                }));
                            } else {
                                handleAddItem(head.Id);
                            }
                        }}
                    >
                        <Text style={styles.addItemButtonText}>+ اضافة عنصر</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

  return (
        <SafeAreaView style={styles.container}>
            <CustomScreensHeader title="Arabic Bio" />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* About Doctor Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionHeading}>عن الطبيب</Text>
                            <TextInput
                                style={styles.aboutDoctorInput}
                                placeholder="عن الطبيب"
                                value={aboutDoctor}
                                onChangeText={setAboutDoctor}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                textAlign="right"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Dynamic Sections from API */}
                        {arabicBioHeads.map((head) => renderSection(head))}
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.saveButtonContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
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
    flex: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        flex: 1,
        backgroundColor: '#e4f1ef',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        marginBottom: 8,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textAlign: 'right',
    },
    inputContainer: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#666',
        marginBottom: 4,
        textAlign: 'right',
    },
    englishInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    englishInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 12,
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        height: 36,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        textAlign: 'right',
    },
    aboutDoctorInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        height: 50,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    deleteButton: {
        marginLeft: 8,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff4444',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    addItemButton: {
        backgroundColor: '#e4f1ef',
        borderWidth: 1,
        borderColor: '#00A19D',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    addItemButtonText: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#00A19D',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    saveButton: {
        backgroundColor: '#00A19D',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#fff',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
});

export default ArabicBioScreen