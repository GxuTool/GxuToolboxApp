import React, {useMemo} from "react";
import {Pressable, StyleSheet, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {AttendanceCourseClass, AttendanceDataClass} from "@/class/auth/attendanceSystem.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {useCourseData} from "@/hooks/useCourse.ts";
import {AttendanceStateIcon} from "@/features/courseSchedule/components/AttendanceStateIcon.tsx";

interface Props {
    style?: ViewStyle;
    course: AttendanceCourseClass;
    attendanceData?: AttendanceDataClass;
    onCoursePress?: (course: AttendanceCourseClass) => void;
}

export function AttendanceCourseItem(props: Props) {
    const {store: ucStore} = useUserConfig();
    const {store, courseScheduleStyle} = useCourseData();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const courseInfoVisible = store(s => s.courseInfoVisible);
    const {theme} = useTheme();
    const ColorMap = {
        [AST.AttendanceState.Normal]: theme.colors.success,
        [AST.AttendanceState.Late]: theme.colors.warning,
        [AST.AttendanceState.Absent]: theme.colors.error,
        [AST.AttendanceState.NotStarted]: theme.colors.primary,
        [AST.AttendanceState.NoNeed]: theme.colors.primary,
    };
    const {course} = props;
    const span = course._ori.periodArry!.reduceRight((pv, cv) => pv - cv) + 1;
    const y = course._ori.periodArry![0];
    const attendanceState = props.attendanceData?.getAttendanceStateByDate(
        props.course._ori.weekDay!,
        props.course._ori.periodArry![0],
    );
    const color = ColorMap[attendanceState!];
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            course: {
                height: span * timeSpanHeight - courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(color ?? theme.colors.primary).setAlpha(theme.mode === "light" ? 0.3 : 0.1)
                    .rgbaString,
                top:
                    weekdayHeight +
                    y * timeSpanHeight +
                    courseItemMargin,
            },
            text: {
                textAlign: "center",
                color: Color.mix(color ?? theme.colors.primary, theme.colors.black, 0.5).rgbaString,
            },
        });
    }, [
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
                        <AttendanceStateIcon
                            defaultColor={itemStyle.text.color}
                            state={attendanceState ?? AST.AttendanceState.NotStarted}
                        />
                        {course._ori.subjectName}
                    </Text>
                )}
                {courseInfoVisible.position && (
                    <Text style={itemStyle.text}>
                        <Icon name="map-marker" style={itemStyle.text} />
                        {"\n" + course._ori.roomName!.replace("-", "\n")}
                    </Text>
                )}
                {courseInfoVisible.teacher && (
                    <Text style={itemStyle.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={itemStyle.text} />
                        {"\n" + course._ori.teacherName}
                    </Text>
                )}
            </Flex>
        </Pressable>
    );
}
