import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface TaskDetailTabProps {
    data: any;
}

const TaskDetailTab: React.FC<TaskDetailTabProps> = ({ data }) => {
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
                        <Text style={[styles.statusValue, { color: getOrderStatusColor(data.CatOrderStatusId) }]}>
                            {getOrderStatusText(data.CatOrderStatusId)}
                        </Text>
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
                        <Text style={styles.value}>{data.LoginUserFullnamePlang}</Text>
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
                                    {service.CatServiceServeTypeId == 1 ? `Remote Consultation / ${service.TitlePlang}` : `${service.TitleSlang}`}
                                </Text>
                                <Text style={styles.serviceSubtitle}>
                                    ({service.SpecialtyPlang})
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
                        <Text style={styles.sectionTitle}>Session Information</Text>
                    </View>

                    <View style={styles.sessionRow}>
                        <Ionicons name="calendar-outline" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>Online Session Date</Text>
                        <Text style={styles.sessionValue}>{formatDate(data.SchedulingDate)}</Text>
                    </View>

                    <View style={styles.sessionRow}>
                        <Ionicons name="time-outline" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>Online Session Time</Text>
                        <Text style={styles.sessionValue}>
                            {data.SchedulingTime ? formatTime(data.SchedulingTime) : formatTime(data.VisitTime)}
                        </Text>
                    </View>

                    <View style={styles.sessionRow}>
                        <MaterialIcons name="timer" size={20} color="#0d9488" />
                        <Text style={styles.sessionLabel}>Session Duration</Text>
                        <Text style={styles.sessionValue}>
                            {data.Detail?.[0]?.NumberofVisits ? `${data.Detail[0].NumberofVisits * 10} Minutes` : '10 Minutes'}
                        </Text>
                    </View>
                </View>

                {/* Patient Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Patient Information</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{data.PatientPlang}</Text>
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
                        <Text style={styles.value}>{data.IDNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Relative Relation</Text>
                        <Text style={styles.value}>{data.RelationShipPlang || data.isSelf ? 'Self' : 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Nationality</Text>
                        <Text style={styles.value}>{data.CatNationalityId ? 'Citizen' : 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Insurance Company</Text>
                        <Text style={styles.value}>{data.InsuranceCompanyPlang || 'NA'}</Text>
                    </View>

                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#000', marginTop: 10, marginBottom: 5 }}>Chief Complaint</Text>
                    <View style={{}}>
                        <Text>{data.TextDescription || 'NA'}</Text>
                    </View>
                </View>


            </ScrollView>
            {data.Detail[0]?.CatServiceServeTypeId == 1 ? <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8 }}>
                <TouchableOpacity style={{ backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Start Video Call</Text>
                </TouchableOpacity>
            </View> :
                <TouchableOpacity style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Order Status Settings</Text>
                </TouchableOpacity>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionHeader: {
        backgroundColor: '#e4f1ef',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
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
        color: '#666',
        fontWeight: '400',
    },
    value: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
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
    },
    serviceTitle: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    serviceSubtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '400',
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
        color: '#666',
        fontWeight: '400',
        marginLeft: 12,
        flex: 1,
    },
    sessionValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
});

export default TaskDetailTab;

