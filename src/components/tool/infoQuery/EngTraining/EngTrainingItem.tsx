import React, {useContext, useMemo} from "react";
import {StyleSheet, ViewStyle} from "react-native";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";

type EngTrainingExp = {
    date: string;
    name: string;
    y: number;
    span: number;
    backgroundColor: string;
    type: "engTrainingExp";
};
interface Props {
    style?: ViewStyle;
    item: EngTrainingExp;
}

export function EngTrainingItem(props: Props) {
    const {userConfig} = useContext(UserConfigContext);
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const {theme} = useTheme();
    const {item} = props;
    const {span, y} = item;
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            item: {
                height: span * userConfig.theme.course.timeSpanHeight - userConfig.theme.course.courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(item.backgroundColor ?? theme.colors.primary).setAlpha(
                    theme.mode === "light" ? 0.3 : 0.1,
                ).rgbaString,
                top:
                    userConfig.theme.course.weekdayHeight +
                    y * userConfig.theme.course.timeSpanHeight +
                    userConfig.theme.course.courseItemMargin,
                zIndex: -1,
            },
            text: {
                textAlign: "center",
                color: Color.mix(item.backgroundColor ?? theme.colors.primary, theme.colors.black, 0.5).rgbaString,
            },
        });
    }, [
        item.backgroundColor,
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
        <Flex direction="column" gap={5} style={[itemStyle.item, courseScheduleStyle.courseItem]}>
            <Icon name="tools" style={itemStyle.text} />
            <Text style={[itemStyle.text, {fontWeight: 700}]}>金工实训</Text>
            {courseScheduleData.courseInfoVisible.name && (
                <Text style={[itemStyle.text, {fontWeight: 700}]}>{item.name}</Text>
            )}
        </Flex>
    );
}
