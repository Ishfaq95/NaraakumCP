import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
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
  polylinePoints: Location[];
}

const AppointmentTrackingMap: React.FC<AppointmentTrackingMapProps> = ({ appointment, onRouteInfoUpdate }) => {
  const mapRef = useRef<MapView>(null);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Get route information
      await getRouteInfo(originCoords, destinationCoords);

    } catch (error) {
      console.error('Error initializing map:', error);
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
      console.error('Error parsing coordinates:', error);
      return null;
    }
  };

  const getRouteInfo = async (origin: Location, destination: Location) => {
    try {
      
      // For now, let's create a simple direct line and calculate basic distance
      const directDistance = calculateDistance(origin, destination);
      const estimatedTime = Math.round(directDistance * 2); // Rough estimate: 2 min per km
      
      // Create a simple polyline with just origin and destination
      const simplePolyline = [origin, destination];
      
      const routeInfoData = {
        distance: `${directDistance.toFixed(1)} كم`,
        duration: `${estimatedTime} دقيقة`,
        polylinePoints: simplePolyline
      };
      
      setRouteInfo(routeInfoData);
      
      // Pass route info to parent component
      if (onRouteInfoUpdate) {
        onRouteInfoUpdate({
          distance: routeInfoData.distance,
          duration: routeInfoData.duration
        });
      }

      // Fit map to show both markers
      fitMapToMarkers(origin, destination, simplePolyline);
      
    } catch (error) {
      console.error('Error getting route:', error);
      // Set default route info
      setRouteInfo({
        distance: 'غير متوفر',
        duration: 'غير متوفر',
        polylinePoints: [origin, destination]
      });
      
      // Fit map to show both markers without route
      fitMapToMarkers(origin, destination, [origin, destination]);
    }
  };

  // Calculate distance between two points using Haversine formula
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

  const decodePolyline = (encoded: string): Location[] => {
    if (!encoded || encoded.length === 0) {
      return [];
    }

    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    try {
      while (index < len) {
        let shift = 0, result = 0;

        do {
          if (index >= len) break;
          let b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (result >= 0x20);

        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;

        do {
          if (index >= len) break;
          let b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (result >= 0x20);

        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push({
          latitude: lat / 1E5,
          longitude: lng / 1E5
        });
      }

      return poly;
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  };

  const fitMapToMarkers = (origin: Location, destination: Location, polylinePoints: Location[]) => {
    if (!mapRef.current) return;

    const allPoints = [origin, destination, ...polylinePoints];
    
    // Calculate bounds
    let minLat = Math.min(...allPoints.map(p => p.latitude));
    let maxLat = Math.max(...allPoints.map(p => p.latitude));
    let minLng = Math.min(...allPoints.map(p => p.longitude));
    let maxLng = Math.max(...allPoints.map(p => p.longitude));

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + latPadding,
      longitudeDelta: (maxLng - minLng) + lngPadding,
    };

    mapRef.current.animateToRegion(region, 1000);
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
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.5,
          longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.5,
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

        {/* Always show a line between origin and destination */}
        <Polyline
          coordinates={[origin, destination]}
          strokeColor="#23a2a4"
          strokeWidth={4}
          geodesic={true}
        />
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