import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Linking, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../styles/globalStyles';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import { appointmentService } from '../../../services/api/appointmentService';
import { useSelector } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AppointmentTrackingMap from '../../../components/AppointmentTrackingMap';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';
import { ROUTES } from '../../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';

interface TaskDetailTabProps {
    data: any;
}

const TaskDetailTab: React.FC<TaskDetailTabProps> = ({ data }) => {
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('Accepted');
    const [incompleteReason, setIncompleteReason] = useState<string>('');
    const [openGoogleMapBottomSheet, setOpenGoogleMapBottomSheet] = useState(false);
    const [routeInfo, setRouteInfo] = useState<any>(null);
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';

        // Handle UTC time string (e.g., "1970-01-01T14:40:00.000Z")
        if (timeString.includes('T') && timeString.includes('Z')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        // Handle simple time string (e.g., "14:40")
        // Parse it as UTC and convert to local
        const today = new Date().toISOString().split('T')[0];
        const utcDateTime = new Date(`${today}T${timeString}:00.000Z`);
        return utcDateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    console.log("data==>", data);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        if (status !== 'Incomplete') {
            setIncompleteReason('');
        }
    };

    const updateOrderStatus = async () => {
        const payload = {
            CatOrderStatusId: data.TaskId,
            OrderDetailIds: data.CatOrderStatusId,
            OrderStatusNote: selectedStatus === 'Incomplete' ? incompleteReason : "",
            UpdatebyRoleId: user?.Id,
            UpdatebyUserloginInfoId: user?.Id,
        };
        const response = await appointmentService.updateOrderStatus(payload);
        if (response?.StatusCode?.STATUSCODE === 3028) {
            setIsBottomSheetVisible(false);
            setIncompleteReason('');
        }
    }

    const getStatusInfo = () => {
        const statusId = data?.CatOrderStatusId?.toString();

        switch (statusId) {
            case '1':
            case '17':
                return {
                    backgroundColor: '#e6f8eb',
                    borderColor: '#54b196',
                    textColor: '#008b62',
                    text: 'Accepted'
                };
            case '7':
                return {
                    backgroundColor: '#fef2e6',
                    borderColor: '#faa754',
                    textColor: '#f87b00',
                    text: 'On the way'
                };
            case '8':
                return {
                    backgroundColor: '#fef2e6',
                    borderColor: '#faa754',
                    textColor: '#f87b00',
                    text: 'In Progress'
                };
            case '19':
            case '10':
                return {
                    backgroundColor: '#e9f5f6',
                    borderColor: '#6cbebf',
                    textColor: '#239ea0',
                    text: 'Completed'
                };
            case '9':
            case '4':
                return {
                    backgroundColor: '#fde8e8',
                    borderColor: '#ef6666',
                    textColor: '#ec4949',
                    text: 'Cancelled'
                };
            case '23':
                return {
                    backgroundColor: '#fde8e8',
                    borderColor: '#ef6666',
                    textColor: '#ec4949',
                    text: 'Incomplete'
                };
            case '24':
                return {
                    backgroundColor: '#fde8e8',
                    borderColor: '#ef6666',
                    textColor: '#ec4949',
                    text: 'Missed'
                };
            default:
                return {
                    backgroundColor: '#e6f8eb',
                    borderColor: '#54b196',
                    textColor: '#008b62',
                    text: 'New'
                };
        }
    };

    const callPatient = () => {
        Linking.openURL(`tel:${data.CellNumber}`);
    }

    const getTimeFormat = (timeString: string) => {
        if (!timeString) return '';

        // Handle UTC time string
        if (timeString.includes('T') && timeString.includes('Z')) {
            const date = new Date(timeString);
            const hours = date.getHours();
            return hours >= 12 ? 'PM' : 'AM';
        }

        // Handle simple time string
        const today = new Date().toISOString().split('T')[0];
        const utcDateTime = new Date(`${today}T${timeString}:00.000Z`);
        const hours = utcDateTime.getHours();
        return hours >= 12 ? 'PM' : 'AM';
    };

    const getOrderStatusColor = (statusId: string) => {
        // You can customize this based on different status IDs
        switch (statusId) {
            case '24':
                return '#ef4444'; // Red for Missed
            case '23':
                return '#22c55e'; // Green for Completed
            default:
                return '#f59e0b'; // Orange for others
        }
    };

    const getOrderStatusText = (statusId: string) => {
        // Customize based on your status IDs
        switch (statusId) {
            case '24':
                return 'Missed';
            case '23':
                return 'Completed';
            default:
                return 'Pending';
        }
    };

    const renderStarRating = (rating: number) => {
        return (
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>
                    {rating.toFixed(1)} <Text style={styles.ratingCount}>({data.AccumulativeRatingNum} Ratings)</Text>
                </Text>
            </View>
        );
    };

    const checkTimeCondition = (appointment: any) => {
        const now = moment();
        const appointmentDate = moment.utc(appointment?.SchedulingDate).local();
        const startTime = moment.utc(appointment?.SchedulingTime, 'HH:mm').local();
        const endTime = moment.utc(appointment?.SchedulingEndTime, 'HH:mm').local();

        startTime.set({
            year: appointmentDate.year(),
            month: appointmentDate.month(),
            date: appointmentDate.date()
        });
        endTime.set({
            year: appointmentDate.year(),
            month: appointmentDate.month(),
            date: appointmentDate.date()
        });

        return now.isSameOrAfter(startTime) &&
            now.isBefore(endTime) &&
            now.isSame(appointmentDate, 'day');
    }

    const handleJoinMeeting = (appointment: any) => {
        // Parse the date and time separately
        const date = moment.utc(appointment.SchedulingDate);
        const [startHours, startMinutes] = appointment.SchedulingTime.split(':');
        const [endHours, endMinutes] = appointment.SchedulingEndTime.split(':');
    
        // Create UTC moments with the correct time
        let startTimeUTC = moment.utc(date).set({
          hours: parseInt(startHours),
          minutes: parseInt(startMinutes)
        });
    
        let endDateTimeUTC = moment.utc(date).set({
          hours: parseInt(endHours),
          minutes: parseInt(endMinutes)
        });
    
        // Convert to local time
        let startTimeLocal = startTimeUTC.local();
        let endTimeLocal = endDateTimeUTC.local();
    
        let meetingInfo = {
          toUserId: appointment.PatientUserProfileInfoId,
          sessionStartTime: startTimeLocal.toISOString(),
          bookingId: appointment.Detail[0].TaskMainId,
          patientProfileId: appointment.PatientUserProfileInfoId,
          meetingId: appointment.VideoSDKMeetingID,
          Name: appointment.PatientPlang,
          displayName: user?.OrgTitlePlang,
          sessionEndTime: endTimeLocal.toISOString(),
          patientId: appointment.PatientUserProfileInfoId,
          serviceProviderId: appointment.UserloginInfoId
        };
    
        navigation.navigate(ROUTES.preViewCall, { Data: meetingInfo });
      }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* Order Details Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Order Status</Text>
                        {(() => {
                            const statusInfo = getStatusInfo();
                            return (
                                <View style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor: statusInfo.backgroundColor,
                                        borderLeftWidth: 4,
                                        borderLeftColor: statusInfo.borderColor
                                    }
                                ]}>
                                    <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                                        {statusInfo.text}
                                    </Text>
                                </View>
                            );
                        })()}
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Order Date</Text>
                        <Text style={styles.value}>
                            {data.CreatedDate ? formatDate(data.CreatedDate) : formatDate(data.SchedulingDate)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Order No.</Text>
                        <Text style={styles.value}>{data.OrderID}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Applicant</Text>
                        <Text style={styles.value}>{data.LoginUserFullnamePlang?.trim()}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Phone No.</Text>
                        <Text style={styles.value}>{data.LoginUserCellNumber}</Text>
                    </View>
                </View>

                {/* Selected Services Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Selected Services ({data.Detail?.length || 0})</Text>
                    </View>

                    {data.Detail && data.Detail.map((service: any, index: number) => (
                        <View key={index} style={styles.serviceItem}>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>
                                    {service.CatServiceServeTypeId == 1 ? `Remote Consultation / ${service.TitlePlang}` : `${service.TitlePlang}`}
                                </Text>
                                <Text style={styles.serviceSubtitle}>
                                    {service.SpecialtyPlang ? `(${service.SpecialtyPlang})` : ''}
                                </Text>
                            </View>
                            <View style={styles.quantityBadge}>
                                <Text style={styles.quantityText}>{service.Quantity}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Session Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{data.Detail[0].CatServiceServeTypeId == 1 ? 'Session Information' : 'Visiting Information'}</Text>
                    </View>

                    <View style={styles.sessionRow}>
                        <Ionicons name="calendar-outline" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>{data.Detail[0].CatServiceServeTypeId == 1 ? 'Online Session Date' : 'Appointment Date'}</Text>
                        <Text style={styles.sessionValue}>{formatDate(data.SchedulingDate)}</Text>
                    </View>

                    <View style={styles.sessionRow}>
                        <Ionicons name="time-outline" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>{data.Detail[0].CatServiceServeTypeId == 1 ? 'Online Session Time' : 'Appointment Time'}</Text>
                        <Text style={styles.sessionValue}>
                            {data.SchedulingTime ? formatTime(data.SchedulingTime) : formatTime(data.VisitTime)}
                        </Text>
                    </View>

                    {data.Detail[0].CatServiceServeTypeId == 1 ? <View style={styles.sessionRow}>
                        <MaterialIcons name="timer" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>Session Duration</Text>
                        <Text style={styles.sessionValue}>
                            {data.Detail?.[0]?.NumberofVisits ? `${data.Detail[0].NumberofVisits * 10} Minutes` : '10 Minutes'}
                        </Text>
                    </View> :
                        <>
                            <View style={styles.sessionRow}>
                                <Ionicons name="location-outline" size={20} color="#0d9488" />
                                <Text style={{ fontSize: 14, color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold, lineHeight: 20, textAlign: 'left', flex: 1, marginLeft: 10 }}>{data.Address}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(true)} style={{ borderWidth: 1, borderColor: '#23a2a4', flexDirection: 'row', borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                <Image source={require('../../../assets/images/googleMap.png')} style={styles.socialIcon} />
                                <Text style={{ color: '#23a2a4', fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.medium, lineHeight: 20 }}>Show directions on Google Maps</Text>
                            </TouchableOpacity>
                        </>}
                </View>

                {/* Patient Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Patient Information</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{data.PatientPlang.trim()}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Phone No.</Text>
                        <Text style={styles.value}>{data.CellNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Patient Rating</Text>
                        <View>{renderStarRating(data.AccumulativeRatingAvg)}</View>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Gender</Text>
                        <Text style={styles.value}>{data.Gender ? 'Male' : 'Female'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Age</Text>
                        <Text style={styles.value}>{data.Age}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>ID Number</Text>
                        <Text style={styles.value}>{data.IDNumber ? data.IDNumber : 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Relative Relation</Text>
                        <Text style={styles.value}>{data.CatRelationshipId ? data.RelationShipPlang : 'Self'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Nationality</Text>
                        <Text style={styles.value}>{data.CatNationalityId == 213 ? 'Citizen' : 'Resident'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Insurance Company</Text>
                        <Text style={styles.value}>{data.InsuranceCompanyPlang || 'N/A'}</Text>
                    </View>

                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#000', marginTop: 10, marginBottom: 5 }}>Chief Complaint</Text>
                    <View style={{ padding: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: 14, color: '#000', fontFamily: CAIRO_FONT_FAMILY.medium, lineHeight: 20 }}>{'N/A'}</Text>
                    </View>
                </View>


            </ScrollView>
            {data.Detail[0]?.CatServiceServeTypeId == 1 ?
                <TouchableOpacity
                    onPress={() => handleJoinMeeting(data)}
                    disabled={!checkTimeCondition(data)}
                    style={[{ marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  padding: 10, borderRadius: 8 },{backgroundColor: checkTimeCondition(data) ? '#23a2a4' : '#0f0f0f', opacity: checkTimeCondition(data) ? 1 : 0.5}]}
                >
                    <Image source={require('../../../assets/icons/cameramovie.png')} style={{ tintColor: checkTimeCondition(data) ? '#fff' : '#6c757d', width: 20, height: 20 }} />
                    <Text style={{ color: checkTimeCondition(data) ? '#fff' : '#6c757d', fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, marginLeft: 5 }}>Start Video Call</Text>
                </TouchableOpacity> :
                <TouchableOpacity
                    onPress={() => setIsBottomSheetVisible(true)}
                    style={{ marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#23a2a4', padding: 10, borderRadius: 8 }}
                >
                    <Ionicons name="settings-sharp" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.semiBold, lineHeight: Platform.OS === 'ios' ? 0 : 20, marginLeft: 5 }}>Order Status Settings</Text>
                </TouchableOpacity>
            }

            <CustomBottomSheet
                visible={isBottomSheetVisible}
                onClose={() => setIsBottomSheetVisible(false)}
                showHandle={false}
                maxHeight={'60%'}
            >
                <View style={styles.bottomSheetContainer}>
                    {/* Header */}
                    <View style={styles.bottomSheetHeader}>
                        <View style={styles.headerSpacer} />
                        <Text style={styles.bottomSheetTitle}>Order Status Settings</Text>
                        <TouchableOpacity
                            onPress={() => setIsBottomSheetVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Status Options - Scrollable */}
                    <ScrollView
                        style={styles.statusOptionsScrollView}
                        contentContainerStyle={styles.statusOptionsContainer}
                        showsVerticalScrollIndicator={true}
                    >
                        {/* Accepted */}
                        <TouchableOpacity
                            onPress={() => handleStatusChange('Accepted')}
                            style={[
                                styles.statusOption,
                                selectedStatus === 'Accepted' && styles.statusOptionSelected
                            ]}
                        >
                            <Text style={[
                                styles.statusOptionText,
                                selectedStatus === 'Accepted' && styles.statusOptionTextSelected
                            ]}>
                                Accepted
                            </Text>
                        </TouchableOpacity>

                        {/* On The Way To The Patient */}
                        <TouchableOpacity
                            onPress={() => handleStatusChange('On The Way To The Patient')}
                            style={[
                                styles.statusOption,
                                selectedStatus === 'On The Way To The Patient' && styles.statusOptionSelected
                            ]}
                        >
                            <Text style={[
                                styles.statusOptionText,
                                selectedStatus === 'On The Way To The Patient' && styles.statusOptionTextSelected
                            ]}>
                                On The Way To The Patient
                            </Text>
                        </TouchableOpacity>

                        {/* In Progress */}
                        <TouchableOpacity
                            onPress={() => handleStatusChange('In Progress')}
                            style={[
                                styles.statusOption,
                                selectedStatus === 'In Progress' && styles.statusOptionSelected
                            ]}
                        >
                            <Text style={[
                                styles.statusOptionText,
                                selectedStatus === 'In Progress' && styles.statusOptionTextSelected
                            ]}>
                                In Progress
                            </Text>
                            <Text style={styles.statusSubtext}>Continuing Number Of Sessions</Text>
                        </TouchableOpacity>

                        {/* Complete */}
                        <TouchableOpacity
                            onPress={() => handleStatusChange('Complete')}
                            style={[
                                styles.statusOption,
                                selectedStatus === 'Complete' && styles.statusOptionSelected
                            ]}
                        >
                            <Text style={[
                                styles.statusOptionText,
                                selectedStatus === 'Complete' && styles.statusOptionTextSelected
                            ]}>
                                Complete
                            </Text>
                        </TouchableOpacity>

                        {/* Incomplete */}
                        <TouchableOpacity
                            onPress={() => handleStatusChange('Incomplete')}
                            style={[
                                styles.statusOption,
                                selectedStatus === 'Incomplete' && styles.statusOptionSelected
                            ]}
                        >
                            <Text style={[
                                styles.statusOptionText,
                                selectedStatus === 'Incomplete' && styles.statusOptionTextSelected
                            ]}>
                                Incomplete
                            </Text>
                        </TouchableOpacity>
                        {/* Reason Field - Only shown when Incomplete is selected */}
                        {selectedStatus === 'Incomplete' && (
                            <View style={styles.reasonContainer}>
                                <Text style={styles.reasonLabel}>Reason</Text>
                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder="Enter reason for incomplete status"
                                    placeholderTextColor="#999"
                                    value={incompleteReason}
                                    onChangeText={setIncompleteReason}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        )}
                    </ScrollView>



                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={updateOrderStatus}
                        style={styles.saveButton}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </CustomBottomSheet>

            <CustomBottomSheet
                visible={openGoogleMapBottomSheet}
                onClose={() => setOpenGoogleMapBottomSheet(false)}
                maxHeight={'80%'}
                backdropClickable={false}
                showHandle={false}
            >
                <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
                        <Text style={[globalTextStyles.buttonMedium, { color: '#000' }]}>Trip Information</Text>
                        <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(false)}>
                            <AntDesign name="close" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ height: 40, width: 40, backgroundColor: '#23a2a4', borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                                    <Image source={{ uri: `${MediaBaseURL}${data?.imagePath}` }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 10 }}>
                                    <Text style={{ ...globalTextStyles.bodyLarge, color: '#000' }}>{data?.PatientPlang}</Text>
                                    {/* <Text style={{ ...globalTextStyles.bodySmall, lineHeight: 15, color: '#222' }}>{data?.OrgTitlePlang}</Text> */}
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>

                                        <Text style={{ ...globalTextStyles.bodySmall, color: '#222' }}>{data?.CellNumber.replace(/^\+/, '')}</Text>
                                        <Text style={{ ...globalTextStyles.bodySmall, color: '#222' }}>+</Text>

                                        <TouchableOpacity onPress={() => callPatient()} style={{ width: 40, height: 20, marginLeft: 10, backgroundColor: '#2ab318', borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                                            <FontAwesome6 name="phone-volume" size={12} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </View>

                    </View>
                    <View style={{ flex: 1, borderRadius: 10, padding: 10 }}>
                        {data && (
                            <AppointmentTrackingMap
                                appointment={data}
                                onRouteInfoUpdate={(info) => setRouteInfo(info)}
                            />
                        )}
                    </View>
                </View>
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 50,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionHeader: {
        backgroundColor: '#e4f1ef',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        color: '#0F0F0F',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6
    },
    detailRowColumn: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 14,
        color: '#555',
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: 20,
    },
    value: {
        fontSize: 14,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        textAlign: 'right',
        flex: 1,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    ratingCount: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        borderRadius: 8,
    },
    serviceContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    serviceTitle: {
        fontSize: 14,
        color: '#0F0F0F',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
        lineHeight: 20,
        textAlign: 'left',
    },
    serviceSubtitle: {
        fontSize: 13,
        color: '#555',
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: 20,
        textAlign: 'left',
    },
    quantityBadge: {
        backgroundColor: '#0d9488',
        borderRadius: 20,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    sessionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    sessionLabel: {
        fontSize: 14,
        color: '#555',
        fontFamily: CAIRO_FONT_FAMILY.medium,
        lineHeight: 20,
        marginLeft: 12,
        flex: 1,
    },
    sessionValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: 20,
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
    },
    statusBadge: {
        minWidth: 74,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    bottomSheetContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    headerSpacer: {
        width: 32,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        flex: 1,
        textAlign: 'left',
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusOptionsScrollView: {
        flex: 1,
        marginBottom: 16,
    },
    statusOptionsContainer: {
        gap: 12,
        paddingBottom: 8,
    },
    statusOption: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        // minHeight: 45,
        justifyContent: 'center',
    },
    statusOptionSelected: {
        backgroundColor: '#e6f8eb',
        borderColor: '#54b196',
        borderWidth: 1,
    },
    statusOptionText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        color: '#000',
    },
    statusOptionTextSelected: {
        color: '#008b62',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    statusSubtext: {
        fontSize: 12,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        color: '#999',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#fff',
    },
    reasonContainer: {
        marginBottom: 16,
    },
    reasonLabel: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#000',
        marginBottom: 8,
    },
    reasonInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.medium,
        color: '#000',
        minHeight: 100,
        textAlignVertical: 'top',
    },
});

export default TaskDetailTab;

