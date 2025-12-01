import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CallIcon from '../../assets/icons/CallIcon';
import moment from 'moment';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';

interface AppointmentCardProps {
  item: any;
  onSessionDetails: (item: any) => void;
  isCallEnabled?: boolean;
  onJoinMeeting: (item: any) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  item,
  onSessionDetails,
  isCallEnabled = false,
  onJoinMeeting,
}) => {
  const calculateDuration = () => {
    if (!item?.SchedulingTime || !item?.SchedulingEndTime) {
      const fallbackMinutes = item?.Duration || 0;
      const hours = Math.floor(fallbackMinutes / 60);
      const minutes = fallbackMinutes % 60;
      return { hours, minutes };
    }

    try {
      // Parse the time strings
      const startTime = moment(item.SchedulingTime, 'HH:mm');
      let endTime = moment(item.SchedulingEndTime, 'HH:mm:ss.SS');
      
      // If endTime is invalid, try parsing without milliseconds
      if (!endTime.isValid()) {
        endTime = moment(item.SchedulingEndTime, 'HH:mm:ss');
      }
      
      // If still invalid, try with just HH:mm format
      if (!endTime.isValid()) {
        endTime = moment(item.SchedulingEndTime, 'HH:mm');
      }
      
      if (startTime.isValid() && endTime.isValid()) {
        const duration = moment.duration(endTime.diff(startTime));
        const totalMinutes = Math.round(duration.asMinutes());
        
        if (totalMinutes > 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return { hours, minutes };
        }
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
    }
    
    // Fallback to item.Duration if calculation fails
    const fallbackMinutes = item?.Duration || 0;
    const hours = Math.floor(fallbackMinutes / 60);
    const minutes = fallbackMinutes % 60;
    return { hours, minutes };
  };

  const formatDuration = (duration: { hours: number; minutes: number }) => {
    const parts: string[] = [];
    
    if (duration.hours > 0) {
      parts.push(`${duration.hours} ${duration.hours === 1 ? 'Hour' : 'Hours'}`);
    }
    
    if (duration.minutes > 0) {
      parts.push(`${duration.minutes} ${duration.minutes === 1 ? 'Minute' : 'Minutes'}`);
    }
    
    // If both are 0, show 0 Minutes
    if (parts.length === 0) {
      return '0 Minutes';
    }
    
    return parts.join(' ');
  };

  const duration = calculateDuration();
  const durationText = formatDuration(duration);

  const getStatusInfo = () => {
    const statusId = item?.CatOrderStatusId?.toString();

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

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i < item?.Rating ? 'star' : 'star-o'}
          size={14}
          color="#FFC107"
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Text style={{ fontSize: 13,fontWeight:'400', fontFamily: CAIRO_FONT_FAMILY.regular, color: '#666666' }}>Patient name</Text>
          <Text style={styles.patientName}>{item.PatientPName}</Text>
          <View style={styles.genderRatingRow}>
            <Text style={styles.gender}>{item.Gender == true ? 'Male' : 'Female'}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome
                name={'star'}
                size={14}
                color="#FFC107"
                style={{ marginRight: 2 }}
              />
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#000' }}>{item?.AccumulativeRatingAvg}</Text>
              <Text style={styles.ratingCount}>({item?.AccumulativeRatingNum} Ratings)</Text>
            </View>
          </View>
        </View>
        <View style={styles.imageContainer}>

          <Image resizeMode='contain' source={item?.TaskService[0].CatServiceServeTypeId == 1 ? require('../../assets/icons/RemoteConsultant.png') : require('../../assets/icons/HomeVisit.png')} style={styles.patientImage} />

        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.iconLabelContainer}>
            <Feather name="hash" size={16} color="#23a2a4" />
            <Text style={styles.detailLabel}>Order No.</Text>
          </View>
          <Text style={styles.detailValue}>{item?.OrderId}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconLabelContainer}>
            <Ionicons name="calendar-outline" size={16} color="#23a2a4" />
            <Text style={styles.detailLabel}>Online Session Date</Text>
          </View>
          <Text style={styles.detailValue}>{moment.utc(item?.SchedulingDate).local().format('DD/MM/YYYY')}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconLabelContainer}>
            <Ionicons name="time-outline" size={16} color="#23a2a4" />
            <Text style={styles.detailLabel}>Online Session Time</Text>
          </View>
          <Text style={styles.detailValue}>
            {item?.SchedulingTime ?
              moment.utc(item?.SchedulingTime, "HH:mm").local().format("hh:mm A") :
              item?.SessionTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconLabelContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#23a2a4" />
            <Text style={styles.detailLabel}>Status</Text>
          </View>
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
      </View>

      {item?.TaskService[0].CatServiceServeTypeId == 1 ? <View style={styles.footer}>
        <TouchableOpacity disabled={!isCallEnabled} style={[styles.durationContainer, isCallEnabled && styles.callBtnEnabled]} onPress={() => onJoinMeeting(item)}>
          <Image source={require('../../assets/icons/cameramovie.png')} style={{ tintColor: '#fff', width: 20, height: 20 }} />
          <Text style={styles.durationText}>{durationText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={() => onSessionDetails(item)}>
          <Text style={styles.detailsButtonText}>Session Details</Text>
        </TouchableOpacity>
      </View> : <View style={styles.footer}>

        <TouchableOpacity style={[styles.detailsButton, { width: '100%' }]} onPress={() => onSessionDetails(item)}>
          <Text style={styles.detailsButtonText}>Visit Details</Text>
        </TouchableOpacity>
      </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  patientInfo: {
    width: '80%',
  },
  patientName: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    textAlign: 'left',
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#191919',
    // marginBottom: 4,
  },
  genderRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gender: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#666',
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  imageContainer: {
    width: '20%',
    alignItems: 'flex-end',
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#191919',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    height: 45,
    width: '40%',
    borderRadius: 8,
    justifyContent: 'center',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: '#23a2a4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 45,
    width: '58%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#239EA0',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
  },
  callBtnEnabled: {
    backgroundColor: '#19b123',
    borderWidth: 1,
    borderColor: '#19b123',
  },
});

export default AppointmentCard;
