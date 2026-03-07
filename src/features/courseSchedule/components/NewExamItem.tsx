import {Pressable, StyleSheet} from "react-native";
import {useUserConfig} from "@/hooks/app.ts";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import React, {memo, useMemo} from "react";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";

interface NewExamItemProps {
    item: ScheduleTableItem;
    onPress?: (item: ScheduleTableItem) => void;
}

export const NewExamItem = memo(({item, onPress}: NewExamItemProps) => {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const span = item.end - item.begin + 1;
    const y = item.begin - 1;

    // Replicate legacy color logic
    const baseColor = item.color ?? getColor({title: item.title, kind: "exam"}) ?? theme.colors.primary;
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
                        (item.end - item.begin + 1) * userConfig.theme.course.timeSpanHeight -
                        userConfig.theme.course.courseItemMargin * 2,
                    top:
                        userConfig.theme.course.weekdayHeight +
                        (item.begin - 1) * userConfig.theme.course.timeSpanHeight +
                        userConfig.theme.course.courseItemMargin,
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
            }),
        [backgroundColor, textColor, span, y, userConfig.theme.course],
    );

    return (
        <Pressable style={styles.container} onPress={() => onPress?.(item)} android_ripple={userConfig.theme.ripple}>
            <Flex direction="column" gap={2} style={{padding: 4, height: "100%", overflow: "hidden"}} align="center">
                <Text style={[styles.text, {fontWeight: "bold"}]} numberOfLines={5}>
                    {item.title}
                </Text>

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
