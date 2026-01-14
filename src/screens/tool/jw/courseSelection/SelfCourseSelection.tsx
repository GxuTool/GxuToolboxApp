import {ScrollView, View} from "react-native";
import {useEffect, useState} from "react";
import {CourseSelectionApi} from "@/js/jw/selectCourse.ts";
import {ListItem, Text} from "@rneui/themed";

export function SelfCourseSelection() {
    const [courses, setCourses] = useState<any[][]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    useEffect(() => {
        init();
    }, []);
    /**
     * 把选课各项整理得像手风琴一样
     */
    const accordion = (res: any[]) => {
        if (res.length === 0) {
            setCourses([]);
            return;
        }
        const courseList: any[][] = res.reduce((acc: any[][], course: any) => {
            const last = acc[acc.length - 1];
            if (!last || last[0].kcmc !== course.kcmc) {
                acc.push([course]);
            } else {
                last.push(course);
            }
            return acc;
        }, []);
        console.log(courseList);
        setCourses(courseList);
    };
    const init = async () => {
        const res = await CourseSelectionApi.getCourseInfo(2025, 3);
        accordion(res.tmpList);
    };
    return (
        <View>
            <ScrollView>
                {courses.map((course, index) => (
                    <ListItem.Accordion
                        key={index}
                        content={<Text>{`${index + 1}. ${course[0].kcmc} (共 ${course.length} 班)`}</Text>}
                        isExpanded={expanded === index}
                        onPress={() => setExpanded(expanded === index ? null : index)}>
                        {course.map((item, index1) => (
                            <ListItem key={index1}>
                                <ListItem.Content>
                                    <ListItem.Title>
                                        <Text style={{fontSize: 16,width:"100%"}}>
                                            {`${item.jxbmc}-${item.yxzrs}/${item.jxbrl}`}
                                        </Text>
                                    </ListItem.Title>
                                </ListItem.Content>
                            </ListItem>
                        ))}
                    </ListItem.Accordion>
                ))}
            </ScrollView>
        </View>
    );
}
