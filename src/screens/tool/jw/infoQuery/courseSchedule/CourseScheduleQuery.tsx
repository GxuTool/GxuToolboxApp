import {Linking, Pressable, ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import Flex from "@/components/un-ui/Flex.tsx";
import {Button, Card, Divider, Text, useTheme} from "@rneui/themed";
import {Color} from "@/shared/color.ts";
import React, {useContext, useEffect, useState} from "react";
import {SchoolTermValue} from "@/type/global.ts";
import {UserConfigContext} from "@/components/AppProvider.tsx";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {CourseScheduleView} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleView.tsx";
import {PracticalCourseList} from "@/components/tool/infoQuery/courseSchedule/PracticalCourseList.tsx";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {usePagerView} from "react-native-pager-view";
import {courseApi} from "@/js/jw/course.ts";
import {Row, Rows, Table} from "react-native-reanimated-table";
import {Course} from "@/type/infoQuery/course/course.ts";
import Clipboard from "@react-native-clipboard/clipboard";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useWebView} from "@/hooks/app.ts";

export function CourseScheduleQuery() {
    const {theme} = useTheme();
    const {userConfig} = useContext(UserConfigContext);
    const {openInJw} = useWebView();
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const pageView = usePagerView({pagesAmount: 20});
    const [courseScheduleList, setCourseScheduleList] = useState<Course[]>();
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
        tableBorder: {
            borderWidth: 2,
            borderColor: Color.mix(theme.colors.primary, theme.colors.grey4, 0.4).rgbaString,
        },
        tableHeader: {
            backgroundColor: Color.mix(
                Color(theme.colors.primary),
                Color(theme.colors.background),
                theme.mode === "dark" ? 0.7 : 0.2,
            ).setAlpha(theme.mode === "dark" ? 0.3 : 0.6).rgbaString,
        },
        tableHeaderText: {},
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
            console.log(courseList);
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

    const tableWidthArr = [150, 70, 100, 150];
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
                <CourseScheduleView
                    startDay={userConfig.jw.startDay}
                    pageView={pageView}
                    courseSchedule={courseScheduleApiRes}
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
                    <Table borderStyle={style.tableBorder}>
                        <Row
                            style={style.tableHeader}
                            height={40}
                            widthArr={tableWidthArr}
                            textStyle={style.tableText}
                            data={["课程名", "教师", "上课地点", "qq群"]}
                        />
                        <Rows
                            widthArr={tableWidthArr}
                            textStyle={style.tableText}
                            heightArr={new Array(courseScheduleList?.length).fill(40)}
                            data={
                                courseScheduleList?.map<any[]>(course => [
                                    course.kcmc,
                                    course.xm,
                                    course.cdmc,
                                    course.qqqh.trim() ? (
                                        <Pressable
                                            android_ripple={userConfig.theme.ripple}
                                            onPress={() => qqLink(course.qqqh)}>
                                            <Text style={style.tableText}>{course.qqqh}</Text>
                                        </Pressable>
                                    ) : (
                                        "-"
                                    ),
                                ]) ?? []
                            }
                        />
                    </Table>
                </ScrollView>
            </View>
        </ScrollView>
    );
}
