import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { bookingService } from '../../../services/api/bookingService';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenLoader from '../../../components/FullScreenLoader';
import LocationMarkerIcon from '../../../assets/icons/LocationMarkerIcon';
import { setSelectedLocation } from '../../../shared/redux/reducers/bookingReducer';
import { globalTextStyles } from '../../../styles/globalStyles';
import { useAlert } from '../../../contexts/AlertContext';

const SavedAddresses = ({ onPressLocation, patientInfo }: { onPressLocation: () => void, patientInfo: any }) => {
  const { t } = useTranslation();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const user = useSelector((state: any) => state.root.user.user);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLocationloc, setSelectedLocationloc] = useState<any>(null);
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  console.log("patientInfo",patientInfo)
  useEffect(() => {
    const getSavedAddresses = async () => {
      setLoading(true);
      const res = await bookingService.getUserSavedAddresses({
        UserLogininfoId: patientInfo.UserLoginInfoId
      })

      if(res.ResponseStatus.STATUSCODE === 200){
        setSavedAddresses(res.Result);
      }else{
        setSavedAddresses([]);
      }
      setLoading(false);
    }
    if(patientInfo){
    getSavedAddresses();
    }
  }, [patientInfo]);

  const getCoordinatesFromAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyDrIDwxB952Xv0ogIH6ytLJ_iKfxfadfEM&language=ar&region=SA`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const onPressConfirmLocation = async () => {
    // Check if address field has values
    if (!selectedLocationloc?.Address || selectedLocationloc.Address.trim() === '') {
      showAlert({
        message: 'Please selected valid address',
        type: 'warning',
      });
      return;
    }

    // Check if lat/long exist
    const hasLatLong = selectedLocationloc?.Latitude && selectedLocationloc?.Longitude;

    if (!hasLatLong) {
      // Address exists but lat/long don't - geocode the address
      setLoading(true);
      const coordinates = await getCoordinatesFromAddress(selectedLocationloc.Address);
      setLoading(false);

      if (!coordinates) {
        showAlert({
          message: 'Failed to get location coordinates for this address. Please try again.',
          type: 'error',
        });
        return;
      }

      // Update the location object with geocoded coordinates
      const locationObject: any = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: selectedLocationloc.Address,
        city: selectedLocationloc?.City || null,
      };
      dispatch(setSelectedLocation(locationObject));
      onPressLocation();
    } else {
      // Both address and lat/long exist - proceed as normal
    const locationObject: any = {
        latitude: selectedLocationloc.Latitude,
        longitude: selectedLocationloc.Longitude,
        address: selectedLocationloc.Address,
      city: selectedLocationloc?.City || null,
      };
      dispatch(setSelectedLocation(locationObject));
      onPressLocation();
    }
  }

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item.Id === selectedId;
    return (
      <TouchableOpacity
        style={[
          styles.savedAddressItem,
          isSelected ? styles.selectedItem : styles.unselectedItem,
        ]}
        onPress={() => {
          setSelectedId(item.Id);
          setSelectedLocationloc(item);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.row}>
          <LocationMarkerIcon selected={isSelected} size={22} />
          <View style={styles.textContainer}>
            <Text style={[styles.title, isSelected && styles.selectedText]}>{item.AreaTitle}</Text>
            <Text style={[styles.square, isSelected && styles.selectedText]}>{item.Address}</Text>
            <Text style={[styles.description, isSelected && styles.selectedText]}>{item.Description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.savedAddressesContainer}>
        <View style={styles.savedAddressesTitleContainer}>
        <Text style={{ ...globalTextStyles.h4 }}>{t('savedAddresses')}</Text>
        </View>
        <View style={styles.savedAddressesListContainer}>
          <FlatList
            data={savedAddresses}
            keyExtractor={item => item.Id}
            renderItem={renderItem}
            extraData={selectedId}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity onPress={onPressConfirmLocation} style={styles.button}>
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
      <FullScreenLoader visible={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  savedAddressesContainer: {
    flex: 1,
    alignItems: 'center',
  },
  savedAddressesTitleContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  savedAddressesListContainer: {
    padding: 8,
    // paddingBottom: 120,
  },
  savedAddressItem: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#36a6ad',
    borderWidth: 1,
    borderColor: '#36a6ad',
  },
  unselectedItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    ...globalTextStyles.bodyMedium,
    fontFamily: globalTextStyles.h5.fontFamily,
    color: '#222',
    textAlign: 'left',
  },
  square: {
    ...globalTextStyles.bodySmall,
    color: '#222',
    textAlign: 'left',
    marginTop: 2,
  },
  description: {
    ...globalTextStyles.caption,
    color: '#888',
    textAlign: 'left',
    marginTop: 2,
  },
  selectedText: {
    color: '#fff',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    ...globalTextStyles.buttonMedium,
    color: '#fff',
    textAlign: 'center',
  },
});

export default SavedAddresses; 