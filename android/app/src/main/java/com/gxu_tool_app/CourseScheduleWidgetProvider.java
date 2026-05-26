package com.gxu_tool_app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.reactnativeandroidwidget.RNWidgetProvider;

public class CourseScheduleWidgetProvider extends RNWidgetProvider {

    private static final String TAG = "CourseScheduleProvider";

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        Log.d(TAG, "onEnabled called. Attempting to start TimeTickService.");
        // 当第一个小部件被添加到主屏幕时，启动我们的服务
        Intent intent = new Intent(context, TimeTickService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // 对于 Android 8.0 及以上版本，必须使用前台服务
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to start TimeTickService", e);
        }
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        Log.d(TAG, "onDisabled called. Stopping TimeTickService.");
        // 当最后一个小部件被从主屏幕移除时，停止我们的服务
        try {
            Intent intent = new Intent(context, TimeTickService.class);
            context.stopService(intent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop TimeTickService", e);
        }
    }
}
