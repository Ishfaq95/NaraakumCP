import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { messagesAndCallService } from '../../services/api/MessagesAndCallService';
import { useDispatch, useSelector } from 'react-redux';
import { globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { MediaBaseURL } from '../../shared/utils/constants';
import { ROUTES } from '../../shared/utils/routes';
import WebSocketService from '../../components/WebSocketService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ConversationListScreen = () => {
    const { t } = useTranslation();
    const user = useSelector((state: any) => state.root.user.user);
    const [conversationList, setConversationList] = useState<any[]>([]);
    const unreadMessages = useSelector((state: any) => state.root.user.unreadMessages);
    const [refreshing, setRefreshing] = useState(false);
    const webSocketService = WebSocketService.getInstance();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    useEffect(() => {
        if (user) {
            getConversationList();
        }
    }, [isFocused, unreadMessages]);

    const getConversationList = async () => {
        try {
            const payload = {
                "CareProviderId": user.Id
            }
            const response = await messagesAndCallService.getConversationList(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                // Sort conversations by last message time in descending order (newest first)
                const sortedData = response.Data.sort((a: any, b: any) => {
                    const timeA = new Date(a.lastmessageTime || a.createdAt).getTime();
                    const timeB = new Date(b.lastmessageTime || b.createdAt).getTime();
                    return timeB - timeA; // Descending order (newest first)
                });
                setConversationList(sortedData);
            }
        } catch (error) {
        }

    }

    useEffect(() => {
        webSocketService.addGlobalMessageHandler();
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await getConversationList();
        setRefreshing(false);
    }

    const handleBack = () => {
        navigation.goBack();
    }

    const renderConversationTile = ({ item }: any) => {
        return (
            <TouchableOpacity
                style={styles.conversationTile}
                onPress={() => {
                    // Navigate to chat screen with conversation details
                    navigation.navigate(ROUTES.ChatScreenMainView, { patientId: item?.patientDetails?.userlogininfoId, serviceProviderId: item?.careproviderDetails?.userlogininfoId, displayName: item?.patientDetails?.username,item:item });
                }}
            >
                <View style={styles.avatarContainer}>
                    {item?.patientDetails?.profilePictureUrl ? <Image
                        source={{
                            uri: `${MediaBaseURL}${item?.patientDetails?.profilePictureUrl}`
                        }}
                        style={styles.avatar}
                    /> :
                        <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'gray' }]}>
                            <Ionicons name="person" size={36} color="#fff" />
                        </View>
                    }
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {item?.patientDetails?.username}
                        </Text>
                        <Text style={styles.timestamp}>
                            {moment(item.lastmessageTime).locale('en').fromNow()}
                        </Text>
                    </View>

                    <View style={styles.messageRow}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item?.lastmessage}
                        </Text>
                        {item.unseenmsgCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadCount}>
                                    {item?.unseenmsgCount > 99 ? '99+' : item?.unseenmsgCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messages</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No messages found</Text>
        </View>
    )

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {renderHeader()}
            <View style={{ flex: 1 }}>
                <FlatList
                    data={conversationList}
                    renderItem={renderConversationTile}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    refreshControl={undefined}
                    ListEmptyComponent={renderEmptyState}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerTitle: {
        color: '#000'
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    bookButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    conversationTile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        width: '100%'
    },
    userName: {
        ...globalTextStyles.bodyLarge,
        width: '70%',
        fontWeight: '600',
        color: '#000',
    },
    timestamp: {
        width: '30%',
        textAlign: 'right',
        ...globalTextStyles.bodySmall,
        color: '#666',
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        ...globalTextStyles.bodyMedium,
        color: '#666',
    },
    unreadBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    backButton: {
        padding: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#666',
    },
    emptyStateImage: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
});

export default ConversationListScreen