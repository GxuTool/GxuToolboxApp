import React, {useMemo} from "react";
import {StyleSheet} from "react-native";
import {Color} from "@/shared/color.ts";
import {UnPressable} from "@/components/un-ui";
import Flex from "@/components/un-ui/Flex.tsx";
import {Text, useTheme} from "@rneui/themed";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import moment from "moment/moment";
import {useCourseData} from "@/hooks/useCourseData.ts";

interface Props {
    examInfo: ExamInfo;
    onPress?: (examInfo: ExamInfo) => void;
}

export function CourseScheduleExamItem(props: Props) {
    const {store, courseScheduleStyle} = useCourseData();
    const timeSpanHeight = store(s => s.theme.timeSpanHeight);
    const weekdayHeight = store(s => s.theme.weekdayHeight);
    const courseItemMargin = store(s => s.theme.courseItemMargin);
    const timeSpanList = store(s => s.timeSpanList);
    const randomColor = store(s => s.randomColor);
    const {theme} = useTheme();
    const {examInfo} = props;

    function timeToTimeSpan(time: string, endTime: boolean = false): number {
        let res = -1;
        if (endTime) {
            for (let i = timeSpanList.length - 1; i >= 0; i--) {
                const timeSpanStartTime = timeSpanList[i].split("\n")[0];
                if (moment(timeSpanStartTime, "hh:mm").isBefore(moment(time, "hh:mm"))) {
                    res = i;
                    break;
                }
            }
        } else {
            for (let i = 0; i < timeSpanList.length; i++) {
                const timeSpanEndTime = timeSpanList[i].split("\n")[1];
                if (moment(timeSpanEndTime, "hh:mm").isAfter(moment(time, "hh:mm"))) {
                    res = i;
                    break;
                }
            }
        }
        return res;
    }

    const examTime = examInfo.kssj.match(/(?<=\().*?(?=\))/g)?.[0].split("-") as [string, string];
    const y = timeToTimeSpan(examTime[0]);
    const span = timeToTimeSpan(examTime[1], true) - y + 1;
    const color = randomColor[Math.floor(Math.random() * randomColor.length)];
    const itemStyle = useMemo(() => {
        return StyleSheet.create({
            course: {
                height: span * timeSpanHeight - courseItemMargin * 2,
                position: "absolute",
                backgroundColor: Color(color).setAlpha(theme.mode === "light" ? 0.3 : 0.1).rgbaString,
                borderColor: Color.mix(color, theme.colors.grey4, 0.7).rgbaString,
                top:
                    weekdayHeight +
                    y * timeSpanHeight +
                    courseItemMargin,
            },
            text: {
                textAlign: "center",
                color: Color.mix(color, theme.colors.black, 0.5).rgbaString,
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
        <UnPressable
            onPress={function(e) {
                props.onPress?.(examInfo);
            }}
            style={[itemStyle.course, courseScheduleStyle.courseItem]}>
            <Flex direction="column" gap={5}>
                <Text style={itemStyle.text}>考试</Text>
                <Text style={itemStyle.text}>{examInfo.kcmc}</Text>
                <Text style={itemStyle.text}>
                    <Icon name="map-marker" style={itemStyle.text} />
                    {"\n" + examInfo.cdmc.replace("-", "\n")}
                </Text>
                <Text style={itemStyle.text}>{`<${examInfo.zwh}>`}</Text>
            </Flex>
        </UnPressable>
    );
}
