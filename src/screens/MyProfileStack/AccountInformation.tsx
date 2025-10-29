import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const AccountInformationScreen = () => {
    const navigation = useNavigation();

    const renderHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#fff', padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />

            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Personal Profile</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}> */}
            {renderHeader()}
            <View style={{ flex: 1, backgroundColor: '#e4f1ef' }}>
                <View style={{ height: 100, backgroundColor: '#23a2a4' }} />
                <View style={{ flex: 1, paddingHorizontal: 16, marginTop: -70 }}>
                    <View style={{ height: 80, marginTop: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', height: 100, borderWidth: 2, borderColor: '#fff', width: 100, bottom: 50, backgroundColor: '#999', borderRadius: 50, padding: 10 }}>

                            <View style={{ position: 'absolute', height: 30, width: 30, backgroundColor: '#fff', borderRadius: 15, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="camera" size={20} color="#333" />
                            </View>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', bottom: -15 }}>Upload Image</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10 }}>

                        </View>
                    </ScrollView>
                    <View style={{ paddingVertical: 10 }}>
                        <TouchableOpacity style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
        fontWeight: 'bold',
        color: '#666',
        paddingVertical: 10,
    },
    scrollContainer: {
        marginTop: 10,
    },
});

export default AccountInformationScreen