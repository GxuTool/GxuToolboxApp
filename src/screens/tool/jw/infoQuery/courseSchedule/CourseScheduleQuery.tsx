import {ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import Flex from "@/components/un-ui/Flex.tsx";
import {BottomSheet, Card, Divider, Text, useTheme} from "@rneui/themed";
import React, {useMemo, useState} from "react";
import {SchoolTermValue} from "@/type/global.ts";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {PracticalCourseList} from "@/features/courseSchedule/components/PracticalCourseList.tsx";
import {usePagerView} from "react-native-pager-view";
import Clipboard from "@react-native-clipboard/clipboard";
import {useUserConfig} from "@/hooks/app.ts";
import {UnTable, UnTableCols} from "@/components/un-ui";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {CourseClass} from "@/class/jw/course.ts";
import {Color} from "@/shared/color.ts";
import {CourseDetail} from "@/features/courseSchedule/components/CourseDetail.tsx";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import {usePractice} from "@/features/courseSchedule/hooks/detail/usePractice.ts";
import {ChooseTerm} from "@/components/tool/infoQuery/examInfo/ChooseTerm.tsx";

export function CourseScheduleQuery() {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();

    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const pageView = usePagerView({pagesAmount: 20});

    const {item: baseCourse, refresh: refreshBaseCourse, loading} = useBaseCourse(year, term);
    const {items: practiceItems = [], refresh: refreshPractice} = usePractice(year, term);

    // 不绑定全局的startDay，根据year和term动态计算，以免造成混乱
    const startDay = useStartDay(year, term);

    const tableData = useMemo(
        () => (baseCourse ?? []).filter((item, idx, arr) => arr.findIndex(i => i.title === item.title) === idx),
        [baseCourse],
    );
    const style = StyleSheet.create({
        container: {
            padding: "3%",
        },
        coursePadding:{
            marginHorizontal:-12,
        },
        tableText: {
            color: theme.colors.black,
            margin: 5,
            textAlign: "center",
        },
    });

    async function qqLink(qq: string) {
        const url = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}&card_type=group&source=qrcode`;
        await Linking.openURL(url).catch(e => {
            console.error(e);
            ToastAndroid.show("无法直接跳转QQ，已将QQ群号复制至剪切板", ToastAndroid.SHORT);
            Clipboard.setString(qq);
        });
    }

    const cols: UnTableCols<ScheduleTableItem> = [
        {
            title: "课程名",
            width: 150,
            dataIndex: "title",
        },
        {
            title: "教师",
            width: 70,
            dataIndex: "teacher",
        },
        {
            title: "上课地点",
            width: 100,
            dataIndex: "location",
        },
        {
            title: "qq群",
            width: 150,
            dataIndex: "qq",
            render: qq =>
                qq?.trim() ? (
                    <Pressable android_ripple={userConfig.theme.ripple} onPress={() => qqLink(qq)}>
                        <Text style={style.tableText}>{qq}</Text>
                    </Pressable>
                ) : (
                    "-"
                ),
        },
    ];

    const [itemDetailShow, setItemDetailShow] = useState(false);
    const [itemDetail, setItemDetail] = useState<CourseClass>();

    return (
        <ScrollView>
            <View style={style.container}>
                <View style={{flex: 1, padding: "-1%"}}>
                    <ChooseTerm
                        onTermSelect={(Year, Term) => {
                            setYear(+Year);
                            setTerm(+Term);
                        }}
                        includeWholeLife={false}
                        includeWholeYear={false}
                    />
                </View>
                {loading&&<ActivityIndicator size="large" />}
                <Divider />
                <Text h4>预览</Text>
                <Flex style={{padding: 10}} align="flex-start" direction="column" gap={10}>
                    <Text>课表周数</Text>
                    <UnSlider
                        step={1}
                        minimumValue={1}
                        maximumValue={20}
                        allowTouchTrack
                        value={pageView.activePage + 1}
                        onValueChange={v => pageView.setPage(v - 1)}
                    />
                </Flex>
                <View style={style.coursePadding}>
                <TimeScheduleView startDay={startDay} pageView={pageView} scheduleItems={baseCourse} />
                </View>
                {practiceItems && (
                    <>
                        <Card.Divider />
                        <PracticalCourseList courseList={practiceItems} />
                    </>
                )}
                <Divider />
                <Text h4>课程列表</Text>
                <ScrollView horizontal style={{marginTop: 10}}>
                    <UnTable<ScheduleTableItem> data={tableData} cols={cols} />
                </ScrollView>
            </View>
            <BottomSheet isVisible={itemDetailShow} onBackdropPress={() => setItemDetailShow(false)}>
                <View
                    style={{
                        backgroundColor: theme.colors.background,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
                        borderWidth: 1,
                        padding: "2.5%",
                    }}>
                    <CourseDetail course={itemDetail} />
                </View>
            </BottomSheet>
        </ScrollView>
    );
}
