import {PracticalCourse} from "@/type/infoQuery/course/course.ts";
import {StyleSheet, View} from "react-native";
import {BaseColor, Color} from "@/shared/color.ts";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import {Text, useTheme} from "@rneui/themed";
import {useContext, useEffect, useState} from "react";
import {CourseScheduleContext} from "@/js/jw/course.ts";

interface Props {
    courseList: PracticalCourse[];
}

interface PracticalCourseItem extends PracticalCourse {
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
    const [courseList, setCourseList] = useState<PracticalCourseItem[]>([]);
    useEffect(() => {
        randomCourseColor(props.courseList as PracticalCourseItem[]);
        setCourseList(props.courseList as PracticalCourseItem[]);
    }, [props.courseList]);

    const {courseScheduleStyle} = useContext(CourseScheduleContext)!;

    function randomCourseColor(courseList: PracticalCourseItem[]) {
        //使得相同课程的颜色相同
        const courseColor: Record<string, string> = {};
        courseList.forEach((course: PracticalCourseItem) => {
            if (!courseColor[course.kcmc]) {
                let randomNum = Math.floor(Math.random() * staticData.randomColor.length);
                course.backgroundColor = courseColor[course.kcmc] = staticData.randomColor[randomNum];
            } else {
                course.backgroundColor = courseColor[course.kcmc];
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
                        key={`${course.qtkcgs}-${index}`}
                        style={[
                            itemStyle.course,
                            courseScheduleStyle.practicalCourseItem,
                            courseScheduleStyle.courseItem,
                        ]}>
                        <Text style={itemStyle.text}>{course.qtkcgs}</Text>
                        <Flex gap={5}>
                            <Icon name="clock" style={itemStyle.text} />
                            <Text style={itemStyle.text}>{course.qsjsz}</Text>
                        </Flex>
                        <Flex gap={5}>
                            <Icon name="account" style={itemStyle.text} />
                            <Text style={itemStyle.text}>{course.jsxm}</Text>
                        </Flex>
                    </View>
                );
            })}
        </View>
    );
}
