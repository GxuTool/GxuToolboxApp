import {Pressable, StyleSheet} from "react-native";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {useCourseData} from "@/hooks/useCourseData.ts";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {memo, useMemo} from "react";
import {Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {useBlocksColor} from "@/features/courseSchedule/hooks/useBlocksColor.ts";
import {useShallow} from "zustand/react/shallow";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";

interface NewExamItemProps {
    item: ScheduleTableItem<ExamInfo>;
    onPress?: (item: ScheduleTableItem<ExamInfo>) => void;
}
export const NewExamItem = memo(({item, onPress}: NewExamItemProps) => {
    const {store: ucStore} = useUserConfig();
    const {store} = useCourseData();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const {theme} = useTheme();
    const {getColor} = useBlocksColor();

    const span = item.end - item.begin + 1;
    const y = item.begin - 1;
    const baseColor = item.color ?? getColor({title: item.title, kind: "exam"}) ?? theme.colors.error;
    const backgroundColor = Color(baseColor).setAlpha(theme.mode === "light" ? 0.22 : 0.12).rgbaString;
    const textColor = Color.mix(baseColor, theme.colors.black, 0.55).rgbaString;

    const seat = item.seat || (item.subtitle?.match(/<(.+?)>/)?.[1] ?? "");

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    position: "absolute",
                    width: "96%",
                    marginHorizontal: "2%",
                    borderRadius: 6,
                    borderTopWidth: 3,
                    borderTopColor: baseColor,
                    backgroundColor: backgroundColor,
                    height: span * timeSpanHeight - courseItemMargin * 2,
                    top: y * timeSpanHeight + courseItemMargin,
                    overflow: "hidden",
                },
                text: {
                    textAlign: "center",
                    color: textColor,
                    fontSize: 12,
                },
                badge: {
                    fontSize: 12,
                    fontWeight: "700",
                    color: textColor,
                    opacity: 0.9,
                },
                title: {
                    textAlign: "center",
                    color: textColor,
                    fontSize: 12,
                    fontWeight: "700",
                },
                meta: {
                    textAlign: "center",
                    color: textColor,
                    fontSize: 10,
                    opacity: 0.95,
                },
                icon: {
                    color: textColor,
                    fontSize: 11,
                },
            }),
        [span, y, store(useShallow(s => s.theme)), baseColor],
    );

    return (
        <Pressable
            style={styles.container}
            onPress={() => onPress?.(item)}
            android_ripple={ucStore(s => s.theme.ripple)}>
            <Flex direction="column" gap={2} style={{padding: 4, paddingTop: 10, height: "100%"}} align="center">
                <Text style={styles.badge}>考试</Text>
                <Text style={styles.title}>{item.title}</Text>
                {!!item.location && (
                    <Text style={styles.meta}>
                        <Icon name="map-marker" style={styles.icon} />
                        {"\n" + item.location.replace("-", "\n")}
                    </Text>
                )}
                {!!seat && <Text style={styles.meta}>{`${seat}`}</Text>}
            </Flex>
        </Pressable>
    );
});
