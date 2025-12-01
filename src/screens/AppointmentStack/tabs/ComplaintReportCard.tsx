import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, Share } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import { MediaBaseURL } from '../../../shared/utils/constants';
import RNFetchBlob from 'rn-fetch-blob';
import { shareFile } from '../../../services/InvoiceService';

interface ComplaintReportCardProps {
    item: any;
    fileName: string;
    fileType: string;   
}

const ComplaintReportCard: React.FC<ComplaintReportCardProps> = ({
    item,
    fileName,
    fileType,
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const getFileNameFromUrl = (url: string) => {
        const parts = url.split('/');
        return parts.pop() || 'document';
    }

    const handleDownload = () => {
        const completeUrl = `${MediaBaseURL}${item.FilePath}`;
        const fileName = getFileNameFromUrl(item.FilePath);
        if(Platform.OS === 'ios'){
            downloadFIleForIOS(completeUrl, fileName);
        }else{
            downloadFile(completeUrl, fileName);
        }
    }

    const downloadFIleForIOS = async (url: string, fileName: string) => {
        const {config, fs} = RNFetchBlob;
        const DocumentDir = fs.dirs.DocumentDir;
        const filePath = `${DocumentDir}/${fileName}`;
    
        try {
            const res = await config({
                fileCache: true,
                path: filePath,
            }).fetch('GET', url);
            
            await Share.share({
                url: `file://${filePath}`,
                title: fileName,
              });
        } catch (error) {
            Alert.alert('File downloading error.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    const downloadFile = async (url: string, fileName: string) => {
        const {config, fs} = RNFetchBlob;
        const DownloadDir = fs.dirs.DownloadDir;
        const filePath = `${DownloadDir}/${fileName}`;
    
        try {
            const res = await config({
                fileCache: true,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    mediaScannable: true,
                    title: fileName,
                    path: filePath,
                },
            }).fetch('GET', url);
            
            Alert.alert('File downloaded successfully');
        } catch (error) {
            Alert.alert('File downloading error.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <View style={styles.card}>
            {/* Header row: File name + icon */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerLabel}>File Name</Text>
                    <Text
                        style={styles.fileName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {fileName}
                    </Text>
                </View>
                <MaterialIcons
                    name="description"
                    size={28}
                    color="#666"
                />
            </View>

            {/* Meta row: File type */}
            <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                    <MaterialIcons
                        name="description"
                        size={18}
                        color="#23a2a4"
                    />
                    <Text style={styles.metaLabel}>File Type</Text>
                </View>
                <Text style={styles.metaValue}>{fileType}</Text>
            </View>

            {/* Download button */}
            <TouchableOpacity
                style={styles.downloadButton}
                activeOpacity={0.8}
                onPress={handleDownload}
            >
                <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        marginBottom: 2,
    },
    fileName: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#111827',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        textAlign: 'left',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    metaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: CAIRO_FONT_FAMILY.regular,
        marginLeft: 6,
    },
    metaValue: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#111827',
    },
    downloadButton: {
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButtonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        color: '#23a2a4',
    },
});

export default ComplaintReportCard;


