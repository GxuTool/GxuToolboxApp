package com.gxu_tool_app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.reactnativeandroidwidget.RNWidgetJsCommunication;

public class TimeTickService extends Service {

    private static final String CHANNEL_ID = "TimeTickServiceChannel";
    private static final String TAG = "TimeTickService";

    private final BroadcastReceiver timeTickReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (Intent.ACTION_TIME_TICK.equals(intent.getAction())) {
                Log.d(TAG, "Time tick received, requesting widget update.");
                // 这就是关键的调用！
                // 它会触发 JS 端的 widgetTaskHandler
                RNWidgetJsCommunication.requestWidgetUpdate(context, "CourseScheduleWidgetProvider");
            }
        }
    };

    private boolean receiverRegistered = false;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service created.");
        // 注册广播接收器
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(timeTickReceiver, new IntentFilter(Intent.ACTION_TIME_TICK), Context.RECEIVER_NOT_EXPORTED);
            } else {
                registerReceiver(timeTickReceiver, new IntentFilter(Intent.ACTION_TIME_TICK));
            }
            receiverRegistered = true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to register receiver", e);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service started.");
        createNotificationChannel();
        // 创建一个前台服务通知，这是 Android 8.0+ 的要求
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("课程表小部件")
            .setContentText("小部件正在后台运行，以提供实时更新。")
            .setSmallIcon(R.mipmap.ic_launcher) // 重要：确保你有名为 ic_launcher 的图标资源
            .build();

        try {
            startForeground(1, notification);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start foreground", e);
            stopSelf();
            return START_NOT_STICKY;
        }

        // 如果服务被系统杀死，不要自动重启
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Service destroyed.");
        // 注销广播接收器，防止内存泄漏
        if (receiverRegistered) {
            try {
                unregisterReceiver(timeTickReceiver);
            } catch (Exception e) {
                Log.e(TAG, "Failed to unregister receiver", e);
            }
            receiverRegistered = false;
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        // 我们不提供绑定，所以返回 null
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "Time Tick Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
