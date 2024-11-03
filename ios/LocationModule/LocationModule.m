#import "LocationModule.h"
#import <CoreLocation/CoreLocation.h>

@interface LocationModule () <CLLocationManagerDelegate>
@property (nonatomic, strong) CLLocationManager *locationManager;
@end

@implementation LocationModule

RCT_EXPORT_MODULE();

- (NSArray<NSString > )supportedEvents {
  return @[@"locationUpdate"];
}

- (void)startObserving {
  [self startLocationUpdates];
}

- (void)stopObserving {
  [self stopLocationUpdates];
}

RCT_EXPORT_METHOD(startTracking) {
  [self startLocationUpdates];
}

RCT_EXPORT_METHOD(stopTracking) {
  [self stopLocationUpdates];
}

- (void)startLocationUpdates {
  if (!self.locationManager) {
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
    self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    self.locationManager.allowsBackgroundLocationUpdates = YES;
    self.locationManager.pausesLocationUpdatesAutomatically = NO;

    // Request permission for location tracking
    if ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
      [self.locationManager requestAlwaysAuthorization];
    }

    [self.locationManager startUpdatingLocation];
  }
}

- (void)stopLocationUpdates {
  [self.locationManager stopUpdatingLocation];
  self.locationManager = nil;
}

// CLLocationManager Delegate Method
- (void)locationManager:(CLLocationManager )manager didUpdateLocations:(NSArray<CLLocation > *)locations {
  CLLocation *location = [locations lastObject];

  // Send location updates to React Native
  if (location) {
    [self sendEventWithName:@"locationUpdate" body:@{@"latitude": @(location.coordinate.latitude), @"longitude": @(location.coordinate.longitude)}];
  }
}

@end