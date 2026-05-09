import {StyleSheet} from "react-native";
import {useCourseData} from "@/hooks/useCourseData.ts";
import React, {memo, useMemo} from "react";
import {Color} from "@/shared/color.ts";
import {UnPressable} from "@/components/un-ui";
import Flex from "@/components/un-ui/Flex.tsx";
import {Badge, Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";
import {useConflictCourseStore} from "@/features/courseSchedule/stores/useConflictCourseStore.ts";
import {Course} from "@/type/infoQuery/course/course.ts";
import {useShallow} from "zustand/react/shallow";

interface StackCourseItemProps {
    course: Course[];
    activeCourse: Course["kch"];
    timeRange: [number, number];
    onPress?: (courses: Course[]) => void;
}

export const StackCourseItem = memo(({course, activeCourse, timeRange, onPress}: StackCourseItemProps) => {
    const {store} = useCourseData();
    const {store: conflictStore} = useConflictCourseStore();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const courseKchs = useMemo(() => course.map(c => c.kch).sort(), [course]);
    const storedActive = conflictStore(s => s.getActive(courseKchs));
    const effectiveActive = storedActive ?? activeCourse;

    const active = course.find(c => c.kch === effectiveActive) ?? course[0];

    const handlePress = () => {
        onPress?.(course);
    };

    const span = timeRange[1] - timeRange[0] + 1;
    const y = timeRange[0] - 1;

    const baseColor = getColor({title: active.kcmc, kind: "course"}) ?? theme.colors.primary;
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
                    height: span * timeSpanHeight - courseItemMargin * 2,
                    top: y * timeSpanHeight + courseItemMargin,
                },
                text: {
                    textAlign: "center",
                    color: textColor,
                    fontSize: 12,
                },
                badge: {
                    backgroundColor: Color.mix(theme.colors.primary, theme.colors.background, 0.35).setAlpha(0.95)
                        .rgbaString,
                    height: 14,
                },
                badgeContainer: {
                    position: "absolute",
                    top: -6,
                    right: -8,
                    zIndex: 1,
                },
            }),
        [span, y, store(useShallow(s => s.theme)), baseColor],
    );

    return (
        <UnPressable style={styles.container} onPress={handlePress}>
            {course.length > 1 && (
                <Badge
                    value={course.length}
                    status="primary"
                    textStyle={{fontSize: 10}}
                    containerStyle={styles.badgeContainer}
                    badgeStyle={styles.badge}
                />
            )}
            <Flex
                direction="column"
                gap={2}
                style={{
                    padding: 4,
                    height: "100%",
                    overflow: "hidden",
                }}
                align="center">
                <Text style={[styles.text, {fontWeight: "bold"}]} numberOfLines={5}>
                    {active.jxbsftkbj === "1" && (
                        <Text style={{color: theme.colors.warning, fontSize: 12, fontWeight: "bold"}}>(调) </Text>
                    )}
                    {active.kcmc}
                </Text>
                {!!active.cdmc && (
                    <Text style={styles.text}>
                        <Icon name="map-marker" size={12} color={textColor} />
                        {"\n" + active.cdmc.replace("-", "\n")}
                    </Text>
                )}
                {!!active.xm && (
                    <Text style={styles.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={styles.text} />
                        {"\n" + active.xm}
                    </Text>
                )}
            </Flex>
        </UnPressable>
    );
});
