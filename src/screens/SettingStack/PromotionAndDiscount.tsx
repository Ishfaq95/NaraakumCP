import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import CustomScreensHeader from '../../components/common/CustomScreensHeader';
import PromotionItem, { Promotion } from '../../components/PromotionItem';
import { globalTextStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { settingService } from '../../services/api/settingService';
import { useSelector } from 'react-redux';

const PromotionAndDiscount: React.FC = () => {
    const [promoCodeList, setPromoCodeList] = useState<any[]>([]);
    const user = useSelector((state: any) => state.root.user.user);

    console.log('user', promoCodeList);

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

    // Sample data - replace with actual data from your API/state management
    const [promotions, setPromotions] = useState<any[]>([
        {
            id: '1',
            pCode: 'narakum 50',
            discount: 50.0,
            utilization: 2,
            allowedClients: 2,
            perClientMultiUsage: true,
            allowedUsage: 2,
            expiryDate: '05-12-2024',
        },
        // Add more sample promotions as needed
    ]);

    const handleEditPromotion = (promotion: any) => {
        console.log('Edit promotion:', promotion);
        // Navigate to edit screen or show edit modal
        Alert.alert('Edit Promotion', `Edit promotion: ${promotion.pCode}`);
    };

    const handleDeletePromotion = (promotion: any) => {
        Alert.alert(
            'Delete Promotion',
            `Are you sure you want to delete promotion "${promotion.pCode}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setPromotions(prev => prev.filter(p => p.id !== promotion.id));
                    },
                },
            ]
        );
    };

    const handleAddNewPromotion = () => {
        console.log('Add new promotion');
        // Navigate to add promotion screen or show add modal
        Alert.alert('Add New Promotion', 'Navigate to add promotion screen');
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

export default PromotionAndDiscount;
