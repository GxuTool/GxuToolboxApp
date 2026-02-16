import React, {useContext, useMemo} from "react";
import {Pressable, StyleSheet, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {AttendanceCourseClass, AttendanceDataClass} from "@/class/auth/attendanceSystem.ts";
import {useUserConfig} from "@/hooks/app.ts";

interface Props {
    style?: ViewStyle;
    course: AttendanceCourseClass;
    attendanceData?: AttendanceDataClass;
    onCoursePress?: (course: AttendanceCourseClass) => void;
}

export function AttendanceCourseItem(props: Props) {
    const {userConfig} = useUserConfig();
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const {theme} = useTheme();
    const ColorMap = {
        [AST.AttendanceState.Normal]: theme.colors.success,
        [AST.AttendanceState.Late]: theme.colors.warning,
        [AST.AttendanceState.Absent]: theme.colors.error,
        [AST.AttendanceState.NotStarted]: theme.colors.primary,
        [AST.AttendanceState.NoNeed]: theme.colors.primary,
    };
    const {course} = props;
    const span = course.periodArry!.reduceRight((pv, cv) => pv - cv) + 1;
    const y = course.periodArry![0];
    const attendanceState = props.attendanceData?.getAttendanceStateByDate(
        props.course.weekDay!,
        props.course.periodArry![0],
    );
    const color = ColorMap[attendanceState!];
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            course: {
                height: span * userConfig.theme.course.timeSpanHeight - userConfig.theme.course.courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(color ?? theme.colors.primary).setAlpha(theme.mode === "light" ? 0.3 : 0.1)
                    .rgbaString,
                top:
                    userConfig.theme.course.weekdayHeight +
                    y * userConfig.theme.course.timeSpanHeight +
                    userConfig.theme.course.courseItemMargin,
            },
            text: {
                textAlign: "center",
                color: Color.mix(color ?? theme.colors.primary, theme.colors.black, 0.5).rgbaString,
            },
        });
    }, [
        userConfig.theme.course.courseItemMargin,
        userConfig.theme.course.timeSpanHeight,
        userConfig.theme.course.weekdayHeight,
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
            android_ripple={userConfig.theme.ripple}
            style={[props.style, itemStyle.course, courseScheduleStyle.courseItem]}>
            <Flex direction="column" gap={5}>
                {courseScheduleData.courseInfoVisible.name && (
                    <Text style={[itemStyle.text, {fontWeight: 700}]}>
                        <AttendanceStateIcon
                            defaultColor={itemStyle.text.color}
                            state={attendanceState ?? AST.AttendanceState.NotStarted}
                        />
                        {course.subjectName}
                    </Text>
                )}
                {courseScheduleData.courseInfoVisible.position && (
                    <Text style={itemStyle.text}>
                        <Icon name="map-marker" style={itemStyle.text} />
                        {"\n" + course.roomName!.replace("-", "\n")}
                    </Text>
                )}
                {courseScheduleData.courseInfoVisible.teacher && (
                    <Text style={itemStyle.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={itemStyle.text} />
                        {"\n" + course.teacherName}
                    </Text>
                )}
            </Flex>
        </Pressable>
    );
}

export interface AttendanceStateIconProps {
    state: AST.AttendanceState;
    defaultColor: string;
}
export function AttendanceStateIcon(props: AttendanceStateIconProps) {
    const {theme} = useTheme();
    const iconMap: Record<AST.AttendanceState, React.ReactElement> = {
        [AST.AttendanceState.Normal]: <Icon name="check-circle" color={theme.colors.success} />,
        [AST.AttendanceState.Late]: <Icon name="clock" color={theme.colors.warning} />,
        [AST.AttendanceState.Absent]: <Icon name="close-circle" color={theme.colors.error} />,
        [AST.AttendanceState.NotStarted]: <Icon name="circle-outline" color={props.defaultColor} />,
        [AST.AttendanceState.NoNeed]: <Icon name="minus-circle" color={props.defaultColor} />,
    };
    return iconMap[props.state];
}
