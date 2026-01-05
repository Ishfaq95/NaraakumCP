import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MediaBaseURL } from '../../shared/utils/constants';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';

interface ProfileHeaderProps {
  name: string;
  gender: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  profileImage?: string;
  completionPercentage: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  gender,
  rating,
  reviewCount,
  isActive,
  profileImage,
  completionPercentage
}) => {
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating)) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === Math.floor(rating) && rating % 1 > 0) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {profileImage ? <FastImage
            source={{ 
              uri: `${MediaBaseURL}${profileImage}`,
              priority: FastImage.priority.normal
            }}
            style={styles.profileImage}
            resizeMode={FastImage.resizeMode.cover}
          /> :
            <View style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDDDDD' }} >
              <Ionicons name="person" size={28} color="#AFAFAF" />
            </View>}
          <View style={styles.userInfo}>
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.name}>{name}</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.gender}>{gender}</Text>

              <FontAwesome name={'star'} size={14} color="#FFC107" style={{ marginRight: 2, marginLeft: 4 }} />
              <Text style={styles.reviewCount}><Text style={{ fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#191919' }}>{rating.toFixed(1)}</Text> ({reviewCount} Person)</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isActive ? '#00AB94' : '#de574d' }]} />
          <Text style={[styles.statusText, { color: isActive ? '#38B96A' : '#de574d' }]}>{isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progress,completionPercentage != 100 && {backgroundColor: '#F29F3F'}, { width: `${completionPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{completionPercentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 6,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width:'80%',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 12,
    flex:1,
  },
  name: {
    fontSize: 15,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#191919',
    lineHeight: Platform.OS === 'ios' ? 24 : 20,
    marginBottom: 2,
  },
  gender: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#666',
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 2,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingRight: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#666',
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width:'20%',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  progress: {
    height: 6,
    backgroundColor: '#00A19D',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
});

export default ProfileHeader;
