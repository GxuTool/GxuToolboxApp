import {Linking, Pressable, ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import Flex from "@/components/un-ui/Flex.tsx";
import {BottomSheet, Button, Card, Divider, Text, useTheme} from "@rneui/themed";
import React, {useEffect, useState} from "react";
import {SchoolTermValue} from "@/type/global.ts";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {PracticalCourseList} from "@/components/tool/infoQuery/courseSchedule/PracticalCourseList.tsx";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {usePagerView} from "react-native-pager-view";
import {courseApi} from "@/js/jw/course.ts";
import {Course} from "@/type/infoQuery/course/course.ts";
import Clipboard from "@react-native-clipboard/clipboard";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useUserConfig, useWebView} from "@/hooks/app.ts";
import {UnTable, UnTableCols} from "@/components/un-ui";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {CourseClass, CourseScheduleClass} from "@/class/jw/course.ts";
import {CourseItem} from "@/components/tool/infoQuery/courseSchedule/CourseItem.tsx";
import {TimeScheduleItemData} from "@/components/tool/infoQuery/courseSchedule/TimeSchedule.tsx";
import {Color} from "@/shared/color.ts";
import {CourseDetail} from "@/components/tool/infoQuery/courseSchedule/CourseDetail.tsx";

export function CourseScheduleQuery() {
    const {theme} = useTheme();
    const {userConfig} = useUserConfig();
    const {openInJw} = useWebView();
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const pageView = usePagerView({pagesAmount: 20});
    const [courseScheduleList, setCourseScheduleList] = useState<Course[]>([]);
    const [courseScheduleApiRes, setCourseScheduleApiRes] = useState<CourseScheduleQueryRes>();
    const style = StyleSheet.create({
        container: {
            padding: "5%",
        },
        tableText: {
            color: theme.colors.black,
            margin: 5,
            textAlign: "center",
        },
    });

    async function query() {
        const res = await courseApi.getCourseSchedule(year, term);
        if (res?.kbList || res?.sjkList) {
            setCourseScheduleApiRes(res);
            const courseList: Course[] = [];
            res.kbList.forEach(course => {
                if (courseList.findIndex(item => item.kcmc === course.kcmc) < 0) {
                    courseList.push(course);
                }
            });
            setCourseScheduleList(courseList);
        }
    }

    useEffect(() => {
        query();
    }, [year, term]);

    async function qqLink(qq: string) {
        const url = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}&card_type=group&source=qrcode`;
        await Linking.openURL(url).catch(e => {
            console.error(e);
            ToastAndroid.show("无法直接跳转QQ，已将QQ群号复制至剪切板", ToastAndroid.SHORT);
            Clipboard.setString(qq);
        });
    }

    const cols: UnTableCols<Course> = [
        {
            title: "课程名",
            width: 150,
            dataIndex: "kcmc",
        },
        {
            title: "教师",
            width: 70,
            dataIndex: "xm",
        },
        {
            title: "上课地点",
            width: 100,
            dataIndex: "cdmc",
        },
        {
            title: "qq群",
            width: 150,
            dataIndex: "qqqh",
            render: qq =>
                qq.trim() ? (
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
                <Flex gap={10} direction="column" align="flex-start">
                    <Text h4>查询参数</Text>
                    <Flex gap={10}>
                        <Text>学期</Text>
                        <View style={{flex: 1}}>
                            <UnTermSelector
                                year={year}
                                term={term}
                                disableSelectAll
                                onChange={(year, term) => {
                                    setYear(+year);
                                    setTerm(term);
                                }}
                            />
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Button containerStyle={{flex: 1}} onPress={query}>
                            查询
                        </Button>
                        <Button onPress={() => openInJw("/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=N2151&layout=default")}>
                            前往教务查询
                        </Button>
                    </Flex>
                </Flex>
                <Divider />
                <Text h4>课表预览</Text>
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
                <TimeScheduleView
                    startDay={userConfig.jw.startDay}
                    pageView={pageView}
                    itemList={[
                        {
                            data: new CourseScheduleClass(courseScheduleApiRes).kbList,
                            isItemShow(item, day, week) {
                                return item.atDayWithWeek(day, week);
                            },
                            itemRender: item => (
                                <CourseItem
                                    course={item}
                                    onCoursePress={() => {
                                        setItemDetailShow(true);
                                        setItemDetail(item);
                                    }}
                                />
                            ),
                        } as TimeScheduleItemData<CourseClass>,
                    ]}
                />
                {courseScheduleApiRes?.sjkList && (
                    <>
                        <Card.Divider />
                        <PracticalCourseList courseList={courseScheduleApiRes.sjkList} />
                    </>
                )}
                <Divider />
                <Text h4>课程列表</Text>
                <ScrollView horizontal style={{marginTop: 10}}>
                    <UnTable<Course> data={courseScheduleList} cols={cols} />
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
