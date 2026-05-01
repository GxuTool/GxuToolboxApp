import {Pressable, StyleSheet, View} from "react-native";
import {useUserConfig} from "@/hooks/app.ts";
import {useCourse} from "@/hooks/useCourse.ts";

import React, {memo, useMemo} from "react";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {AttendanceStateIcon} from "@/features/courseSchedule/components/AttendanceStateIcon.tsx";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";


interface NewCourseItemProps {
    item: ScheduleTableItem;
    onPress?: (item: ScheduleTableItem) => void;
    conflictCount?: number;
}

export const NewCourseItem = memo(({item, onPress, conflictCount}: NewCourseItemProps) => {
    const {userConfig} = useUserConfig();
    const {store} = useCourse();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const span = item.end - item.begin + 1;
    const y = item.begin - 1;

    // Replicate legacy color logic
    const baseColor = item.color ?? getColor({title: item.title, kind: "course"}) ?? theme.colors.primary;
    const backgroundColor = Color(baseColor).setAlpha(theme.mode === "light" ? 0.3 : 0.1).rgbaString;
    const textColor = Color.mix(baseColor, theme.colors.black, 0.5).rgbaString;

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    position: "absolute",
                    width: "96%",
                    marginHorizontal: "2%",
                    borderRadius: 5,
                    backgroundColor: backgroundColor,
                    height:
                        span * timeSpanHeight -
                        courseItemMargin * 2,
                    top:
                        weekdayHeight +
                        y * timeSpanHeight +
                        courseItemMargin,
                },
                text: {
                    textAlign: "center",
                    color: textColor,
                    fontSize: 12,
                },
                icon: {
                    color: textColor,
                    fontSize: 12,
                },
                badge: {
                    position: "absolute",
                    top: 3,
                    right: 3,
                    minWidth: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1,
                    paddingHorizontal: 3,
                },
                badgeText: {
                    color: textColor,
                    fontSize: 10,
                    fontWeight: "bold",
                },
            }),
        [backgroundColor, textColor, span, y, timeSpanHeight, weekdayHeight, courseItemMargin],
    );

    return (
        <Pressable style={styles.container} onPress={() => onPress?.(item)} android_ripple={userConfig.theme.ripple}>
            {conflictCount && conflictCount > 1 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conflictCount}</Text>
                </View>
            )}
            <Flex direction="column" gap={2} style={{padding: 4, paddingTop: conflictCount && conflictCount > 1 ? 18 : 4, height: "100%", overflow: "hidden"}} align="center">
                <Text style={[styles.text, {fontWeight: "bold"}]} numberOfLines={5}>
                    {item.status && (
                        <AttendanceStateIcon
                            defaultColor={styles.text.color}
                            state={item.status ?? AST.AttendanceState.NotStarted}
                        />
                    )}
                    {item.isShift && (
                        <Text style={{color: theme.colors.warning, fontSize: 12, fontWeight: "bold"}}>(调) </Text>
                    )}
                    {item.title}
                </Text>
                <Text style={styles.text}>{item.subtitle}</Text>

                {!!item.location && (
                    <Text style={styles.text}>
                        <Icon name="map-marker" size={12} color={textColor} />
                        {"\n" + item.location.replace("-", "\n")}
                    </Text>
                )}

                {!!item.teacher && (
                    <Text style={styles.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={styles.text} />
                        {"\n" + item.teacher}
                    </Text>
                )}
            </Flex>
        </Pressable>
    );
});
