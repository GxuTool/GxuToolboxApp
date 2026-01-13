import {GestureResponderEvent, PanResponder, PanResponderGestureState, ScrollView, View} from "react-native";
import {ScheduleCard} from "@/components/app/ScheduleCard.tsx";
import React, {useRef, useState} from "react";
import {UpdateCard} from "@/components/UpdateCard.tsx";

export function HomeScreen() {
    // 滚动相关状态和引用
    const scrollViewRef = useRef<ScrollView>(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    // 配置参数
    const ASPECT_RATIO_THRESHOLD = 2; // 垂直/水平移动比例阈值
    const MIN_GESTURE_DISTANCE = 5; // 最小手势移动距离

    // 手势控制器
    const panResponder = PanResponder.create({
        // 判断是否响应手势
        onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            const dx = Math.abs(gestureState.dx);
            const dy = Math.abs(gestureState.dy);

            // 计算手势速度
            const velocity = Math.sqrt(Math.pow(gestureState.vx, 2) + Math.pow(gestureState.vy, 2));

            // 确定移动方向和是否触发滚动
            if (dx > dy && dx > MIN_GESTURE_DISTANCE) {
                setScrollEnabled(false); // 水平滑动时禁用垂直滚动
                return false;
            }

            if (dy > dx && dy > MIN_GESTURE_DISTANCE) {
                // 垂直移动距离需要大于水平移动的阈值倍数
                const ratio = dy / dx;
                const shouldScroll = ratio > ASPECT_RATIO_THRESHOLD;
                setScrollEnabled(shouldScroll);
                return shouldScroll;
            }

            return false;
        },

        // 手势移动时的处理
        onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            // 可以在这里添加额外的移动逻辑
        },

        // 手势结束时的处理
        onPanResponderRelease: () => {
            setScrollEnabled(true);
        },
        onPanResponderEnd: () => {
            setScrollEnabled(true);
        },

        // 手势被打断时的处理
        onPanResponderTerminate: () => {
            setScrollEnabled(true);
        },

        // 初始触摸时不拦截
        onStartShouldSetPanResponder: () => false,

        // 允许其他组件请求接管响应者
        onPanResponderTerminationRequest: () => true,
    });

    return (
        <View {...panResponder.panHandlers}>
            <ScrollView
                ref={scrollViewRef}
                // 基础滚动配置
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                decelerationRate="normal"
                // 视觉和行为配置
                bounces={true}
                overScrollMode="always"
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                // 样式配置
                contentContainerStyle={{
                    paddingVertical: 0,
                }}>
                <UpdateCard />
                {/*<ComingExamCard />*/}
                <ScheduleCard />
            </ScrollView>
        </View>
    );
}
