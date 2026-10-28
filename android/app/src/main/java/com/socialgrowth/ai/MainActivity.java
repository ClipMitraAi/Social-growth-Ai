package com.socialgrowth.ai;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

/**
 * MainActivity for Social Growth AI Android application.
 * When integrated with Capacitor, this class extends com.getcapacitor.BridgeActivity.
 */
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Capacitor Bridge initialization hook
    }

    @Override
    public void onBackPressed() {
        // Handles Android system back button gracefully
        super.onBackPressed();
    }
}
