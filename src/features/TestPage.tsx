import {ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text} from "react-native";
import moment from "moment";
import {usePagerView} from "react-native-pager-view";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useCourse} from "@/features/courseSchedule/hooks/detail/useCourse.ts";
import {Button, Image} from "@rneui/themed";
import React, {useEffect, useState} from "react";
import {userMgr} from "@/js/mgr/user.ts";
import {attendanceAuthApi} from "@/core/auth/attendance/attendanceAuthApi.ts";
import {useAttendance} from "@/features/courseSchedule/hooks/detail/useAttendance.ts";
import {useExam} from "@/features/courseSchedule/hooks/detail/useExam.ts";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

type DemoItem = {
    kind: "holiday";
    id: string;
    week: number;
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    title: string;
    detail?: string;
    color?: string;
};

export function TestPage() {
    const pageView = usePagerView({pagesAmount: 20});
    const startDay = moment("2026-03-02");

    const course = useCourse(2025, 12);
    const examSchedule = useExam(2025, 12);

    // async function init() {
    //     const res = await attendanceAuthApi.getCaptchaImage();
    //     console.log(res);
    //     setCaptchaCodeUri(res.uri);
    //     setCaptchaCode(res.code);
    // }
    //
    // //从存储中读取数据
    // useEffect(() => {
    //     init();
    // }, []);

    const scheduleItems: ScheduleTableItem[] = [
        {
            id: "h1",
            week: 2,
            day: 7,
            begin: 1,
            end: 13,
            title: "清明节",
            subtitle: "放假",
            kind: "holiday",
        },
        {
            id: "h1",
            week: 2,
            day: 6,
            begin: 1,
            end: 13,
            title: "清明节",
            subtitle: "放假",
            kind: "holiday",
        },
    ];
    const all = [...scheduleItems, ...(course || []), ...(examSchedule || [])];

    const open12306App = async () => {
        const url = 'cn.12306://';

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('提示', '未检测到铁路12306，请先安装该应用');
            }
        } catch (error) {
            console.error('跳转异常:', error);
        }
    };
    return (
        <ScrollView contentContainerStyle={{paddingVertical: 8}}>
            {/*<Text>{JSON.stringify(status, null, 2)}</Text>*/}
            {/*<TimeScheduleView<DemoItem>*/}
            {/*    showDate*/}
            {/*    showTimeSpanHighlight*/}
            {/*    showDayHighlight*/}
            {/*    startDay={startDay}*/}
            {/*    pageView={pageView}*/}
            {/*    scheduleItems={all}*/}
            {/*/>*/}
            {/*<Text>{JSON.stringify(course, null, 2)}</Text>*/}
            <Button onPress={open12306App}>
                打开12306
            </Button>
        </ScrollView>
    );
}

const style = StyleSheet.create({
    container: {
        padding: "5%",
    },
    title: {
        textAlign: "center",
    },
    note: {
        marginVertical: 20,
        textAlign: "center",
        color: "gray",
        fontSize: 14,
    },
    showPwdIcon: {
        paddingHorizontal: 5,
        cursor: "pointer",
    },
    input: {
        height: 70,
    },
    image: {
        width: 95,
        height: 25,
    },
});
