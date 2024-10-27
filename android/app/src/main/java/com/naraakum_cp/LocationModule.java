// Path: android/app/src/main/java/com/livetrackingtestingapp/LocationModule.java

package com.naraakum_cp;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.naraakum_cp.ReactContextHolder; 

public class LocationModule extends ReactContextBaseJavaModule {

    public LocationModule(ReactApplicationContext context) {
        super(context);
        // Store the ReactApplicationContext in ReactContextHolder
        ReactContextHolder.setContext(context);
    }

    @Override
    public String getName() {
        return "LocationModule";
    }

    @ReactMethod
    public void startTracking() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), LocationService.class);
        getReactApplicationContext().startService(serviceIntent);
    }

    @ReactMethod
    public void stopTracking() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), LocationService.class);
        getReactApplicationContext().stopService(serviceIntent);
    }
}
