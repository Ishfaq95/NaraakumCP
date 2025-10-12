import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import CustomScreensHeader from '../../components/common/CustomScreensHeader'
import { globalTextStyles } from '../../styles/globalStyles'

const HelpScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <CustomScreensHeader title="Video Tutorials" />
            <View style={styles.content}>
                <Text style={styles.text}>Coming Soon...</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...globalTextStyles.h5,
        fontWeight: 'bold',
        color: '#000',
    },
})

export default HelpScreen