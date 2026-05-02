import {Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle} from "react-native";
import moment from "moment/moment";
import {Color} from "@/shared/color.ts";
import {BottomSheet, Text, useTheme} from "@rneui/themed";
import {ReactNode, useEffect, useMemo, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {useCourse} from "@/hooks/useCourse.ts";
import {useShift} from "@/features/courseSchedule/hooks/detail/useShift.ts";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {NewCourseItem} from "@/features/courseSchedule/components/NewCourseItem.tsx";
import {HolidayItem} from "@/features/courseSchedule/components/HolidayItem.tsx";
import {NewExamItem} from "@/features/courseSchedule/components/NewExamItem.tsx";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {useCoursePriority} from "@/features/courseSchedule/hooks/useCoursePriority.ts";

export interface TimeScheduleProps {
    /** 学期的第一天 */
    startDay?: moment.MomentInput;
    /** 课表当前周，1-20 */
    currentWeek?: number;
    /** 是否显示表头日期，如果不显示日期，左上角显示为周数，否则为第一天所在月份 */
    showDate?: boolean;
    /** 是否显示时间段高亮 */
    showTimeSpanHighlight?: boolean;
    /** 时候高亮今日，通过第一天和周数计算后和系统时间进行比对 */
    showDayHighlight?: boolean;

    scheduleItems?: ScheduleTableItem[];

    scheduleItemRender?: (item: ScheduleTableItem) => ReactNode;

    onItemPress?: (item: ScheduleTableItem) => void;
}

// 解决冲突和课表重叠
function groupByConflict(items: ScheduleTableItem[]): ScheduleTableItem[][] {
    const holidays = items.filter(i => i.kind === "holiday");
    const others = items.filter(i => i.kind !== "holiday");
    const groups: ScheduleTableItem[][] = holidays.map(h => [h]);
    for (const item of others) {
        const target = groups.find(g =>
            g.some(x => x.kind !== "holiday" && x.begin <= item.end && item.begin <= x.end),
        );
        if (target) {
            target.push(item);
        } else {
            groups.push([item]);
        }
    }
    return groups;
}

export function TimeSchedule(props: TimeScheduleProps) {
    const {store: ucStore} = useUserConfig();
    const {store, courseScheduleStyle} = useCourse();
    const weekdayList = store(s => s.weekdayList);
    const timeSpanList = store(s => s.timeSpanList);
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const {theme} = useTheme();
    const startDay = moment(props.startDay ?? ucStore(s => s.jw.startDay));
    const [currentTime, setCurrentTime] = useState(moment().format());
    const currentWeek = props.currentWeek ?? Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());
    const currentTimeSpan = getCurrentTimeSpan();
    const [conflictState, setConflictState] = useState<{group: ScheduleTableItem[]; key: string} | null>(null);
    const {getPriority, setPriority} = useCoursePriority();

    useEffect(() => {
        // 时间段刷新定时器
        if (props.showTimeSpanHighlight) {
            const id = setInterval(() => setCurrentTime(moment().format()), 5000);
            return () => {
                clearInterval(id);
            };
        }
    }, [props.showTimeSpanHighlight]);

    // 计算当前时间段
    function getCurrentTimeSpan() {
        let res = -1;
        timeSpanList.forEach((timeSpan, index, list) => {
            const start = index > 0 ? list[index - 1].split("\n")[1] : "00:00";
            const end = timeSpan.split("\n")[1];
            const startTime = moment(start, "hh:mm");
            const endTime = moment(end, "hh:mm");
            if (moment(currentTime).isBetween(startTime, endTime, undefined, "[]")) {
                res = index;
                return;
            }
        });
        return res > -1 ? res : null;
    }

    // 计算时间段的Top
    const timeSpanHighLightTop = {
        top:
            weekdayHeight +
            (currentTimeSpan ?? 1) * timeSpanHeight +
            10,
    };

    // 生成短的时间段元素列表
    const shortTimeSpanList: [number | string, string][] = Array(Math.ceil(timeSpanList.length / 2))
        .fill(0)
        .map((_, index) =>
            timeSpanList[index * 2 + 1] !== undefined
                ? [
                      `${index * 2 + 1} - ${index * 2 + 2}`,
                      timeSpanList[index * 2].split("\n")[0] +
                          "\n" +
                          timeSpanList[index * 2 + 1].split("\n")[1],
                  ]
                : [index * 2 + 1, timeSpanList[index * 2]],
        );

    // 新链路
    const scheduleItemMap = useMemo(() => {
        const map = new Map<string, ScheduleTableItem[]>();
        (props.scheduleItems ?? []).forEach(item => {
            const key = `${item.week}-${item.day}`;
            const list = map.get(key) ?? [];
            list.push(item);
            map.set(key, list);
        });
        return map;
    }, [props.scheduleItems]);

    return (
        <View style={courseScheduleStyle.courseSchedule}>
            {/*时间段高亮*/}
            {typeof currentTimeSpan === "number" && props.showTimeSpanHighlight && (
                <View style={[timeSpanHighLightTop, courseScheduleStyle.timeSpanHighLight]} />
            )}
            {/*时间表渲染*/}
            <View style={[courseScheduleStyle.weekdayContainer, courseScheduleStyle.timeSpanContainer]}>
                <View style={courseScheduleStyle.weekdayItem}>
                    {props.showDate ? (
                        <>
                            <Text style={courseScheduleStyle.weekdayText}>
                                {startDay.clone().add(currentWeek, "w").month() + 1 + "月"}
                            </Text>
                            <Text style={courseScheduleStyle.weekdayText}>{`第${currentWeek}周`}</Text>
                        </>
                    ) : (
                        <Text style={courseScheduleStyle.weekdayText}>{`第${currentWeek}周`}</Text>
                    )}
                </View>
                {/*时间段*/}
                {timeSpanHeight > 40
                    ? timeSpanList.map((time, index) => (
                          <Flex
                              inline
                              key={`timespan-${index}`}
                              style={courseScheduleStyle.timeSpanItem}
                              justify="center">
                              <Text style={courseScheduleStyle.timeSpanText}>{`${index + 1}\n${time}`}</Text>
                          </Flex>
                      ))
                    : shortTimeSpanList.map((value, index) => (
                          <Flex
                              inline
                              key={`timespan-${index}`}
                              style={[
                                  courseScheduleStyle.timeSpanItem,
                                  {height: timeSpanHeight * 2},
                              ]}
                              justify="center">
                              <Text style={courseScheduleStyle.timeSpanText}>{`${value[0]}\n${value[1]}`}</Text>
                          </Flex>
                      ))}
            </View>
            {/*课表*/}
            {weekdayList.map((weekday, index) => {
                // 判断是否为当天
                const currentDay = startDay.clone().add({
                    week: currentWeek - 1,
                    day: index,
                });
                const itemStyle = StyleSheet.create({
                    activeContainer: {
                        backgroundColor: Color(theme.colors.primary).setAlpha(0.2).rgbaString,
                    },
                    activeText: {},
                });
                // 生成合并的样式
                const weekdayContainerStyle: StyleProp<ViewStyle> = [courseScheduleStyle.weekdayContainer];
                const weekdayTextStyle: StyleProp<TextStyle> = [courseScheduleStyle.weekdayText];
                if (currentDay.isSame(moment(), "day") && props.showDayHighlight) {
                    weekdayContainerStyle.push(itemStyle.activeContainer);
                    weekdayTextStyle.push(itemStyle.activeText);
                }
                const currentDayScheduleItems = scheduleItemMap.get(`${currentWeek}-${currentDay.isoWeekday()}`) ?? [];

                return (
                    // 当日课程渲染
                    <View style={weekdayContainerStyle} key={`day-${currentWeek}-${weekday}-${index}`}>
                        {/* 日期部分 */}
                        <View style={courseScheduleStyle.weekdayItem}>
                            <Text style={weekdayTextStyle}>
                                {props.showDate
                                    ? `${weekday}${currentDayScheduleItems.some(i => i.isShift) ? "(调)" : ""}\n` +
                                      `${currentDay.month() + 1}-${currentDay.date()}`
                                    : `${weekday}`}
                            </Text>
                        </View>
                        {groupByConflict(currentDayScheduleItems).map(group => {
                            const groupKey = group.map(i => i.id).sort().join("|");
                            const sortedGroup = [...group].sort((a, b) => getPriority(b.id) - getPriority(a.id));
                            const displayItem = sortedGroup[0];
                            switch (displayItem.kind) {
                                case "exam":
                                    return (
                                        <NewExamItem
                                            key={groupKey}
                                            item={{...displayItem, color: displayItem.color ?? "#ff4d4f"}}
                                            onPress={item => console.log("Exam pressed", item)}
                                        />
                                    );
                                case "holiday":
                                    return <HolidayItem key={groupKey} item={displayItem} />;
                                default:
                                    return (
                                        <NewCourseItem
                                            key={groupKey}
                                            item={displayItem}
                                            conflictCount={group.length}
                                            onPress={
                                                group.length > 1
                                                    ? () => setConflictState({group: sortedGroup, key: groupKey})
                                                    : props.onItemPress
                                            }
                                        />
                                    );
                            }
                        })}
                    </View>
                );
            })}

            <BottomSheet isVisible={conflictState !== null} onBackdropPress={() => setConflictState(null)}>
                <View style={{backgroundColor: theme.colors.background, padding: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8}}>
                    <Text style={{fontSize: 16, fontWeight: "bold", marginBottom: 4}}>选择显示的课程</Text>
                    <Text style={{fontSize: 12, color: theme.colors.grey3, marginBottom: 12}}>点击置顶将永久优先显示该课程</Text>
                    {conflictState?.group.map(conflictItem => {
                        const maxPriority = Math.max(...conflictState.group.map(i => getPriority(i.id)));
                        const isTop = conflictItem.id === conflictState.group[0].id;
                        return (
                            <Pressable
                                key={conflictItem.id}
                                onPress={() => {
                                    if (isTop) {
                                        setConflictState(null);
                                        props.onItemPress?.(conflictItem);
                                    } else {
                                        setPriority(conflictItem.id, maxPriority + 1);
                                        setConflictState(null);
                                    }
                                }}
                                style={{
                                    paddingVertical: 12,
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderBottomColor: theme.colors.greyOutline,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 15, fontWeight: "500"}}>{conflictItem.title}</Text>
                                    {!!conflictItem.teacher && (
                                        <Text style={{fontSize: 13, color: theme.colors.grey3}}>{conflictItem.teacher}</Text>
                                    )}
                                    {!!conflictItem.location && (
                                        <Text style={{fontSize: 13, color: theme.colors.grey3}}>{conflictItem.location}</Text>
                                    )}
                                </View>
                                <Text style={{fontSize: 13, color: isTop ? theme.colors.primary : theme.colors.grey3}}>
                                    {isTop ? "当前显示" : "置顶"}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </BottomSheet>
        </View>
    );
}
