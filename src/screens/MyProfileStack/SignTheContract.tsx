import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions, Alert, Platform, Image } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import moment from 'moment';
import WebView from 'react-native-webview';
import SignatureScreen from 'react-native-signature-canvas';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { ROUTES } from '../../shared/utils/routes';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAlert } from '../../contexts/AlertContext';

const SignTheContractScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [contractSigningData, setContractSigningData] = useState<any>(null);
    const [showSignature, setShowSignature] = useState(false);
    const [signatureBase64, setSignatureBase64] = useState<string>('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [signatureKey, setSignatureKey] = useState(0); // Key to force re-render canvas
    const signatureRef = useRef<any>(null);
    const user = useSelector((state: any) => state.root.user.user);
    const [signatureFilePath, setSignatureFilePath] = useState<string>('');
    const [contractFilePath, setContractFilePath] = useState<string>('');
    const [pdfFilePath, setPdfFilePath] = useState<string>('');
    const [isSignatureEmpty, setIsSignatureEmpty] = useState(false);
    const [pendingSignatureAction, setPendingSignatureAction] = useState<'save' | 'download' | null>(null);
    const { showAlert } = useAlert();
    useEffect(() => {
        if (signatureFilePath && contractFilePath) {
            addServiceProviderContract()
        }
    }, [signatureFilePath, contractFilePath]);

    const addServiceProviderContract = async () => {
        try {
            const payload = {
                UserloginInfoId: user?.Id,
                AgreementSignatureMediaPath: signatureFilePath,
                AgreementPDFMediaPath: contractFilePath,
            };
            const response = await profileService.addServiceProviderContract(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                navigation.navigate(ROUTES.AfterContractSign as never);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to submit contract. Please try again.');
        }
    }

    useEffect(() => {
        getServiceProviderContractSigning();
    }, []);

    const getServiceProviderContractSigning = async () => {
        try {
            setIsLoading(true);
            const payload = {
                UserloginInfoId: user?.Id,
            };
            const response = await profileService.getServiceProviderContractSigning(payload);
            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setContractSigningData(response?.Contract[0]);
            }
        } catch (error: any) {
        }
        finally {
            setIsLoading(false);
        }
    }

    // Upload signature image or PDF contract
    const uploadContract = async (file: any, type: string) => {
        try {
            const response = await profileService.uploadFile(file, user);

            if (response?.ResponseStatus?.STATUSCODE === '200') {
                if (type === 'signature') {
                    setSignatureFilePath(response?.Path || response?.Data?.Path);
                } else if (type === 'contract') {
                    setContractFilePath(response?.Path || response?.Data?.Path);
                }
            }
        } catch (error: any) {
        }
    };

    // Convert base64 signature to file and upload
    const saveAndUploadSignature = async (signature: string) => {
        try {
            // Remove data URL prefix if present
            const base64Data = signature.replace(/^data:image\/\w+;base64,/, '');

            // Create file path
            const fileName = `Signature_${moment().format('YYYY-MM-DD_HHmmss')}.png`;
            const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

            // Write base64 to file
            await RNFS.writeFile(filePath, base64Data, 'base64');

            // Prepare file object for upload
            const fileObject = {
                uri: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
                type: 'image/png',
                name: fileName,
            };

            // Upload signature image
            await uploadContract(fileObject, 'signature');

        } catch (error) {
        }
    };

    // Upload PDF contract
    const uploadPDFContract = async (pdfFilePath: string) => {
        try {
            const fileName = `Contract_${moment().format('YYYY-MM-DD_HHmmss')}.pdf`;

            // Prepare file object for upload
            const fileObject = {
                uri: Platform.OS === 'ios' ? pdfFilePath : `file://${pdfFilePath}`,
                type: 'application/pdf',
                name: fileName,
            };

            // Upload PDF
            await uploadContract(fileObject, 'contract');

        } catch (error) {
        }
    };

    // Handle Agree & Continue button click
    const handleAgreeAndContinue = () => {
        setSignatureKey(0); // Reset key for fresh canvas
        setShowSignature(true);
    };

    // Handle signature confirmation (called after readSignature())
    const handleSignature = async (signature: string) => {
        setSignatureBase64(signature);
        setIsSignatureEmpty(false);

        // If user pressed Download, just save image locally and return
        if (pendingSignatureAction === 'download') {
            try {
                // Strip data URL prefix if present
                const base64Data = signature.replace(/^data:image\/\w+;base64,/, '');
                const fileName = `Signature_${moment().format('YYYY-MM-DD_HHmmss')}.png`;
                const directory =
                    Platform.OS === 'android'
                        ? (RNFS.DownloadDirectoryPath || RNFS.ExternalDirectoryPath)
                        : RNFS.DocumentDirectoryPath;
                const filePath = `${directory}/${fileName}`;

                await RNFS.writeFile(filePath, base64Data, 'base64');

                if (Platform.OS === 'ios') {
                    // On iOS, immediately open share sheet so user can save/share the image
                    try {
                        await Share.open({
                            title: 'Share Signature',
                            url: filePath,
                            type: 'image/png',
                        });
                    } catch (shareError) {
                        // User may cancel share; no need to show error
                    }
                } else {
                    // On Android, just show success message with path
                    showAlert({
                        title: 'Success',
                        message: `Signature image downloaded:\n${filePath}`,
                        type: 'success',
                    });
                }
            } catch (error) {
                showAlert({
                    title: 'Error',
                    message: 'Failed to download signature image. Please try again.',
                    type: 'error',
                });
            } finally {
                setPendingSignatureAction(null);
            }
            return;
        }

        // Default / save flow: upload signature and generate PDF
        setPendingSignatureAction(null);

        // Upload signature image
        await saveAndUploadSignature(signature);

        // Generate PDF after signature is saved
        setTimeout(() => {
            generatePDF(signature);
        }, 500);
    };

    // Handle signature clear - force re-render by changing key
    const handleClear = () => {
        setSignatureKey(prev => prev + 1);
    };

    // Handle empty signature
    const handleEmpty = () => {
        setIsSignatureEmpty(true);
    };

    // Generate PDF with signature
    const generatePDF = async (signature: string) => {
        try {
            setIsGeneratingPDF(true);

            // Get the HTML content with signature
            const htmlWithSignature = getHTMLContentWithSignature(signature);

            // PDF options
            const options = {
                html: htmlWithSignature,
                fileName: `Contract_${moment().format('YYYY-MM-DD_HHmmss')}`,
                directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
                base64: true,
            };

            // Generate PDF
            const pdf = await RNHTMLtoPDF.convert(options);

            if (pdf.filePath) {
                // Save PDF file path for viewing later
                setPdfFilePath(pdf.filePath);

                // Upload PDF to server
                await uploadPDFContract(pdf.filePath);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Share PDF
    const sharePDF = async (filePath: string) => {
        try {
            const shareOptions = {
                title: 'Share Contract PDF',
                url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
                type: 'application/pdf',
            };
            await Share.open(shareOptions);
        } catch (error) {
        }
    };

    const renderScreenHeader = () => (
        <View style={styles.screenHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Signing The Contract</Text>
        </View>
    );

    // Process HTML to replace dynamic variables
    const getProcessedHTML = () => {
        if (!contractSigningData?.DescriptionSlang) {
            return '';
        }

        let html = contractSigningData.DescriptionSlang;

        // Replace dynamic variables if available
        const currentDate = moment().format('DD/MM/YYYY');
        html = html.replace(/{CURRENT_DATE}/g, currentDate);

        if (contractSigningData?.NationalId) {
            html = html.replace(/{NATIONAL_ID}/g, contractSigningData.NationalId);
        }

        if (contractSigningData?.ClassificationNumber) {
            html = html.replace(/{CLASSIFICATION_NUMBER}/g, contractSigningData.ClassificationNumber);
        }

        return html;
    };

    // Create complete HTML with proper styling and RTL support
    const getHTMLContent = () => {
        const processedHTML = getProcessedHTML();

        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            padding: 15px;
            border-radius: 12px;
            background-color: #fff;
            line-height: 1.8;
            font-size: 14px;
        }
        p {
            margin-bottom: 12px;
        }
        strong {
            font-weight: bold;
        }
        u {
            text-decoration: underline;
        }
        ul {
            padding-right: 25px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 10px;
        }
        @media only screen and (max-width: 600px) {
            body {
                font-size: 13px;
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    ${processedHTML}
</body>
</html>
        `;
    };

    // Create HTML with signature appended
    const getHTMLContentWithSignature = (signature: string) => {
        const processedHTML = getProcessedHTML();

        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            padding: 15px;
            background-color: #ffffff;
            line-height: 1.8;
            font-size: 14px;
        }
        p {
            margin-bottom: 12px;
        }
        strong {
            font-weight: bold;
        }
        u {
            text-decoration: underline;
        }
        ul {
            padding-right: 25px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 10px;
        }
        .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #333;
            text-align: right;
        }
        .signature-label {
            font-size: 14px;
            margin-bottom: 10px;
        }
        .signature-image {
            max-width: 220px;
            max-height: 110px;
            height: auto;
            width: auto;
            display: inline-block;
            object-fit: contain;
        }
    </style>
</head>
<body>
    ${processedHTML}
    
    <div class="signature-section">
        <p class="signature-label"><strong>توقيع الطرف الثاني (المستشار):</strong></p>
        <img src="${signature}" class="signature-image" alt="Signature" />
        <p style="font-size: 12px; margin-top: 5px; color: #666;">التاريخ: ${moment().format('DD/MM/YYYY')}</p>
    </div>
</body>
</html>
        `;
    };

    const handleDownloadSignature = () => {
        // Trigger readSignature and let handleSignature handle the download logic
        setPendingSignatureAction('download');
        signatureRef.current?.readSignature();
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                {renderScreenHeader()}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0066cc" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : showSignature ? (
                    // Signature Canvas View
                    <View style={styles.signatureContainer}>
                        <View style={{ paddingHorizontal: 12 }}>
                            <Image source={require('../../assets/images/signaturePancil.png')} style={styles.signaturePancilImage} />
                            <Text style={styles.signatureTitle}>Please sign in the box below</Text>
                            <Text style={styles.signatureSubtitle}>Make sure the signature looks like the one in your id</Text>
                        </View>
                        <View style={styles.signatureCanvasWrapper}>
                            <SignatureScreen
                                key={signatureKey}
                                ref={signatureRef}
                                onOK={handleSignature}
                                onEmpty={handleEmpty}
                                descriptionText=""
                                clearText="Clear"
                                confirmText="Save Signature"
                                penColor="#000000"
                                backgroundColor="#FFFFFF"
                                webStyle={`
                                    .m-signature-pad {
                                        box-shadow: none;
                                        border-radius: 10px;
                                    }
                                    .m-signature-pad--body {
                                        border: none;
                                        background-color: #ffffff;
                                    }
                                    .m-signature-pad--body canvas {
                                        background-color: #ffffff;
                                    }
                                    .m-signature-pad--footer {
                                        display: none;
                                    }
                                    body,html {
                                        width: 100%;
                                        height: 100%;
                                    }
                                `}
                            />
                        </View>
                        {isSignatureEmpty && (
                            <View style={{ paddingHorizontal: 12, paddingBottom: 10, alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.regular, color: '#FF0000', lineHeight: Platform.OS === 'ios' ? 0 : 20 }}>Please draw a signature before continuing.</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 }}>
                            <TouchableOpacity
                                style={styles.signatureClearButton}
                                onPress={handleClear}
                            >
                                <Text style={styles.signatureClearText}>Repeat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.signatureDownloadButton}
                                onPress={handleDownloadSignature}
                            >
                                <AntDesign name="download" size={24} color="#239ea0" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.signatureSaveButton}
                            onPress={() => signatureRef.current?.readSignature()}
                        >
                            <Ionicons name="checkmark-outline" size={24} color="#fff" />
                            <Text style={styles.signatureSaveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                ) : isGeneratingPDF ? (
                    // PDF Generation Loading
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0066cc" />
                        <Text style={styles.loadingText}>Generating PDF...</Text>
                    </View>
                ) : contractSigningData?.DescriptionSlang ? (
                    // Contract WebView
                    <View style={styles.webviewContainer}>
                        <View style={styles.webviewWrapper}>
                            <WebView
                                source={{ html: getHTMLContent() }}
                                style={styles.webview}
                                showsVerticalScrollIndicator={true}
                                showsHorizontalScrollIndicator={false}
                                scalesPageToFit={true}
                                bounces={true}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={styles.webviewLoading}>
                                        <ActivityIndicator size="small" color="#0066cc" />
                                    </View>
                                )}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleAgreeAndContinue}
                            >
                                <Text style={styles.buttonText}>Agree & Next</Text>
                                <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No contract available</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
    },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
    },
    headerTitle: {
        fontSize: 16,
        color: '#191919',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        marginLeft: 4,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
        padding: 16,
    },
    webviewWrapper: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e4f1ef',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    webviewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e4f1ef',
        padding: 20,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    buttonContainer: {
        paddingTop: 6,
        backgroundColor: '#e4f1ef',
        borderRadius: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#239ea0',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        marginRight: 8,
    },
    // Signature Canvas Styles
    signatureContainer: {
        flex: 1,
        backgroundColor: '#e4f1ef',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    signatureTitle: {
        fontSize: 20,
        color: '#191919',
        lineHeight: Platform.OS === 'ios' ? 0 : 24,
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    signatureSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    signatureCanvasWrapper: {
        height: '50%',
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
    },
    signatureButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 15,
    },
    signatureClearButton: {
        height: 40,
        width: 100,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#239ea0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signatureDownloadButton: {
        height: 40,
        width: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#239ea0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signatureClearText: {
        color: '#239ea0',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    signatureSaveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        width: '100%',
        padding: 12,
        backgroundColor: '#239ea0',
        borderRadius: 10,
        alignSelf: 'center',
    },
    signatureSaveText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        marginLeft: 8,
    },
    signatureBackButton: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
    },
    signatureBackText: {
        color: '#666',
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    signaturePancilImage: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    },
});

export default SignTheContractScreen