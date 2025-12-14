import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Platform, Alert, PermissionsAndroid, Linking, Image } from 'react-native';
import MapView, { Marker, MapPressEvent, Region, PROVIDER_GOOGLE } from 'react-native-maps';
// import Geolocation from '@react-native-community/geolocation';
import { setSelectedLocation } from '../../../shared/redux/reducers/bookingReducer';
import { useDispatch } from 'react-redux';
import { globalTextStyles } from '../../../styles/globalStyles';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import CustomAlertModal from '../../../components/common/CustomAlertModal';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // For cross and location icons

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 110;

const DEFAULT_REGION = {
  latitude: 31.5204,
  longitude: 74.3587,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapTab = ({ onPressLocation }: { onPressLocation: () => void }) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const dispatch = useDispatch();
  const [permissionModal, setPermissionModal] = useState(false)

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (result === RESULTS.GRANTED) {
          return true;
        } else if (
          result === RESULTS.BLOCKED
        ) {
          setPermissionModal(true);
          return false;
        } else {
          return false;
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setPermissionModal(true);
          return false;
        }
      }
    } catch (error) {
    }
  };

  const getCurrentLocation = async () => {
    const permission = await requestLocationPermission();
    if (!permission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        // ✅ position is available here
        const { latitude, longitude } = position.coords;

        setMarker({ latitude, longitude });

        if (mapRef.current) {
          mapRef.current.getMapBoundaries().then((bounds) => {
            const currentZoom = {
              latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
              longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
            };

            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: currentZoom.latitudeDelta,
                longitudeDelta: currentZoom.longitudeDelta,
              },
              1000
            );
          });
        }

        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
        distanceFilter: 0,
      }
    );
  };


  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDrIDwxB952Xv0ogIH6ytLJ_iKfxfadfEM&language=ar&region=SA`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let city = '';
        const cityComponent = addressComponents.find(
          (component: any) =>
            component.types.includes('locality') ||
            component.types.includes('administrative_area_level_1')
        );
        if (cityComponent) {
          city = cityComponent.long_name;
        }

        const address = result.formatted_address;

        setAddress(address);
        setCity(city || 'موقع غير معروف');
      } else {
        setAddress(`الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setCity('موقع غير معروف');
      }
    } catch (error) {
      setAddress(`الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      setCity('موقع غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    if (mapRef.current) {
      mapRef.current.getMapBoundaries().then((bounds) => {
        const currentZoom = {
          latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
          longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
        };

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: currentZoom.latitudeDelta,
          longitudeDelta: currentZoom.longitudeDelta,
        }, 1000);
      });
    }

    getAddressFromCoordinates(latitude, longitude);
  };

  const handleClear = () => {
    setMarker(null);
    setAddress('');
    setCity('');
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleConfirmLocation = () => {
    dispatch(setSelectedLocation({
      latitude: marker?.latitude,
      longitude: marker?.longitude,
      address: address,
      city: city,
    }));

    onPressLocation();
  };

  const HandleClose = () => {
    setPermissionModal(false)
  }

  const HandleConfirm = async () => {
    setPermissionModal(false);
    await Linking.openSettings();
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
        >
          {marker && (
            <Marker
              coordinate={marker}
              onPress={() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 1000);
                }
              }}
            />
          )}

        </MapView>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.currntLocationButton}>
          <Image source={require('../../../assets/images/location.png')} style={styles.locationImg} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>

        <Text style={styles.cardTitle}>Visit site</Text>
        <View style={styles.cardBox}>
          <Text style={styles.city}>{city || '---'}</Text>
          <Text style={styles.address}>{address || '---'}</Text>
        </View>
        <TouchableOpacity disabled={city === '' && address === ''} onPress={handleConfirmLocation} style={[styles.confirmButton, {
          backgroundColor: city === '' && address === '' ? '#bfbeba' : '#36a6ad'
        }]}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>

      </View>
      <CustomAlertModal
        visible={permissionModal}
        title={'Permission Required'}
        message={'Please enable location access in your phone settings to detect your current location.'}
        onClose={HandleClose}
        onConfirm={HandleConfirm}
        confirmText={'Open Setting'}
        type={'info'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: width,
  },
  cardContainer: {
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
  cardTitle: {
    textAlign: 'left',
    paddingTop: 10,
    ...globalTextStyles.buttonMedium,
    marginBottom: 8,
    color: '#333',
  },
  cardBox: {
    backgroundColor: '#e6f2f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  city: {
    ...globalTextStyles.buttonMedium,
    color: '#2d3a4b',
    textAlign: 'left',
  },
  address: {
    ...globalTextStyles.bodySmall,
    color: '#2d3a4b',
    textAlign: 'left',
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#36a6ad',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmButtonText: {
    ...globalTextStyles.buttonLarge,
    color: '#fff',
  },
  currntLocationButton: {
    width: 50,
    height: 50,
    position: 'absolute',
    borderRadius: 50 / 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    backgroundColor: '#36a6ad',
    alignItems: 'center',
    zIndex: 999,
    bottom: 0,
    justifyContent: 'center',
    margin: 10
  },
  currentLocationText: {
    color: '#fff',
    fontSize: 14,
    padding: 10
  },
  locationImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff'
  }
});

export default MapTab; 