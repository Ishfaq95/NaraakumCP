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

  // Download PDF to device
  const downloadPDF = async () => {
    try {
      const fileName = `Contract_${Date.now()}.pdf`;
      const destPath = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/${fileName}`;

      // Check if source file exists
      const exists = await RNFS.exists(`${MediaBaseURL}${pdfPath}`);
      if (!exists) {
        Alert.alert('Error', 'PDF file not found.');
        return;
      }

      // Copy file to Downloads/Documents
      await RNFS.copyFile(`${MediaBaseURL}${pdfPath}`, destPath);

      Alert.alert(
        'Success',
        `PDF downloaded successfully!\nLocation: ${Platform.OS === 'ios' ? 'Documents' : 'Downloads'}`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download PDF. Please try again.');
    }
  };

  // Share PDF
  const sharePDF = async () => {
    try {
      const shareOptions = {
        title: 'Share Contract PDF',
        url: Platform.OS === 'ios' ? pdfPath : `file://${pdfPath}`,
        type: 'application/pdf',
      };
      await Share.open(shareOptions);
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Share error:', error);
      }
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={sharePDF} style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#239ea0" />
        </TouchableOpacity>
        <TouchableOpacity onPress={downloadPDF} style={styles.actionButton}>
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
    fontWeight: 'bold',
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    marginHorizontal: 10,
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

