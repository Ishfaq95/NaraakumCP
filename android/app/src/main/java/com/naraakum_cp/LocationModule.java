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
        try {
            if (reactContext == null) {
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
        } catch (Exception e) {
            Log.e(TAG, "Error starting location service: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopTracking() {
        try {
            if (reactContext == null) {
                Log.e(TAG, "React context is null in stopTracking");
                return;
            }

            Intent serviceIntent = new Intent(reactContext, LocationService.class);
            reactContext.stopService(serviceIntent);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping location service: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void openSettings() {
        try {
            if (reactContext == null) {
                Log.e(TAG, "React context is null in openSettings");
                return;
            }

            // Try to get current activity first
            android.app.Activity currentActivity = reactContext.getCurrentActivity();
            Intent settingsIntent = new Intent(android.provider.Settings.ACTION_SETTINGS);
            settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            if (currentActivity != null) {
                // Use current activity if available
                currentActivity.startActivity(settingsIntent);
                Log.d(TAG, "Settings opened successfully using current activity");
            } else {
                // Fallback to reactContext
                reactContext.startActivity(settingsIntent);
                Log.d(TAG, "Settings opened successfully using reactContext");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error opening settings: " + e.getMessage(), e);
            // Fallback: Try to open wireless settings
            try {
                android.app.Activity currentActivity = reactContext.getCurrentActivity();
                Intent wirelessIntent = new Intent(android.provider.Settings.ACTION_WIRELESS_SETTINGS);
                wirelessIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                if (currentActivity != null) {
                    currentActivity.startActivity(wirelessIntent);
                } else {
                    reactContext.startActivity(wirelessIntent);
                }
                Log.d(TAG, "Opened wireless settings as fallback");
            } catch (Exception e2) {
                Log.e(TAG, "Error opening wireless settings: " + e2.getMessage(), e2);
                // Last resort: Try WiFi settings
                try {
                    android.app.Activity currentActivity = reactContext.getCurrentActivity();
                    Intent wifiIntent = new Intent(android.provider.Settings.ACTION_WIFI_SETTINGS);
                    wifiIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    
                    if (currentActivity != null) {
                        currentActivity.startActivity(wifiIntent);
                    } else {
                        reactContext.startActivity(wifiIntent);
                    }
                    Log.d(TAG, "Opened WiFi settings as last resort");
                } catch (Exception e3) {
                    Log.e(TAG, "All settings open attempts failed: " + e3.getMessage(), e3);
                }
            }
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
