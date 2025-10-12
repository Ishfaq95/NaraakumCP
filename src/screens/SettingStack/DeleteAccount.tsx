import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import CustomScreensHeader from '../../components/common/CustomScreensHeader'
import colors from '../../styles/colors'
import { ROBOTO_FONTS } from '../../styles/fonts'
import Icon from 'react-native-vector-icons/Ionicons'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles'

const DeleteAccountScreen = () => {
    const [password, setPassword] = useState('')
    const [secure, setSecure] = useState(true)

    const onDelete = () => {
        // Hook into your delete API flow here
    }

    const isDisabled = password.trim().length === 0

    return (
        <SafeAreaView style={styles.container}>
            <CustomScreensHeader title="Delete My Account" />
            <View style={styles.content}>
                <View style={{width:'100%',marginTop:20}}>
                    <Text style={styles.title}>Are you sure you want to permanently delete the account?</Text>
                    <Text style={styles.subtitle}>Please note the following before proceeding:</Text>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            All your data and personal information associated with the account will be deleted. You will not be able to recover the account or access any of the content linked to it after deletion.
                        </Text>
                    </View>

                    <Text style={styles.label}>To Confirm Deletion, Enter Your Password.</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9A9FA5"
                            secureTextEntry={secure}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeBtn}>
                            <Icon name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primary[600]} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        disabled={isDisabled}
                        onPress={onDelete}
                        style={[styles.deleteBtn, isDisabled && styles.deleteBtnDisabled]}
                    >
                        <Text style={[styles.deleteBtnText, isDisabled && styles.deleteBtnTextDisabled]}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: '#E4F1EF',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    title: {
        ...globalTextStyles.h4,
        fontWeight: 'bold',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
    },
    subtitle: {
        marginTop: 12,
        ...globalTextStyles.bodyMedium,
        fontSize: 14,
        color: '#404B53',
    },
    warningBox: {
        marginTop: 12,
        backgroundColor: '#FFF2CC',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F6E3A1',
    },
    warningText: {
        ...globalTextStyles.bodyMedium,
        fontSize: 14,
        color: '#232830',
        lineHeight: 20,
    },
    label: {
        ...globalTextStyles.h5,
        fontWeight: 'bold',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        marginTop: 30,
    },
    inputWrapper: {
        marginTop: 10,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DADADA',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    input: {
            flex: 1,
        ...globalTextStyles.bodyMedium,
    },
    eyeBtn: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    deleteBtn: {
        marginTop: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D9534F',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    deleteBtnDisabled: {
        borderColor: '#E5B9B8',
    },
    deleteBtnText: {
        
        color: '#D9534F',
    },
    deleteBtnTextDisabled: {
        color: '#E5B9B8',
    },
})

export default DeleteAccountScreen