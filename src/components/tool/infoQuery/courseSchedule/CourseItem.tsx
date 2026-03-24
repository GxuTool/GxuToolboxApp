import React, {useContext, useMemo} from "react";
import {Pressable, StyleSheet, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {Course} from "@/type/infoQuery/course/course.ts";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {useUserConfig} from "@/hooks/app.ts";

interface Props {
    style?: ViewStyle;
    course: Course;
    attendanceState?: AST.AttendanceState;
    onCoursePress?: (course: Course) => void;
}

export function CourseItem(props: Props) {
    const {userConfig} = useUserConfig();
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const {theme} = useTheme();
    const {course} = props;
    const span = parseInt(course.jcs.split("-")[1], 10) - parseInt(course.jcs.split("-")[0], 10) + 1;
    const y = +course.jcs.split("-")[0] - 1;
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            course: {
                height: span * userConfig.theme.course.timeSpanHeight - userConfig.theme.course.courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(course.backgroundColor ?? theme.colors.primary).setAlpha(
                    theme.mode === "light" ? 0.3 : 0.1,
                ).rgbaString,
                top:
                    userConfig.theme.course.weekdayHeight +
                    y * userConfig.theme.course.timeSpanHeight +
                    userConfig.theme.course.courseItemMargin,
            },
            text: {
                textAlign: "center",
                color: Color.mix(course.backgroundColor ?? theme.colors.primary, theme.colors.black, 0.5).rgbaString,
            },
        });
    }, [
        course.backgroundColor,
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
                        {props.attendanceState && (
                            <AttendanceStateIcon
                                defaultColor={itemStyle.text.color}
                                state={props.attendanceState ?? AST.AttendanceState.NotStarted}
                            />
                        )}
                        {courseScheduleData.courseInfoVisible.name && course.jxbsftkbj === "1" && (
                            <Text style={itemStyle.text}>
                                <Icon name="clock-star-four-points" color={itemStyle.text.color} />调
                            </Text>
                        )}
                        {course.kcmc}
                    </Text>
                )}
                {courseScheduleData.courseInfoVisible.position && (
                    <Text style={itemStyle.text}>
                        <Icon name="map-marker" style={itemStyle.text} />
                        {"\n" + course.cdmc.replace("-", "\n")}
                    </Text>
                )}
                {courseScheduleData.courseInfoVisible.teacher && (
                    <Text style={itemStyle.text} ellipsizeMode="tail" numberOfLines={5}>
                        <Icon name="account" style={itemStyle.text} />
                        {"\n" + course.xm}
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
