import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

const SuccessScreen = ({ onNext }: any) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={{ height: 100, width: 100, backgroundColor: '#E6F3EF', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="checkmark-sharp" size={50} color="#20B2AA" />
                </View>
                <Text style={styles.description}>Your membership has been successfully registered</Text>
            </View>
            <View style={styles.navigationContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    nextButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        // marginLeft: 12,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    description: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        fontWeight: '600',
        color: '#666',
    },
});

export default SuccessScreen;