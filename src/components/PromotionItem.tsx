import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalTextStyles } from '../styles/globalStyles';
import moment from 'moment';


interface PromotionItemProps {
  item: any;
  onEditPromotion: (promotion: any) => void;
  onDeletePromotion: (promotion: any) => void;
}

const PromotionItem: React.FC<PromotionItemProps> = ({
  item,
  onEditPromotion,
  onDeletePromotion,
}) => {
  return (
    <View style={styles.promotionCard}>
      {/* Top Row - PCode, Discount, Utilization */}
      <View style={styles.topRow}>
        <View style={styles.infoColumn}>
          <Text style={styles.labelText}>PCode</Text>
          <Text style={styles.valueText}>{item.Pcode}</Text>
        </View>
        
        <View style={styles.infoColumn}>
          <Text style={styles.labelText}>Discount</Text>
          <Text style={styles.valueText}>{item.Discount}%</Text>
        </View>
        
        <View style={styles.infoColumn}>
          <Text style={styles.labelText}>Utilization</Text>
          <Text style={styles.valueText}>{item.UtilizationCount}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Allowed Clients</Text>
          <Text style={styles.detailValue}>{item.NumberOfUsageAllowed==0 ? 'Unlimited' : item.NumberOfUsageAllowed}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Per Client multi usage?</Text>
          <Text style={styles.detailValue}>{item.IsSingleUserMultipleUsage ? 'Yes' : 'No'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Allowed usage</Text>
          <Text style={styles.detailValue}>{item.ForSingleUserUsageAllowed == 0 ? 'Unlimited' : item.ForSingleUserUsageAllowed}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expiry date</Text>
          <Text style={styles.detailValue}>{item.ExpiryDate == null ? 'No Expiry' : moment.utc(item.ExpiryDate).local().format('DD/MM/YYYY')}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEditPromotion(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeletePromotion(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  labelText: {
    ...globalTextStyles.caption,
    color: '#818181',
    marginBottom: 4,
  },
  valueText: {
    ...globalTextStyles.h6,
    fontWeight: 'bold',
    color: '#00A19D',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    ...globalTextStyles.bodyMedium,
    color: '#555',
  },
  detailValue: {
    ...globalTextStyles.bodySmall,
    color: '#000',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A19D',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    ...globalTextStyles.buttonMedium,
    color: '#00A19D',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...globalTextStyles.buttonMedium,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});

export default PromotionItem;
