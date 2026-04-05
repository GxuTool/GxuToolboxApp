import {StyleSheet, View} from "react-native";
import {BaseColor, Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {Text, useTheme} from "@rneui/themed";
import {useContext, useEffect, useState} from "react";
import {CourseScheduleContext} from "@/js/jw/course.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";

type PracticeItem = ICourse["practiceList"][number];

interface Props {
    courseList: ICourse["practiceList"];
}

interface PracticalCourseItem extends PracticeItem {
    // 在课程表中显示的背景颜色
    backgroundColor: string;
}

const staticData = {
    randomColor: [
        BaseColor.pink,
        BaseColor.lightgreen,
        BaseColor.skyblue,
        BaseColor.orange,
        BaseColor.tan,
        BaseColor.sandybrown,
        BaseColor.navy,
        BaseColor.maroon,
        BaseColor.mediumspringgreen,
        BaseColor.slateblue,
        BaseColor.yellowgreen,
        BaseColor.red,
        BaseColor.yellow,
        BaseColor.gold,
        BaseColor.lightskyblue,
        BaseColor.lightsteelblue,
        BaseColor.limegreen,
        BaseColor.mediumaquamarine,
        BaseColor.mediumblue,
    ],
};

export function PracticalCourseList(props: Props) {
    const {theme} = useTheme();
    const [courseList, setCourseList] = useState<ICourse["practiceList"]>([]);
    useEffect(() => {
        randomCourseColor(props.courseList as ICourse["practiceList"]);
        setCourseList(props.courseList as ICourse["practiceList"]);
    }, [props.courseList]);

    const {courseScheduleStyle} = useContext(CourseScheduleContext)!;

    function randomCourseColor(courseList: ICourse["practiceList"]) {
        //使得相同课程的颜色相同
        const courseColor: Record<string, string> = {};
        courseList.forEach((course: PracticalCourseItem) => {
            if (!courseColor[course.title]) {
                let randomNum = Math.floor(Math.random() * staticData.randomColor.length);
                course.backgroundColor = courseColor[course.title] = staticData.randomColor[randomNum];
            } else {
                course.backgroundColor = courseColor[course.title];
            }
        });
    }

    return (
        <View>
            <Text style={{textAlign: "center"}}>实践课</Text>
            {courseList.map((course: PracticalCourseItem, index) => {
                const itemStyle = StyleSheet.create({
                    course: {
                        backgroundColor: Color(course.backgroundColor).setAlpha(theme.mode === "light" ? 0.3 : 0.1)
                            .rgbaString,
                        borderColor: Color.mix(course.backgroundColor, theme.colors.grey4, 0.8).rgbaString,
                    },
                    text: {
                        color: Color.mix(course.backgroundColor, theme.colors.black, 0.5).rgbaString,
                    },
                });
                return (
                    <View
                        key={`${course.title}-${index}`}
                        style={[
                            itemStyle.course,
                            courseScheduleStyle.practicalCourseItem,
                            courseScheduleStyle.courseItem,
                        ]}>
                        <Text style={itemStyle.text}>{course.title}</Text>
                        {course.time && (
                            <Flex gap={5}>
                                <Icon name="clock" style={itemStyle.text} />
                                <Text style={itemStyle.text}>{course.time}</Text>
                            </Flex>
                        )}
                        {course.teacher && (
                            <Flex gap={5}>
                                <Icon name="account" style={itemStyle.text} />
                                <Text style={itemStyle.text}>{course.teacher}</Text>
                            </Flex>
                        )}
                    </View>
                );
            })}
        </View>
    );
}
