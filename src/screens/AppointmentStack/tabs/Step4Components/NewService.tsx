import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../../../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../../../shared/utils/routes';
import { addVisitRecordService } from '../../../../services/api/addVisitRecord';
import { useDispatch, useSelector } from 'react-redux';
import { addCardItem, setSelectedLocation } from '../../../../shared/redux/reducers/bookingReducer';
import { useIsFocused } from '@react-navigation/native';

export interface NewServiceData {
  serviceName?: string;
  notes?: string;
}

interface NewServiceProps { 
  onDataChange?: (data: NewServiceData) => void;
  patientData: any;
  scrollToInput?: (inputRef: React.RefObject<TextInput | View | null>) => void;
}

const NewService: React.FC<NewServiceProps> = ({ patientData, onDataChange }) => {
  const [services, setServices] = useState<any[]>([]);
  const navigation = useNavigation();
  const visitmainId: any = useSelector((state: any) => state.root.generalData.visitmainId);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  useEffect(() => {
    getOrderListAddedByServiceProvider();
  }, [isFocused]);

  const getOrderListAddedByServiceProvider = async () => {
    const payload = {
      UserloginInfoId: patientData?.UserLoginInfoId,
      CPUserloginInfoId:patientData?.ServiceProviderID,
      VisitMainId:visitmainId,
    };
    const response = await addVisitRecordService.getOrderListAddedByServiceProvider(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setServices(response.UserOrders);
    }
  };

  const onAddService = () => {
    dispatch(addCardItem([]))
    dispatch(setSelectedLocation(null))
    navigation.navigate(ROUTES.BookNewService as never, { Patient: patientData, VisitMainId: visitmainId });
  }

  const onPressShowDetails = (item: any) => {
    console.log("item===>", item)
    navigation.navigate(ROUTES.OrderDetails as never, { item: item, visitmainId: visitmainId });
  }

  const renderServiceItem = (item: any) => {
    const orderDate = item?.OrderDate
      ? new Date(item.OrderDate)
      : null;

    const formattedDate = orderDate
      ? `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${orderDate.getFullYear()}`
      : '-';

    return (
      <View style={styles.card}>
        {/* Added By */}
        <View style={styles.row}>
          <Text style={styles.label}>Added By</Text>
          <Text style={styles.value}>{item?.ORGTitlePlang || '-'}</Text>
        </View>

        {/* Order No. */}
        <View style={styles.row}>
          <Text style={styles.label}>Order No.</Text>
          <Text style={styles.value}>{item?.OrderID || '-'}</Text>
        </View>

        {/* Order Date */}
        <View style={styles.row}>
          <Text style={styles.label}>Order Date</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        {/* Services */}
        <View style={styles.row}>
          <Text style={styles.label}>Services</Text>
          <Text style={styles.value}>{item?.Service ?? '-'}</Text>
        </View>

        {/* Total Invoice */}
        <View style={styles.row}>
          <Text style={styles.label}>Total Invoice</Text>
          <Text style={styles.valueStrong}>{`${item?.TotalPrice ?? '0.00'} SAR`}</Text>
        </View>

        {/* Show Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            onPressShowDetails(item)
          }}
        >
          <Text style={styles.detailsButtonText}>Show Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[styles.container,styles.content]}
      // contentContainerStyle={styles.content}
      // showsVerticalScrollIndicator={false}
      // keyboardShouldPersistTaps="handled"
    >
       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...globalTextStyles.h5, color: '#1a3c40' }}>Orders List</Text>
        <TouchableOpacity onPress={onAddService} style={{ backgroundColor: '#179c8e', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add Services</Text>
        </TouchableOpacity>
      </View>
      <View style={{flex:1,marginTop: 12}}>
        <FlatList
          data={services}
          renderItem={({ item }) => renderServiceItem(item)}
          keyExtractor={(item) => item?.OrderID?.toString() ?? Math.random().toString()}
          ListEmptyComponent={<View style={{flex:1,marginTop: '30%', justifyContent: 'center', alignItems: 'center'}}><Text style={{...globalTextStyles.bodyMedium, color: '#1a3c40'}}>No services added</Text></View>}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#1a3c40',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce5e4',
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    lineHeight: 20,
    color: '#1a2c32',
  },
  value: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#000',
  },
  valueStrong: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#000',
  },
  detailsButton: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#18a0a4',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#18a0a4',
  },
  singleLine: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#1a2c32',
    borderWidth: 1,
    borderColor: '#dce5e4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    lineHeight: 20,
    color: '#1a2c32',
  },
});

export default NewService;


