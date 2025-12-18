import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../styles/globalStyles';
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
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontWeight: '400',
    color: '#666666',
  },
  valueText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#239EA0',
    lineHeight:20,
    textAlign:'left'
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
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontWeight: '400',
    color: '#444444',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#191919',
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
    borderColor: '#239EA0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    fontWeight: '600',
    color: '#239EA0',
    lineHeight:Platform.OS === 'ios' ? 0 : 16
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF6666',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    fontWeight: '600',
    color: '#EF6666',
    lineHeight:Platform.OS === 'ios' ? 0 : 16
  },
});

export default PromotionItem;
