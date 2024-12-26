package com.naraakum_cp;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.naraakum_cp.ReactContextHolder;

public class LocationService extends Service {
    private FusedLocationProviderClient fusedLocationClient;
    private static ReactApplicationContext reactContext;

    public LocationService() {
    }

    public LocationService(ReactApplicationContext context) {
        reactContext = context;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Get ReactApplicationContext from ReactContextHolder
        ReactApplicationContext reactContext = ReactContextHolder.getContext();

        if (reactContext == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        startForegroundService();
        startLocationUpdates();
        return START_STICKY;
    }

    private void startForegroundService() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        NotificationChannel channel = new NotificationChannel(
            "tracking_channel",
            "Live Tracking",
            NotificationManager.IMPORTANCE_LOW // Lower priority for less prominent notification
        );
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);
    }

    Intent notificationIntent = new Intent(this, MainActivity.class);

    PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_IMMUTABLE : 0
    );

    Notification notification = new NotificationCompat.Builder(this, "tracking_channel")
            .setContentTitle("Live Tracking")
            .setContentText("Tracking your location...")
            .setSmallIcon(R.mipmap.ic_launcher) // Use a transparent icon to minimize the UI impact
            .setPriority(NotificationCompat.PRIORITY_LOW) // Lower priority
            .setContentIntent(pendingIntent)
            .build();

    startForeground(1, notification);
}

    private void startLocationUpdates() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Create a LocationRequest using the new builder pattern
        LocationRequest locationRequest = new LocationRequest.Builder(
                LocationRequest.PRIORITY_HIGH_ACCURACY, 5000L)  // 5 seconds interval
                .setMinUpdateIntervalMillis(3000L)  // Fastest interval (3 seconds)
                .build();

        // Check for location permissions
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf();
            return;
        }

        // Start requesting location updates
        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }

    private LocationCallback locationCallback = new LocationCallback() {
        @Override
        public void onLocationResult(LocationResult locationResult) {
            if (locationResult == null) {
                return;
            }
            for (Location location : locationResult.getLocations()) {
                Log.d("LocationService", "Location received: " + location.getLatitude() + ", " + location.getLongitude());
                sendLocationToReactNative(location.getLatitude(), location.getLongitude());
            }
        }
    };

    private void sendLocationToReactNative(double latitude, double longitude) {
        ReactApplicationContext reactContext = ReactContextHolder.getContext();
        if (reactContext != null) {
            WritableMap params = new WritableNativeMap();
            params.putDouble("latitude", latitude);
            params.putDouble("longitude", longitude);

            Log.d("LocationService", "Sending location to React Native");

            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("locationUpdate", params);
        }else {
            Log.e("LocationService", "ReactContext is null, cannot send event.");
        }
    }

    @Override
    public void onDestroy() {
        fusedLocationClient.removeLocationUpdates(locationCallback);
        super.onDestroy();
    }
}
