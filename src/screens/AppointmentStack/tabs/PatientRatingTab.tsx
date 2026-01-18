import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { appointmentService } from '../../../services/api/appointmentService';
import { MediaBaseURL } from '../../../shared/utils/constants';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import Voice from '@dev-amirzubair/react-native-voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface PatientRatingTabProps {
    data: any;
}

const PatientRatingTab: React.FC<PatientRatingTabProps> = ({ data }) => {
    const [userRating, setUserRating] = useState<any>(null);
    const [commentList, setCommentList] = useState<any[]>([]);
    const user = useSelector((state: any) => state.root.user.user);
    const isFocused = useIsFocused();
    const [isAddEditBottomSheetVisible, setIsAddEditBottomSheetVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [editingComment, setEditingComment] = useState<any>(null);
    const [starRatingError, setStarRatingError] = useState(false);
    const [ratingBottomSheetHeight, setRatingBottomSheetHeight] = useState( Platform.OS === 'ios' ? 350 : 320);
    useEffect(() => {
        if (data?.PatientUserProfileInfoId) {
            getUserRatingForPatient();
        }
    }, [data, isFocused]);

    useEffect(() => {
        // Only attach keyboard listeners on iOS to avoid any mismatch with RCTKeyboardObserver
        if (Platform.OS !== 'ios') {
            return;
        }

        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setRatingBottomSheetHeight(340 + e.endCoordinates.height);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setRatingBottomSheetHeight(350);
        });

        return () => {
            // Clean up only the listeners we registered
            showSub?.remove?.();
            hideSub?.remove?.();
        };
    }, []);

    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechResults = (e) => {
            const newText = e.value?.[0] ?? '';
            if (Platform.OS === 'android') {
                // Merge text for Android - append new speech result to existing text
                setCommentText(prevText => {
                    const trimmedPrev = prevText.trim();
                    const trimmedNew = newText.trim();
                    if (trimmedPrev && trimmedNew) {
                        return `${trimmedPrev} ${trimmedNew}`;
                    }
                    return trimmedPrev || trimmedNew;
                });
            } else {
                // iOS behavior - replace text (working fine as is)
                setCommentText(newText);
            }
        };
        Voice.onSpeechError = (e) => setIsListening(false);

        return () => {
            setIsListening(false)
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const startListening = async () => {
        try {
            await Voice.start('en-US');
        } catch (e) {
        }
    };

    const stopListening = async () => {
        try {
            await Voice.stop();
        } catch (e) {
        }
    };

    const getUserRatingForPatient = async () => {
        const payload = {
            PatientProfileId: data?.PatientUserProfileInfoId,
        };
        const response = await appointmentService.getUserRatingForPatient(payload);

        if (response?.ResponseStatus?.STATUSCODE === 200) {
            setUserRating(response.UserRating?.[0] || null);
            setCommentList(response.CommentList || []);
        }
    };

    const handleEditRating = (item: any) => {
        setEditingComment(item);
        setSelectedRating(item.RateValue);
        setCommentText(item.Comment || '');
        setIsAddEditBottomSheetVisible(true);
    }

    const handleSaveComment = async () => {
        if (selectedRating === 0) {
            setStarRatingError(true);
            return;
        }

        const payload = {
            "UserloginInfoId": user?.Id,
            "Comment": commentText,
            "OrderId": data?.OrderID,
            "RelationOrderAndOrganizationCategoryId": data?.RelationOrderAndOrganizationCategoryId,
            "TaskMainId": data?.Detail[0]?.TaskMainId,
            "VisitMainId": null,
            "Rating": [{
                "TargetId": data?.PatientUserProfileInfoId,
                "CatRatingTypeId": 4,
                "RatingValue": selectedRating.toString()
            }]
        }

        const response = await appointmentService.addEditUserRating(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            getUserRatingForPatient();
            setIsAddEditBottomSheetVisible(false);
            setSelectedRating(0);
            setCommentText('');
            setEditingComment(null);
        }
    }

    const handleCloseBottomSheet = () => {
        setIsAddEditBottomSheetVisible(false);
        setSelectedRating(0);
        setCommentText('');
        setEditingComment(null);
    }

    const renderStarSelector = () => {
        return (
            <View style={styles.starSelectorContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => {
                            setSelectedRating(star);
                            setStarRatingError(false);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={star <= selectedRating ? 'star' : 'star-outline'}
                            size={36}
                            color={star <= selectedRating ? '#fbbf24' : '#d1d5db'}
                        />
                    </TouchableOpacity>
                ))}
                
            </View>
        );
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Ionicons key={`full-${i}`} name="star" size={16} color="#fbbf24" />);
        }
        if (hasHalfStar) {
            stars.push(<Ionicons key="half" name="star-half" size={16} color="#fbbf24" />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#fbbf24" />);
        }
        return stars;
    };

    const handleDeleteRating = async (item: any) => {
        const payload = {
            UserRatingId: item.Id,
        }
        const response = await appointmentService.deleteUserRating(payload);
        if (response?.ResponseStatus?.STATUSCODE === 200) {
            getUserRatingForPatient();
        }
    }

    const isAddButtonDisabled = useMemo(() => {
        const isDisabled = commentList.find((item: any) => (item.RatedById == user?.Id && item.TaskMainId == data?.Detail[0]?.TaskMainId));
        return isDisabled ? true : false;
    }, [commentList, user?.Id]);

    const renderCommentCard = ({ item }: { item: any }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{item.FullnamePlang}</Text>
                    <Text style={styles.hospitalName}>{item.OrganizationTitlePlang}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.ratingText}>{item.RateValue}/5</Text>
                </View>
            </View>

            {item.Comment && item.Comment.trim() !== '' && (
                <Text style={styles.commentText}>{item.Comment}</Text>
            )}

            {(user?.Id == item.RatedById && item.TaskMainId == data?.Detail[0]?.TaskMainId) && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 }}>

                <TouchableOpacity style={styles.editButton} onPress={() => handleEditRating(item)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRating(item)}>

                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>}

            <View style={styles.commentFooter}>
                <Text style={styles.dateText}>
                    {moment.utc(item.DateAdded).local().format('DD/MM/YYYY')}
                </Text>
            </View>
        </View>
    );

    const renderHeader = () => (
        <>
            {/* Patient Info Section */}
            <View style={styles.patientInfoSection}>
                <View style={styles.patientNameContainer}>
                    <Text style={styles.patientLabel}>Patient Name</Text>
                    <Text style={styles.patientName}>{data.PatientPlang || userRating?.FullnamePlang}</Text>
                </View>
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={18} color="#fbbf24" />
                        <Text style={styles.averageRating}>
                            {userRating?.AccumulativeRatingAvg?.toFixed(1) || '0.0'}
                        </Text>
                    </View>
                    <Text style={styles.ratingCount}>
                        ({userRating?.AccumulativeRatingNum || 0} Ratings)
                    </Text>
                </View>
            </View>

            {/* Comments Header */}
            <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                    Comments ({commentList.length})
                </Text>
            </View>
        </>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No comments yet</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            <FlatList
                data={commentList}
                renderItem={renderCommentCard}
                keyExtractor={(item) => item.Id.toString()}
                // ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Comment Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity disabled={isAddButtonDisabled} style={[styles.addButton, isAddButtonDisabled && { opacity: 0.5 }]} onPress={() => setIsAddEditBottomSheetVisible(true)}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Comment</Text>
                </TouchableOpacity>
            </View>

            <CustomBottomSheet
                visible={isAddEditBottomSheetVisible}
                onClose={handleCloseBottomSheet}
                showHandle={false}
                maxHeight={ratingBottomSheetHeight}
                backdropClickable={false}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.bottomSheetContainer}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>
                            {editingComment ? 'Edit Comment' : 'Add Comment'}
                        </Text>
                        <TouchableOpacity onPress={handleCloseBottomSheet}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.bottomSheetContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Star Rating Selector */}
                        {renderStarSelector()}
                        {starRatingError && <Text style={styles.starRatingErrorText}>Rating is required</Text>}
                        {/* Comment Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Add your comment here..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={commentText}
                                onChangeText={setCommentText}
                                textAlignVertical="top"
                            />
                            {!isListening ? <TouchableOpacity style={styles.micButton} onPress={startListening} >
                                <Ionicons name="mic" size={20} color="#666" />
                            </TouchableOpacity> :
                                <TouchableOpacity style={styles.micButton} onPress={stopListening} >
                                    <FontAwesome name="square" size={18} color="red" />
                                </TouchableOpacity>}
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveComment}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4f1ef',
    },
    listContent: {
        flexGrow: 1,
    },
    patientInfoSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    patientNameContainer: {
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
        paddingRight: 16,
        marginRight: 16,
    },
    patientLabel: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
        marginBottom: 4,
    },
    patientName: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        textAlign: 'left',
    },
    ratingContainer: {
        alignItems: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    averageRating: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
    },
    ratingCount: {
        fontSize: 10,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    commentsHeader: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    commentsTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
    },
    commentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginBottom: 4,
    },
    hospitalName: {
        fontSize: 13,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
    },
    commentText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.regular,
        color: '#333',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        marginBottom: 12,
    },
    commentFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
        alignItems: 'flex-end',
    },
    dateText: {
        fontSize: 13,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
    addButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#e4f1ef',
    },
    addButton: {
        backgroundColor: '#23a2a4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    editButton: {
        height: 40,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#23a2a4',
    },
    deleteButton: {
        height: 40,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dc3545',
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc3545',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    bottomSheetContainer: {
        flex: 1,
    },
    bottomSheetHeader: {
        height: 56,
        backgroundColor: '#e4f1ef',
        paddingHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomSheetTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
    },
    bottomSheetContent: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    starSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingTop: 24,
        paddingBottom: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingRight: 40,
        padding: 12,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
        maxHeight: 150,
    },
    saveButton: {
        backgroundColor: '#14b8a6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    micButton: {
        position: 'absolute',
        right: 8,
        top: '38%',
        backgroundColor: '#e4f1ef',
        padding: 5,
        borderRadius: 20,
    },
    micButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#fff',
    },
    starRatingErrorText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#dc3545',
        textAlign: 'center',
    },
});

export default PatientRatingTab;

