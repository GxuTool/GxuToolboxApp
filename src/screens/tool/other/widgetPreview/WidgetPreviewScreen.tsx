import * as React from "react";
import {useEffect, useState} from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {WidgetPreview} from "react-native-android-widget";

import {CourseScheduleWidget} from "@/widget/CourseScheduleWidget.tsx";
import {nextCourses} from "@/js/nextCourses.ts";
import {useTheme} from "@rneui/themed";

export function WidgetPreviewScreen() {
    const {theme} = useTheme();
    const [courses, setCourses] = useState<{today: any[]; tomorrow: any[]; next: any}>({
        today: [],
        tomorrow: [],
        next: null,
    });

    useEffect(() => {
        nextCourses().then(res => {
            if (res) {
                setCourses(res);
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <WidgetPreview
                renderWidget={() => (
                    <CourseScheduleWidget
                        theme={theme.mode}
                        todayCourse={courses.today}
                        tomorrowCourse={courses.tomorrow}
                    />
                )}
                width={370}
                height={370}
            />
            <ScrollView
                style={{
                    backgroundColor: "white",
                    width: "90%",
                    borderRadius: 10,
                    marginTop: 20,
                    padding: 10,
                }}>
                <Text
                    style={{
                        color: "black",
                        fontSize: 15,
                        marginTop: 10,
                    }}>
                    课程表（初始大小为1 : 1）
                </Text>
                <Text
                    style={{
                        color: "black",
                        fontSize: 15,
                        marginTop: 10,
                    }}>
                    {JSON.stringify(courses.next, null, 2)}
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
