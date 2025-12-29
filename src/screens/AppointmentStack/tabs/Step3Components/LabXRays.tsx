import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalTextStyles } from '../../../../styles/globalStyles';
// import {
//   pick as pickDocuments,
//   types as documentTypes,
//   isErrorWithCode,
//   errorCodes,
//   type DocumentPickerResponse,
// } from '@react-native-documents/picker';
import { MediaBaseURL } from '../../../../shared/utils/constants';
import { useSelector } from 'react-redux';
import CustomBottomSheet from '../../../../components/common/CustomBottomSheet';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';
import Dropdown from '../../../../components/common/Dropdown';

interface LabFile {
  id: string;
  category: string;
  fileName?: string;
}

interface LabXRaysProps {
  data?: any;
  onAddFile?: () => void;
  onDownloadFile?: (file: LabFile) => void;
  onDeleteFile?: (file: LabFile) => void;
  onDataChange?: (files: LabFile[]) => void;
  visitmainId?: number | string;
  onSaveSuccess?: () => void;
}

const LabXRays: React.FC<LabXRaysProps> = ({
  data,
  onAddFile,
  onDownloadFile,
  onDeleteFile,
  onDataChange,
  visitmainId,
  onSaveSuccess,
}) => {
  const [files, setFiles] = useState<any>(data || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const { user } = useSelector((state: any) => state.root.user);
  const { mediaToken } = useSelector((state: any) => state.root.user);
  const [isFileTypesBottomSheetVisible, setIsFileTypesBottomSheetVisible] = useState(false);
  const [fileTypes, setFileTypes] = useState<any>([]);
  const [selectedFileCategory, setSelectedFileCategory] = useState<number | string>('');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  useEffect(() => {
    if (data) {
      setFiles(data);
    } else {
      setFiles([]);
    }
  }, [data]);

  useEffect(() => {
    getAllFileTypes();
  }, []);

  useEffect(() => {
    if (fileTypes.length > 0 && !selectedFileCategory) {
      setSelectedFileCategory(fileTypes[0].value);
    }
  }, [fileTypes]);

  const getAllFileTypes = async () => {
    try {
      const response = await addVisitRecordService.getAllFileTypes();
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        const fileTypesList = response?.list?.map((item: any) => ({
          label: item.TitlePlang,
          value: item.Id,
        }));
        setFileTypes(fileTypesList);
      }
    }
    catch (error: any) {
    }
  };

  const inferCategory = (fileName: string, mime?: string | null) => {
    const normalizedMime = mime?.toLowerCase() ?? '';
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

    if (normalizedMime.includes('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'].includes(extension)) {
      return 'Imaging';
    }

    if (normalizedMime.includes('pdf') || extension === 'pdf') {
      return 'Lab Reports';
    }

    return 'Lab Reports';
  };

  const handleAddFilePress = () => {
    setIsFileTypesBottomSheetVisible(true);
    // Reset selections when opening
    if (fileTypes.length > 0 && !selectedFileCategory) {
      setSelectedFileCategory(fileTypes[0].value);
    }
    setSelectedFile(null);
  };

  const handleChooseFile = async () => {
    // try {
    //   const pickResult = await pickDocuments({
    //     type: [documentTypes.allFiles],
    //     allowMultiSelection: false,
    //   });

    //   if (!pickResult || pickResult.length === 0) {
    //     return;
    //   }

    //   const selected: DocumentPickerResponse = pickResult[0];

    //   if (!selected) {
    //     return;
    //   }

    //   setSelectedFile(selected);
    // } catch (err) {
    //   if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
    //     return;
    //   }

    //   if (err instanceof Error) {
    //     Alert.alert(
    //       'Error',
    //       `Failed to select file: ${err.message}. Please try again.`,
    //     );
    //   } else {
    //     Alert.alert('Error', 'Failed to select file. Please try again.');
    //   }
    // }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) {
      Alert.alert('File Required', 'Please choose a file');
      return;
    }

    const file = {
      uri: selectedFile.uri,
      type: selectedFile.type ?? 'application/octet-stream',
      name: selectedFile.name ?? 'attachment',
      size: selectedFile.size,
    };

    await uploadFile(file,);
    setIsFileTypesBottomSheetVisible(false);
    setSelectedFile(null);
   
  };

  const handleCloseBottomSheet = () => {
    setIsFileTypesBottomSheetVisible(false);
    setSelectedFile(null);
    if (fileTypes.length > 0) {
      setSelectedFileCategory(fileTypes[0].value);
    }
  };

  const uploadFile = async (file: {
    uri: string;
    type: string;
    name: string;
    size?: number | null;
  }) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      let url = `${MediaBaseURL}/common/upload`;
      let ResourceCategoryId = '2';

      let fileType = file.name.split('.').pop();
      if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
      else if (
        fileType == 'jpg' ||
        fileType == 'jpeg' ||
        fileType == 'gif' ||
        fileType == 'png' ||
        fileType == 'JPG' ||
        fileType == 'JPEG' ||
        fileType == 'GIF' ||
        fileType == 'PNG'
      )
        ResourceCategoryId = '1';

      const formData = new FormData();
      // Create file object that matches backend expectations
      const fileData = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', fileData);
      formData.append('UserType', user.CatUserTypeId);
      formData.append('Id', user.Id);
      formData.append('ResourceCategory', ResourceCategoryId);
      formData.append('ResourceType', '6');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      if (responseData.ResponseStatus?.STATUSCODE === '200') {
        // Save file to visit record if visitmainId is available
        if (visitmainId) {
          try {
            const savePayload = {
              VisitMainId: visitmainId,
              FilePath: responseData.Data.Path,
              CatPatientUploadFileTypeId: selectedFileCategory,
            };
            const saveResponse = await addVisitRecordService.addEditVisitPatientLabXRay(savePayload);
            if (saveResponse?.ResponseStatus?.STATUSCODE == 200 || saveResponse?.StatusCode?.STATUSCODE == 12010) {
              onSaveSuccess?.();
            }
          } catch (saveError) {
            
          }
        }
      } else {
        throw new Error(
          responseData.ResponseStatus?.MESSAGE || 'Upload failed',
        );
      }
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Failed to upload file. Please try again.',
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadPress = (file: LabFile) => {
    if (onDownloadFile) {
      onDownloadFile(file);
    }
  };

  const handleDeletePress = async (file: any) => {
    try {
      const response = await addVisitRecordService.deleteVisitPatientLabXRay({
        LabXrayFileid: file.Id,
      });
      if (response?.ResponseStatus?.STATUSCODE == 200 || response?.StatusCode?.STATUSCODE == 12017) {
        onSaveSuccess?.();
      }
    }
    catch (error: any) {
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Lab & X-Rays Files</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFilePress}>
          <Icon name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add File</Text>
        </TouchableOpacity>
      </View>

      {files.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No record found.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.fileListContainer}
        >
          {files.map((file: any, index: number) => (
            <View key={file.id} style={styles.fileCard}>
              <View style={styles.fileInfoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="document-text-outline" size={20} color="#179c8e" />
                </View>
                <View style={styles.fileTextContainer}>
                  <Text style={styles.fileLabel}>File Category</Text>
                  <Text style={styles.fileCategory}>
                    {file?.FileTypeTitlePlang || 'Lab Reports'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownloadPress(file)}
                >
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePress(file)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}


<CustomBottomSheet
        visible={isFileTypesBottomSheetVisible}
        onClose={handleCloseBottomSheet}
        showHandle={false}
        backdropClickable={false}
        maxHeight={400}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.addFileBottomSheetContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.addFileBottomSheetHeader}>
            <Text style={styles.addFileBottomSheetTitle}>Add File</Text>
            <TouchableOpacity onPress={handleCloseBottomSheet}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.addFileBottomSheetContent}>
            {/* File Category Section */}
            <View style={styles.fileCategorySection}>
              <Text style={styles.fileCategoryLabel}>File Category</Text>
              <Dropdown
                data={fileTypes}
                value={selectedFileCategory}
                onChange={(value) => setSelectedFileCategory(value)}
                placeholder="Select file category"
                containerStyle={styles.dropdownContainer}
                dropdownStyle={styles.dropdownButton}
                labelStyle={styles.dropdownLabel}
              />
            </View>

            {/* Upload File Section */}
            <View style={styles.uploadFileSection}>
              <Text style={styles.uploadFileLabel}>Upload File</Text>
              <View style={styles.chooseFileContainer}>
                <TouchableOpacity
                  style={styles.chooseFileButton}
                  onPress={handleChooseFile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chooseFileButtonText}>Choose file</Text>
                </TouchableOpacity>
                <Text style={styles.selectedFileName}>
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveFileButton}
              onPress={handleSaveFile}
              activeOpacity={0.8}
              disabled={isUploading}
            >
              <Text style={styles.saveFileButtonText}>
                {isUploading ? 'Uploading...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </CustomBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f3',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    ...globalTextStyles.bodyLarge,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#179c8e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    ...globalTextStyles.bodyMedium,
    color: '#6f7a7a',
  },
  fileListContainer: {
    paddingBottom: 16,
    gap: 16,
  },
  fileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e1f4f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileTextContainer: {
    flex: 1,
  },
  fileLabel: {
    ...globalTextStyles.bodySmall,
    color: '#6f7a7a',
    marginBottom: 4,
  },
  fileCategory: {
    ...globalTextStyles.bodyMedium,
    color: '#179c8e',
    fontWeight: '600',
  },
  fileName: {
    ...globalTextStyles.bodySmall,
    color: '#555',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    alignItems: 'center',
  },
  downloadButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#179c8e',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4f4f',
    alignItems: 'center',
  },
  deleteButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#ff4f4f',
    fontWeight: '600',
  },
  addFileBottomSheetContainer: {
    flex: 1,
  },
  addFileBottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addFileBottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  addFileBottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  fileCategorySection: {
    marginBottom: 24,
  },
  fileCategoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdownButton: {
    height: 50,
    borderRadius: 8,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#333',
  },
  uploadFileSection: {
    marginBottom: 32,
  },
  uploadFileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  chooseFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chooseFileButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chooseFileButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  saveFileButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveFileButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default LabXRays;

