// Path: android/app/src/main/java/com/livetrackingtestingapp/ReactContextHolder.java

package com.naraakum_cp;

import com.facebook.react.bridge.ReactApplicationContext;

public class ReactContextHolder {
    private static ReactApplicationContext reactApplicationContext;

    public static ReactApplicationContext getContext() {
        return reactApplicationContext;
    }

    public static void setContext(ReactApplicationContext context) {
        reactApplicationContext = context;
    }
}
