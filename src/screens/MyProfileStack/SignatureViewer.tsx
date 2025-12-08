import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { MediaBaseURL } from '../../shared/utils/constants';
import FullScreenLoader from '../../components/FullScreenLoader';
import RNFetchBlob from 'react-native-blob-util';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  pdfPath: string;
  title?: string;
}

const SignatureViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: any) => state.root.user.user);
  const [pdfPath, setPdfPath] = useState<string>('');
  const [title, setTitle] = useState<string>('Signed Contract');
  const [isDownloading, setIsDownloading] = useState(false);
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
            setPdfPath(response?.ServiceProviderInfo[0]?.AgreementPDFMediaPath);
        }
    } catch (error: any) {
        console.log('error', error)
    }
    finally {
        setIsLoading(false);
    }
}

  // Handle PDF load success
  const onLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setLoading(false);
  };

  // Handle PDF load error
  const onError = (error: any) => {
    console.error('PDF Load Error:', error);
    setLoading(false);
    Alert.alert('Error', 'Failed to load PDF. Please try again.');
  };

  // Handle page change
  const onPageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts.pop() || 'document';
}

const handleViewFile = () => {
    if(Platform.OS === 'ios'){
        downloadFIleForIOS(`${MediaBaseURL}${pdfPath}`, getFileNameFromUrl(pdfPath));
    }else{
        downloadFile(`${MediaBaseURL}${pdfPath}`, getFileNameFromUrl(pdfPath));
    }
};

const downloadFIleForIOS = async (url: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;
    const DocumentDir = fs.dirs.DocumentDir;
    const filePath = `${DocumentDir}/${fileName}`;

    try {
        const res = await config({
            fileCache: true,
            path: filePath,
        }).fetch('GET', url);
        
        Alert.alert(
            'File downloaded successfully',
            'The file is saved to your device.',
        );
        RNFetchBlob.ios.previewDocument(filePath);
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

  // Ensure the PDF is available locally and return a local file URI (file://)
  const ensureLocalPdf = async (): Promise<string> => {
    const sourceUrl = pdfPath?.startsWith('http') || pdfPath?.startsWith('file:')
      ? pdfPath
      : `${MediaBaseURL}${pdfPath}`;

    if (!sourceUrl) {
      throw new Error('PDF path is missing');
    }

    // If already a local file, return as-is (ensure file:// prefix)
    if (sourceUrl.startsWith('file://')) {
      return sourceUrl;
    }

    // Download to cache for sharing (works on Android & iOS)
    const fileName = getFileNameFromUrl(sourceUrl) || `contract_${Date.now()}.pdf`;
    const cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;

    await RNFetchBlob.config({ path: cachePath, fileCache: true }).fetch('GET', sourceUrl);

    // Always return with file:// prefix for Share.open
    return `file://${cachePath}`;
  };

  // Share PDF
  const sharePDF = async () => {
    try {
      setIsDownloading(true);
      const localUri = await ensureLocalPdf();
      await Share.open({
        title: 'Share Contract PDF',
        url: localUri,
        type: 'application/pdf',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Share error:', error);
        Alert.alert('Error', 'Unable to share the file. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {'Contract details'}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={sharePDF} style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#239ea0" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewFile} style={styles.actionButton}>
          <Ionicons name="download-outline" size={24} color="#239ea0" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render page indicator
  const renderPageIndicator = () => (
    <View style={styles.pageIndicator}>
      <Text style={styles.pageText}>
        Page {currentPage} of {totalPages}
      </Text>
    </View>
  );

  if (!pdfPath) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <FullScreenLoader visible={true} />
        </View>
      </SafeAreaView>
    );
  }

  console.log('pdfPath', `${MediaBaseURL}${pdfPath}`);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.pdfContainer}>
        <Pdf
          source={{ uri: `${MediaBaseURL}${pdfPath}` }}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={onError}
          onPageChanged={onPageChanged}
          trustAllCerts={false}
          enablePaging={true}
          spacing={10}
          fitPolicy={0}
          horizontal={false}
        />
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#239ea0" />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
        
        {!loading && totalPages > 0 && renderPageIndicator()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  errorButton: {
    backgroundColor: '#239ea0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
});

export default SignatureViewer;

