import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { profileService } from '../../services/api/profileService';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

interface BioHead {
    Id: number;
    TitlePlang: string;
    TitleSlang: string;
}

interface SectionItem {
    id: string;
    value: string;
    valueSlang?: string; // Store original ValueSlang for existing items
}

interface SectionData {
    [key: number]: SectionItem[];
}

const EnglishBioScreen = () => {
    const [englishBioHeads, setEnglishBioHeads] = useState<BioHead[]>([]);
    const [aboutDoctor, setAboutDoctor] = useState<string>('');
    const [aboutDoctorSlang, setAboutDoctorSlang] = useState<string>('');
    const [sectionData, setSectionData] = useState<SectionData>({});
    const [serviceProviderBio, setServiceProviderBio] = useState<any>(null);
    const user = useSelector((state: any) => state.root.user.user);
    useEffect(() => {
        getServiceProviderBioHeads();
        getServiceProviderBio();
    }, []);

    const getServiceProviderBioHeads = async () => {
        try {
            const response = await profileService.getServiceProviderBioHeads();
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setEnglishBioHeads(response.list);
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
                
                // Set About Doctor - check multiple possible field names
                const serviceProviderInfo = response.ServiceProvidersInfo?.[0];
                const aboutDoctorValue = serviceProviderInfo?.AboutPlang || '';
                setAboutDoctor(aboutDoctorValue);
                setAboutDoctorSlang(serviceProviderInfo?.AboutSlang || '');
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
        // Only map when we have both heads and bio data (or heads with no bio data)
        if (englishBioHeads.length > 0) {
            const mappedData: SectionData = {};
            
            // Process all bio items from API
            if (serviceProviderBio && Array.isArray(serviceProviderBio) && serviceProviderBio.length > 0) {
                
                // Group bio items by CatServiceProviderBioHeadId
                serviceProviderBio.forEach((bioItem: any, index: number) => {
                    const headId = bioItem.CatServiceProviderBioHeadId;
                    const value = bioItem.ValuePlang || '';
                    const valueSlang = bioItem.ValueSlang || '';
                    
                    if (headId) {
                        if (!mappedData[headId]) {
                            mappedData[headId] = [];
                        }
                        // Create unique ID - use a more stable approach
                        const uniqueId = `head-${headId}-item-${index}-${bioItem.UserloginInfoId || Date.now()}`;
                        mappedData[headId].push({
                            id: uniqueId,
                            value: value,
                            valueSlang: valueSlang // Store original ValueSlang
                        });
                    }
                });
                
            }
            
            // Initialize empty sections for heads that don't have data
            englishBioHeads.forEach((head: BioHead) => {
                if (!mappedData[head.Id] || mappedData[head.Id].length === 0) {
                    mappedData[head.Id] = [{ id: `head-${head.Id}-empty-${Date.now()}`, value: '', valueSlang: undefined }];
                }
            });
            
            setSectionData(mappedData);
        }
    }, [serviceProviderBio, englishBioHeads]);

    const handleAddItem = (headId: number) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: [
                ...(prev[headId] || []),
                { id: Date.now().toString(), value: '', valueSlang: undefined } // New items don't have valueSlang
            ]
        }));
    };

    const handleDeleteItem = (headId: number, itemId: string) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: prev[headId].filter(item => item.id !== itemId)
        }));
    };

    const handleItemChange = (headId: number, itemId: string, value: string) => {
        setSectionData(prev => ({
            ...prev,
            [headId]: prev[headId].map(item =>
                item.id === itemId ? { ...item, value } : item
            )
        }));
    };

    const makeBioPayload = () => {
        const payload: any[] = [];
        
        // Iterate through all sections
        Object.keys(sectionData).forEach((headIdStr) => {
            const headId = parseInt(headIdStr);
            const items = sectionData[headId] || [];
            
            // Filter out temp items and empty values
            const validItems = items.filter(item => 
                !item.id.startsWith('temp-') && 
                item.value.trim() !== ''
            );
            
            // Create payload objects for each valid item
            validItems.forEach((item) => {
                payload.push({
                    CatServiceProviderBioHeadId: headId,
                    ValuePlang: item.value,
                    ValueSlang: item.valueSlang || '' // Use stored ValueSlang if exists, otherwise empty
                });
            });
        });
        
        return payload;
    }

    const handleSave = async () => {
        // TODO: Implement save functionality
        const payload = {
            UserloginInfoId: user?.Id,
            AboutPlang: aboutDoctor,
            AboutSlang: aboutDoctorSlang,
            Bio: makeBioPayload(),
        };
        const response = await profileService.updateServiceProviderBio(payload);
        if (response?.StatusCode?.STATUSCODE == 11018) {
        }
    };

    const renderSection = (head: BioHead) => {
        const items = sectionData[head.Id] || [];
        const isMembership = head.Id === 6; // Membership doesn't have add button

        // If no items exist, show at least one empty input
        const displayItems = items.length > 0 ? items : [{ id: 'temp-' + head.Id, value: '', valueSlang: undefined }];

        return (
            <View key={head.Id} style={styles.section}>
                <Text style={styles.sectionHeading}>{head.TitlePlang}</Text>
                {displayItems.map((item, index) => {
                    const isTempItem = item.id.startsWith('temp-');
                    const isPrimaryField = index === 0; // First field is primary, no delete button
                    return (
                        <View key={item.id} style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder={head.TitlePlang}
                                value={item.value}
                                onChangeText={(value) => {
                                    if (isTempItem) {
                                        // Initialize the section with this item
                                        setSectionData(prev => ({
                                            ...prev,
                                            [head.Id]: [{ id: Date.now().toString(), value, valueSlang: undefined }]
                                        }));
                                    } else {
                                        handleItemChange(head.Id, item.id, value);
                                    }
                                }}
                                placeholderTextColor="#999"
                            />
                            {!isTempItem && !isPrimaryField && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteItem(head.Id, item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            )}
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
                                    [head.Id]: [{ id: Date.now().toString(), value: '', valueSlang: undefined }]
                                }));
                            } else {
                                handleAddItem(head.Id);
                            }
                        }}
                    >
                        <Text style={styles.addItemButtonText}>+ Add Item</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomScreensHeader title="English Bio" />
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
                            <Text style={styles.sectionHeading}>About Doctor</Text>
                            <TextInput
                                style={styles.aboutDoctorInput}
                                placeholder="About Doctor"
                                value={aboutDoctor}
                                onChangeText={setAboutDoctor}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Dynamic Sections from API */}
                        {englishBioHeads.map((head) => renderSection(head))}
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
        marginBottom: 8,
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

export default EnglishBioScreen