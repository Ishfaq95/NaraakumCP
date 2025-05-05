// Path: android/app/src/main/java/com/livetrackingtestingapp/LocationModule.java

package com.naraakum_cp;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.naraakum_cp.ReactContextHolder; 

public class LocationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LocationModule";
    private final ReactApplicationContext reactContext;
    private static LocationModule instance;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        instance = this;
        Log.d(TAG, "LocationModule initialized with context: " + reactContext);
        // Store the ReactApplicationContext in ReactContextHolder
        ReactContextHolder.setContext(reactContext);
    }

    public static LocationModule getInstance() {
        if (instance == null) {
            Log.e(TAG, "LocationModule instance is null!");
        }
        return instance;
    }

    @Override
    public String getName() {
        return "LocationModule";
    }

    @ReactMethod
    public void startTracking() {
        Log.d(TAG, "startTracking called");
        try {
            if (reactContext == null) {
                Log.e(TAG, "React context is null in startTracking");
                return;
            }

            // Check for required permissions
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                if (reactContext.checkSelfPermission(android.Manifest.permission.FOREGROUND_SERVICE_LOCATION) 
                    != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    Log.e(TAG, "FOREGROUND_SERVICE_LOCATION permission not granted");
                    return;
                }
            }

            if (reactContext.checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) 
                != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, "ACCESS_FINE_LOCATION permission not granted");
                return;
            }

            Intent serviceIntent = new Intent(reactContext, LocationService.class);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            Log.d(TAG, "Location service started successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error starting location service: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopTracking() {
        Log.d(TAG, "stopTracking called");
        try {
            if (reactContext == null) {
                Log.e(TAG, "React context is null in stopTracking");
                return;
            }

            Intent serviceIntent = new Intent(reactContext, LocationService.class);
            reactContext.stopService(serviceIntent);
            Log.d(TAG, "Location service stopped successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping location service: " + e.getMessage(), e);
        }
    }

    public void sendLocationUpdate(double latitude, double longitude) {
        try {
            if (reactContext == null) {
                Log.e(TAG, "React context is null in sendLocationUpdate");
                return;
            }

            if (!reactContext.hasCurrentActivity()) {
                Log.e(TAG, "No current activity in sendLocationUpdate");
                return;
            }

            WritableMap params = new WritableNativeMap();
            params.putDouble("latitude", latitude);
            params.putDouble("longitude", longitude);

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("locationUpdate", params);
            
            Log.d(TAG, "Location update sent successfully: " + latitude + ", " + longitude);
        } catch (Exception e) {
            Log.e(TAG, "Error sending location update: " + e.getMessage(), e);
        }
    }
}
