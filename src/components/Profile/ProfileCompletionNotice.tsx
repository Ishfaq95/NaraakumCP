import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileSummary {
  ProfileManagement?: string;
  PaymentProfile?: string;
  ServiceProfile?: string;
  OrganizationStatus?: boolean;
}

interface ProfileCompletionNoticeProps {
  profileSummary: ProfileSummary;
  onCompleteProfile: () => void;
}

const ProfileCompletionNotice: React.FC<ProfileCompletionNoticeProps> = ({
  profileSummary,
  onCompleteProfile,
}) => {
  const calculateCompletionPercentage = (): number => {
    let completionPercentage = 0;
    
    // ProfileManagement is worth 33%
    if (profileSummary.ProfileManagement === 'Completed') {
      completionPercentage += 33;
    }
    
    // PaymentProfile is worth 33%
    if (profileSummary.PaymentProfile === 'Completed') {
      completionPercentage += 33;
    }
    
    // ServiceProfile is worth 34%
    if (profileSummary.ServiceProfile === 'Completed') {
      completionPercentage += 34;
    }
    
    return completionPercentage;
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile is incomplete</Text>
      <Text style={styles.subtitle}>
        Your profile will not appear in care providers' list
        until you complete your profile
      </Text>
      
      <View style={styles.progressRow}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
        </View>
        <Text style={styles.percentageText}>{completionPercentage}%</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={onCompleteProfile}>
        <Text style={styles.buttonText}>Complete My Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f29f3f',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileCompletionNotice;
