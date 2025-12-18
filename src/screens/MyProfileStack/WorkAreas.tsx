import { 
    View, 
    Text, 
    SafeAreaView, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Platform, 
    Image, 
    TextInput, 
    KeyboardAvoidingView, 
    PermissionsAndroid
 } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { commonAPIService } from '../../services/api/commonAPIService';
import Dropdown from '../../components/common/Dropdown';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { profileService } from '../../services/api/profileService';
import { useSelector } from 'react-redux';
import { useAlert } from '../../contexts/AlertContext';

const WorkAreas = ({ route }: { route: any }) => {
    const Data = route.params?.Data;
    const navigation = useNavigation();
    const user = useSelector((state: any) => state.root.user.user);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [selectedCityId, setSelectedCityId] = useState<string | number>('');
    const [squares, setSquares] = useState<any[]>([]);
    const [selectedSquare, setSelectedSquare] = useState<any>(null);
    const [selectedSquareId, setSelectedSquareId] = useState<string | number>('');
    const [englishAddress, setEnglishAddress] = useState<string>('');
    const [arabicAddress, setArabicAddress] = useState<string>('');
    const [mapCoordinates, setMapCoordinates] = useState<string>('');
    const [markerLocation, setMarkerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [organizationInfo, setOrganizationInfo] = useState<any>(null);
    const { showAlert } = useAlert();
    const [validationErrors, setValidationErrors] = useState({
        city: false,
        coordinates: false,
    });
    // Riyadh coordinates as fallback
    const RIYADH_COORDINATES = {
        latitude: 24.7136,
        longitude: 46.6753,
    };

    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: RIYADH_COORDINATES.latitude,
        longitude: RIYADH_COORDINATES.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        getAllCities();
        getOrganizationInfo();
    }, []);

    // Get current location only if organizationInfo doesn't have coordinates
    useEffect(() => {
        if (!organizationInfo || !organizationInfo.GoogleLocation) {
            getCurrentLocation();
        }
    }, [organizationInfo]);

    const getOrganizationInfo = async () => {
        try {
            const payload = {
                OrganizationId: user.OrganizationId,
            }
            const response = await profileService.getOrganizationInfo(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                setOrganizationInfo(response.Data[0]);
            }
        } catch (error) {
        }
    }

    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'ios') {
                const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                return result === RESULTS.GRANTED;
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (error) {
            return false;
        }
    };

    const centerMapOnLocation = (latitude: number, longitude: number) => {
        if (mapRef.current) {
            const region: Region = {
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            mapRef.current.animateToRegion(region, 1000);
        }
    };

    const setLocationOnMap = (latitude: number, longitude: number) => {
        const location = { latitude, longitude };
        setMarkerLocation(location);
        const coordinates = `${latitude}, ${longitude}`;
        setMapCoordinates(coordinates);

        // Clear coordinates validation error when coordinates are set
        if (validationErrors.coordinates) {
            setValidationErrors(prev => ({ ...prev, coordinates: false }));
        }

        // Update map region
        const newRegion: Region = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
        setMapRegion(newRegion);

        // Center map on location
        centerMapOnLocation(latitude, longitude);
    };

    const getCurrentLocation = async () => {
        try {
            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                // Use Riyadh as fallback if permission denied
                setLocationOnMap(RIYADH_COORDINATES.latitude, RIYADH_COORDINATES.longitude);
                return;
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationOnMap(latitude, longitude);
                },
                (error) => {
                    // Use Riyadh as fallback on error
                    setLocationOnMap(RIYADH_COORDINATES.latitude, RIYADH_COORDINATES.longitude);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        } catch (error) {
            // Use Riyadh as fallback on error
            setLocationOnMap(RIYADH_COORDINATES.latitude, RIYADH_COORDINATES.longitude);
        }
    };

    const getAllCities = async () => {
        const response = await commonAPIService.getAllCities();
        if (response.ResponseStatus.STATUSCODE) {
            setCities(response.list);
        }
    }

    useEffect(() => {
        if (selectedCityId) {
            // Handle both string and number ID comparison
            const city = cities.find(c => 
                c.Id?.toString() === selectedCityId?.toString() || 
                c.Id?.toString() === parseInt(selectedCityId?.toString())
            );
            setSelectedCity(city);
            getSquareByCityId();
            // Clear city validation error when city is selected
            if (validationErrors.city) {
                setValidationErrors(prev => ({ ...prev, city: false }));
            }
        } else {
            setSelectedCity(null);
            setSquares([]);
            setSelectedSquareId('');
            setSelectedSquare(null);
        }
    }, [selectedCityId, cities]);

    useEffect(() => {
        if (selectedSquareId) {
            // Handle both string and number ID comparison
            const square = squares.find(s => 
                s.Id?.toString() === selectedSquareId?.toString() || 
                s.Id?.toString() === parseInt(selectedSquareId?.toString())
            );
            setSelectedSquare(square);
        } else {
            setSelectedSquare(null);
        }
    }, [selectedSquareId, squares]);

    // Populate form fields from organizationInfo when available
    useEffect(() => {
        if (organizationInfo && cities.length > 0) {
            
            // Set city - check if city exists in cities array
            if (organizationInfo.CatCityId) {
                const apiCityId = organizationInfo.CatCityId?.toString();
                
                // Find city by matching Id (handle both string and number comparison)
                const city = cities.find(c => {
                    const cityIdStr = c.Id?.toString();
                    const cityIdNum = typeof c.Id === 'number' ? c.Id : parseInt(cityIdStr);
                    return cityIdStr === apiCityId || cityIdNum === parseInt(apiCityId);
                });
                
                if (city) {
                    setSelectedCityId(city.Id);
                }
            }

            // Set addresses
            if (organizationInfo.AddressPlang) {
                setEnglishAddress(organizationInfo.AddressPlang);
            }
            if (organizationInfo.AddressSlang) {
                setArabicAddress(organizationInfo.AddressSlang);
            }

            // Set coordinates and marker location
            if (organizationInfo.GoogleLocation) {
                const coords = organizationInfo.GoogleLocation;
                setMapCoordinates(coords);
                
                // Parse coordinates string "lat, lng" to set marker
                const [lat, lng] = coords.split(',').map((coord: string) => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    setLocationOnMap(lat, lng);
                }
            }
        }
    }, [organizationInfo, cities]);

    // Set square after squares are loaded and city is set
    useEffect(() => {
        if (organizationInfo && squares.length > 0 && selectedCityId) {
            
            if (organizationInfo.CatSquareId && organizationInfo.CatSquareId !== '0' && organizationInfo.CatSquareId !== 0) {
                const apiSquareId = organizationInfo.CatSquareId?.toString();
                
                // Find square by matching Id (handle both string and number comparison)
                const square = squares.find(s => {
                    const squareIdStr = s.Id?.toString();
                    const squareIdNum = typeof s.Id === 'number' ? s.Id : parseInt(squareIdStr);
                    return squareIdStr === apiSquareId || squareIdNum === parseInt(apiSquareId);
                });
                
                if (square) {
                    setSelectedSquareId(square.Id);
                }
            }
        }
    }, [organizationInfo, squares, selectedCityId]);

    const getSquareByCityId = async () => {
        try {
            const city = cities.find(c => c.Id === selectedCityId);
            if (city.CatAreaId) {
                const response = await commonAPIService.getSquareByCityId({ CatCityId: city.CatAreaId });
            if (response.ResponseStatus.STATUSCODE == 200) {
                setSquares(response.list);
                } else {
                    setSquares([]);
                }
            } else {
                setSquares([]);
            }
        } catch (error) {
        }
    }

    const validateForm = (): boolean => {
        const errors = {
            city: !selectedCityId || selectedCityId === '',
            coordinates: !mapCoordinates || mapCoordinates.trim() === '',
        };

        setValidationErrors(errors);

        // Return true if no errors
        return !errors.city && !errors.coordinates;
    };

    const addUpdateOrganizationAddress = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            const payload = {
                OrganizationId: user.OrganizationId,
                AddressPlang: englishAddress,
                AddressSlang: arabicAddress,
                CatCityId: selectedCityId,
                CatSquareId: selectedSquareId,
                GoogleLocation: mapCoordinates,
            }
            const response = await profileService.addUpdateOrganizationAddress(payload);
            if (response.StatusCode.STATUSCODE == 11009) {
                showAlert({
                    title: 'Address updated successfully',
                    message: '',
                    type: 'success',
                });
                // Clear validation errors on success
                setValidationErrors({ city: false, coordinates: false });
            }
        } catch (error) {
        }
    }

    const handleMapPress = (event: MapPressEvent) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setLocationOnMap(latitude, longitude);
    }

    // Center map on marker whenever marker location changes
    useEffect(() => {
        if (markerLocation) {
            const newRegion: Region = {
                latitude: markerLocation.latitude,
                longitude: markerLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setMapRegion(newRegion);

            // Center map with delay to ensure map is ready
            const timer = setTimeout(() => {
                centerMapOnLocation(markerLocation.latitude, markerLocation.longitude);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [markerLocation]);

    const handleCancel = () => {
        navigation.goBack();
    }

    const citiesDropdownData = cities.map(city => ({
        label: city.TitlePlang || '',
        value: city.Id,
    }));

    const squaresDropdownData = squares.map(square => ({
        label: square.Title || '',
        value: square.Id,
    }));

    const backButtonPress = () => {
        navigation.goBack();
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={backButtonPress} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Work Areas</Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.mainContent}>
                    <View style={styles.headerSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image
                                source={require('../../assets/icons/HomeVisit.png')}
                                style={styles.headerIcon}
                                resizeMode='contain'
                            />
                            <Image
                                source={require('../../assets/images/workArea.png')}
                                style={styles.headerIcon}
                                resizeMode='contain'
                            />
                        </View>
                        <Text style={styles.headerText}>
                            {`Home Visit Work Areas`}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                            {/* City Dropdown */}
                            <View style={styles.inputGroup}>
                                <Dropdown
                                    data={citiesDropdownData}
                                    value={selectedCityId}
                                    onChange={(value) => setSelectedCityId(value)}
                                    placeholder="Select City"
                                    containerStyle={styles.dropdownContainer}
                                    dropdownStyle={[styles.dropdown, validationErrors.city && styles.errorBorder]}
                                    error={validationErrors.city}
                                />
                            </View>

                            {/* District Dropdown */}
                            <View style={styles.inputGroup}>
                                <Dropdown
                                    data={squaresDropdownData}
                                    value={selectedSquareId}
                                    onChange={(value) => setSelectedSquareId(value)}
                                    placeholder="Select District"
                                    containerStyle={styles.dropdownContainer}
                                    dropdownStyle={styles.dropdown}
                                    disabled={!selectedCityId}
                                />
                            </View>

                            {/* English Address Input */}
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Full Address In English"
                                    value={englishAddress}
                                    onChangeText={setEnglishAddress}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Arabic Address Input */}
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Full Address In Arabic"
                                    value={arabicAddress}
                                    onChangeText={setArabicAddress}
                                    placeholderTextColor="#999"
                                    textAlign="right"
                                />
                            </View>

                            {/* Map Coordinates Input */}
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.textInput, validationErrors.coordinates && styles.errorBorder]}
                                    placeholder="Map coordinates"
                                    value={mapCoordinates}
                                    onChangeText={(text) => {
                                        setMapCoordinates(text);
                                        // Clear coordinates validation error when user types
                                        if (validationErrors.coordinates && text.trim() !== '') {
                                            setValidationErrors(prev => ({ ...prev, coordinates: false }));
                                        }
                                    }}
                                    placeholderTextColor="#999"
                                    editable={false}
                                />
                            </View>

                            {/* Map View */}
                            <View style={styles.mapContainer}>
                                <MapView
                                    ref={mapRef}
                                    style={styles.map}
                                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                    initialRegion={mapRegion}
                                    onPress={handleMapPress}
                                    onMapReady={() => {
                                        // Center map when map is ready
                                        if (markerLocation) {
                                            setTimeout(() => {
                                                centerMapOnLocation(markerLocation.latitude, markerLocation.longitude);
                                            }, 200);
                                        }
                                    }}
                                >
                                    {markerLocation && (
                                        <Marker
                                            coordinate={markerLocation}
                                            title="Selected Location"
                                        />
                                    )}
                                </MapView>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={addUpdateOrganizationAddress}
                    >
                        <Text style={styles.saveButtonText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#000',
        marginLeft: 4,
    },
    headerSection: {
        padding: 16,
        backgroundColor: '#E8F4F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    headerText: {
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
        color: '#666',
    },
    flex: {
        flex: 1,
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        marginTop: 16,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    dropdownContainer: {
        marginBottom: 0,
    },
    dropdown: {
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    textInput: {
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#222',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    mapContainer: {
        height: 300,
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#999',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#fff',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#00A19D',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: '#fff',
        lineHeight: Platform.OS === 'ios' ? 0 : 20,
    },
    errorBorder: {
        borderColor: '#ff4444',
        borderWidth: 1,
    },
});

export default WorkAreas