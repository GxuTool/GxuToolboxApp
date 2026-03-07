import {Pressable, StyleSheet, View} from "react-native";
import {useUserConfig} from "@/hooks/app.ts";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {memo, useMemo} from "react";
import {Color} from "@/shared/color.ts";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";

interface HolidayItemProps {
    item: ScheduleTableItem;
    onPress?: (item: ScheduleTableItem) => void;
}

export const HolidayItem = memo(({item, onPress}: HolidayItemProps) => {
    const {userConfig} = useUserConfig();
    const {theme} = useTheme();

    const span = item.end - item.begin + 1;
    const y = item.begin - 1;

    // Holiday styling: Warm colors by default, translucent background
    const baseColor = item.color ?? theme.colors.warning;
    const backgroundColor = Color(baseColor).setAlpha(0.12).rgbaString;
    const borderColor = baseColor;
    const textColor = Color.mix(baseColor, theme.colors.black, 0.7).rgbaString;

    // Dynamic layout based on span
    const isFullDay = span >= 8; // If holiday covers most of the day
    const isShort = span <= 2;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            position: "absolute",
            width: "96%",
            marginHorizontal: "2%",
            borderRadius: 6,
            backgroundColor: backgroundColor,
            height:
                (item.end - item.begin + 1) * userConfig.theme.course.timeSpanHeight -
                userConfig.theme.course.courseItemMargin * 2,
            top:
                userConfig.theme.course.weekdayHeight +
                (item.begin - 1) * userConfig.theme.course.timeSpanHeight +
                userConfig.theme.course.courseItemMargin,overflow: "hidden",
            // Design change: Top accent border (like a sticky note) instead of left border
            borderTopWidth: 4,
            borderTopColor: borderColor,
            justifyContent: "flex-start",
            paddingTop: 16,
            alignItems: "center",
        },
        watermark: {
            position: "absolute",
            bottom: isFullDay ? "10%" : -10,
            right: isFullDay ? "10%" : -10,
            opacity: 0.15,
            transform: [{rotate: "-10deg"}]
        },
        text: {
            textAlign: "center",
            color: textColor,
            fontSize: isFullDay ? 16 : 12, // Larger text for full-day holidays
            fontWeight: "bold",
            zIndex: 1,
            letterSpacing: 1,
        },
        subText: {
            textAlign: "center",
            color: textColor,
            fontSize: 10,
            opacity: 0.8,
            marginTop: 2,
            zIndex: 1,
        }
    }), [backgroundColor, borderColor, textColor, span, y, userConfig.theme.course, isFullDay]);

    return (
        <Pressable
            style={styles.container}
            onPress={() => onPress?.(item)}
            android_ripple={userConfig.theme.ripple}
        >
            {/* Watermark Icon - Scaled up for impact */}
            <View style={styles.watermark}>
                <Icon
                    name="beach"
                    style={{
                        fontSize: isFullDay ? 80 : 40,
                        color: baseColor
                    }}
                />
            </View>

            <Text style={styles.text} numberOfLines={isShort ? 1 : 2}>
                {item.title}
            </Text>

            {!!item.subtitle && !isShort && (
                <Text style={styles.subText} numberOfLines={1}>
                    {item.subtitle}
                </Text>
            )}
        </Pressable>
    );
});
