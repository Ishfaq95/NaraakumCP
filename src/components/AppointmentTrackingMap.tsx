import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { CAIRO_FONT_FAMILY } from '../styles/globalStyles';
import { GOOGLE_MAP_API_KEY } from '../shared/utils/constants';

interface AppointmentTrackingMapProps {
  appointment: any;
  onRouteInfoUpdate?: (routeInfo: {distance: string, duration: string}) => void;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

const AppointmentTrackingMap: React.FC<AppointmentTrackingMapProps> = ({ appointment, onRouteInfoUpdate }) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("appointment",appointment)

  useEffect(() => {
    if (appointment) {
      initializeMap();
    }
  }, [appointment]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      
      // Parse origin coordinates (Organization location)
      const originCoords = parseCoordinates(appointment.OrgGoogleLocation);
      if (!originCoords) {
        throw new Error('Invalid origin coordinates');
      }
      setOrigin(originCoords);

      // Parse destination coordinates (Patient location)
      const destinationCoords = parseCoordinates(appointment.GoogleLocation);
      if (!destinationCoords) {
        throw new Error('Invalid destination coordinates');
      }
      setDestination(destinationCoords);

    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في تحميل الخريطة');
    } finally {
      setLoading(false);
    }
  };

  const parseCoordinates = (coordinateString: string): Location | null => {
    if (!coordinateString) {
      return null;
    }
    
    try {
      const [lat, lng] = coordinateString.split(',').map(coord => parseFloat(coord.trim()));
      
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      
      return { latitude: lat, longitude: lng };
    } catch (error) {
      return null;
    }
  };

  const formatDistance = (distanceInKm: number): string => {
    // react-native-maps-directions returns distance in kilometers
    if (distanceInKm < 1) {
      // Show in meters for distances less than 1km
      const meters = Math.round(distanceInKm * 1000);
      return `${meters} m`;
    } else {
      // Show in kilometers with 1 decimal place for distances >= 1km
      return `${distanceInKm.toFixed(1)} km`;
    }
  };

  const formatDuration = (durationInMinutes: number): string => {
    // react-native-maps-directions returns duration in minutes
    const totalMinutes = Math.round(durationInMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      // Show hours and minutes for durations >= 1 hour
      if (minutes > 0) {
        return `${hours} hr ${minutes} min`;
      } else {
        return `${hours} hr`;
      }
    } else {
      // Show only minutes for durations < 1 hour
      return `${totalMinutes} min`;
    }
  };

  const handleDirectionsReady = (result: any) => {
    if (result) {
      const distance = result.distance ? formatDistance(result.distance) : 'Not Available';
      const duration = result.duration ? formatDuration(result.duration) : 'Not Available';
      
      const routeInfoData = {
        distance,
        duration,
      };

      setRouteInfo(routeInfoData);

      if (onRouteInfoUpdate) {
        onRouteInfoUpdate(routeInfoData);
      }

      // Fit map to show the route
      if (mapRef.current && origin && destination) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates([origin, destination], {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        }, 300);
      }
    }
  };

  const handleDirectionsError = (errorMessage: string) => {
    // Set fallback route info
    if (origin && destination) {
      // calculateDistance returns distance in kilometers
      const directDistanceKm = calculateDistance(origin, destination);
      // Estimate time: roughly 2 minutes per kilometer (average driving speed ~30 km/h)
      const estimatedTimeMinutes = Math.round(directDistanceKm * 2);
      
      const fallbackRoute = {
        distance: formatDistance(directDistanceKm),
        duration: formatDuration(estimatedTimeMinutes),
      };

      setRouteInfo(fallbackRoute);
      if (onRouteInfoUpdate) {
        onRouteInfoUpdate(fallbackRoute);
      }
    }
  };

  const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const computeInitialRegion = (start: Location, end: Location) => {
    const latDiff = Math.abs(start.latitude - end.latitude);
    const lngDiff = Math.abs(start.longitude - end.longitude);
    
    // Ensure minimum deltas to show both markers even if they're very close
    const minLatDelta = 0.01;
    const minLngDelta = 0.01;
    
    const latitudeDelta = Math.max(latDiff * 2, minLatDelta);
    const longitudeDelta = Math.max(lngDiff * 2, minLngDelta);

    const midLat = (start.latitude + end.latitude) / 2;
    const midLng = (start.longitude + end.longitude) / 2;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta,
      longitudeDelta,
    };
  };

  const fitMapToMarkers = () => {
    if (mapRef.current && origin && destination) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#23a2a4" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!origin || !destination) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cannot load map</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={computeInitialRegion(origin, destination)}
        onMapReady={() => {
          setMapReady(true);
          // Fit map to show both markers initially
          setTimeout(() => {
            fitMapToMarkers();
          }, 300);
        }}
      >
        {/* Origin Marker (Organization) */}
        <Marker
          coordinate={origin}
          title="Organization"
          description={appointment.OrganizationSlang}
          pinColor="green"
        />

        {/* Destination Marker (Patient Location) */}
        <Marker
          coordinate={destination}
          title="Patient Location"
          description={appointment.Address || 'Patient Location'}
          pinColor="red"
        />

        {/* Route Directions using react-native-maps-directions */}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAP_API_KEY}
            strokeWidth={4}
            strokeColor="#23a2a4"
            mode="DRIVING"
            onReady={handleDirectionsReady}
            onError={handleDirectionsError}
            optimizeWaypoints={false}
            precision="high"
          />
        )}
      </MapView>

      {/* Route Info Overlay */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>Distance:</Text>
            <Text style={styles.routeInfoValue}>{routeInfo.distance}</Text>
          </View>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>Expected Time:</Text>
            <Text style={styles.routeInfoValue}>{routeInfo.duration}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  errorText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    color: '#666',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeInfoItem: {
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 12,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    color: '#666',
    marginBottom: 2,
  },
  routeInfoValue: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#23a2a4',
  },
});

export default AppointmentTrackingMap;
