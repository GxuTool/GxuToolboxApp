import {StyleProp, StyleSheet, TextStyle, View, ViewStyle} from "react-native";
import moment from "moment/moment";
import {Color} from "@/shared/color.ts";
import {Text, useTheme} from "@rneui/themed";
import {ReactNode, useContext, useEffect, useState} from "react";
import Flex from "@/components/un-ui/Flex.tsx";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {useUserConfig} from "@/hooks/app.ts";

export interface TimeScheduleItemData<T = any> {
    /** 元素数据 */
    data: T[];
    /** 元素渲染 */
    itemRender?: (item: T, onPressHook?: (item: T) => void) => ReactNode;
    /** 判断元素是否在当天渲染 */
    isItemShow?: (item: T, day: moment.Moment, week: number) => boolean;
}

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

    /** 自定义元素列表 */
    itemList?: TimeScheduleItemData[];
}

export function TimeSchedule(props: TimeScheduleProps) {
    const {userConfig} = useUserConfig();
    const {courseScheduleData, courseScheduleStyle} = useContext(CourseScheduleContext)!;
    const {theme} = useTheme();
    const startDay = moment(props.startDay ?? userConfig.jw.startDay);
    const [currentTime, setCurrentTime] = useState(moment().format());
    const currentWeek = props.currentWeek ?? Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());
    const currentTimeSpan = getCurrentTimeSpan();

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
        courseScheduleData.timeSpanList.forEach((timeSpan, index, list) => {
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
            userConfig.theme.course.weekdayHeight +
            (currentTimeSpan ?? 1) * userConfig.theme.course.timeSpanHeight +
            10,
    };

    // 生成短的时间段元素列表
    const shortTimeSpanList: [number | string, string][] = Array(Math.ceil(courseScheduleData.timeSpanList.length / 2))
        .fill(0)
        .map((_, index) =>
            courseScheduleData.timeSpanList[index * 2 + 1] !== undefined
                ? [
                      `${index * 2 + 1} - ${index * 2 + 2}`,
                      courseScheduleData.timeSpanList[index * 2].split("\n")[0] +
                          "\n" +
                          courseScheduleData.timeSpanList[index * 2 + 1].split("\n")[1],
                  ]
                : [index * 2 + 1, courseScheduleData.timeSpanList[index * 2]],
        );

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
                {userConfig.theme.course.timeSpanHeight > 40
                    ? courseScheduleData.timeSpanList.map((time, index) => (
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
                                  {height: userConfig.theme.course.timeSpanHeight * 2},
                              ]}
                              justify="center">
                              <Text style={courseScheduleStyle.timeSpanText}>{`${value[0]}\n${value[1]}`}</Text>
                          </Flex>
                      ))}
            </View>
            {/*内容渲染*/}
            {courseScheduleData.weekdayList.map((weekday, index) => {
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
                // 收集当天需要显示的所有自定义元素
                const currentDayItems: {item: TimeScheduleItemData; dataItem: any}[] = [];
                (props.itemList ?? []).forEach(itemLike => {
                    itemLike.data.forEach(dataItem => {
                        if (itemLike.isItemShow?.(dataItem, currentDay, currentWeek)) {
                            currentDayItems.push({item: itemLike, dataItem});
                        }
                    });
                });
                return (
                    <View style={weekdayContainerStyle} key={`day-${currentWeek}-${weekday}-${index}`}>
                        {/* 日期部分 */}
                        <View style={courseScheduleStyle.weekdayItem}>
                            <Text style={weekdayTextStyle}>
                                {props.showDate
                                    ? `${weekday}\n` + `${currentDay.month() + 1}-${currentDay.date()}`
                                    : `${weekday}`}
                            </Text>
                        </View>
                        {/* 自定义元素渲染 */}
                        {currentDayItems.map(({item, dataItem}, i) => (
                            <View key={`custom-item-${index}-${i}`}>{item.itemRender?.(dataItem)}</View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
}
