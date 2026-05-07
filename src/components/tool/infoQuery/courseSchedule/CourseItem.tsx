import React, {useMemo} from "react";
import {Pressable, StyleSheet, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {CourseClass} from "@/class/jw/course.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {useCourseData} from "@/hooks/useCourse.ts";
import {AttendanceStateIcon} from "@/features/courseSchedule/components/AttendanceStateIcon.tsx";

interface Props {
    style?: ViewStyle;
    course: CourseClass;
    attendanceState?: AST.AttendanceState;
    onCoursePress?: (course: CourseClass) => void;
}

export function CourseItem(props: Props) {
    const {store: ucStore} = useUserConfig();
    const {store, courseScheduleStyle} = useCourseData();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const courseInfoVisible = store(s => s.courseInfoVisible);
    const {theme} = useTheme();
    const {course} = props;
    const span = parseInt(course._ori.jcs.split("-")[1], 10) - parseInt(course._ori.jcs.split("-")[0], 10) + 1;
    const y = +course._ori.jcs.split("-")[0] - 1;
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            course: {
                height: span * timeSpanHeight - courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(course._ori.backgroundColor ?? theme.colors.primary).setAlpha(
                    theme.mode === "light" ? 0.3 : 0.1,
                ).rgbaString,
                top:
                    weekdayHeight +
                    y * timeSpanHeight +
                    courseItemMargin,
            },
            text: {
                textAlign: "center",
                color: Color.mix(course._ori.backgroundColor ?? theme.colors.primary, theme.colors.black, 0.5).rgbaString,
            },
        });
    }, [
        course._ori.backgroundColor,
        courseItemMargin,
        timeSpanHeight,
        weekdayHeight,
        span,
        theme.colors.grey4,
        theme.mode,
        y,
    ]);
    return (
        // 课程元素
        <Pressable
            onPress={e => {
                props.onCoursePress?.(course);
            }}
            android_ripple={ucStore(s => s.theme.ripple)}
            style={[props.style, itemStyle.course, courseScheduleStyle.courseItem]}>
            <Flex direction="column" gap={5}>
                {courseInfoVisible.name && (
                    <Text style={[itemStyle.text, {fontWeight: 700}]}>
                        {props.attendanceState && (
                            <AttendanceStateIcon
                                defaultColor={itemStyle.text.color}
                                state={props.attendanceState ?? AST.AttendanceState.NotStarted}
                            />
                        )}
                        {courseInfoVisible.name && course._ori.jxbsftkbj === "1" && (
                            <Text style={itemStyle.text}>
                                <Icon name="clock-star-four-points" color={itemStyle.text.color} />调
                            </Text>
                        )}
                        {course._ori.kcmc}
                    </Text>
                )}
                {courseInfoVisible.position && (
                    <Text style={itemStyle.text}>
                        <Icon name="map-marker" style={itemStyle.text} />
                        {"\n" + course._ori.cdmc.replace("-", "\n")}
                    </Text>
                )}
                {courseInfoVisible.teacher && (
                    <Text style={itemStyle.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={itemStyle.text} />
                        {"\n" + course._ori.xm}
                    </Text>
                )}
            </Flex>
        </Pressable>
    );
}
