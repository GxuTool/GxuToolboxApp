import React, {useEffect, useState} from "react";
import {ScrollView, StyleSheet, ToastAndroid, View} from "react-native";
import {BottomSheet, Button, Card, Divider, Text, useTheme} from "@rneui/themed";
import Flex from "@/components/un-ui/Flex.tsx";
import {PageModel, Schools, SchoolValue} from "@/type/global.ts";
import moment from "moment/moment";
import {infoQuery} from "@/js/jw/infoQuery.ts";
import {Class, UserInfo} from "@/type/infoQuery/base.ts";
import {CourseSchedule} from "@/type/infoQuery/course/course.ts";
import {ClassScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {usePagerView} from "react-native-pager-view";
import {PracticalCourseList} from "@/components/tool/infoQuery/courseSchedule/PracticalCourseList.tsx";
import {UnSlider} from "@/components/un-ui/UnSlider.tsx";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {Picker} from "@react-native-picker/picker";
import {courseApi} from "@/js/jw/course.ts";
import {UnTermSelector} from "@/components/un-ui/UnTermSelector.tsx";
import {useSchoolTerm} from "@/hooks/jw.ts";
import {useWebView} from "@/hooks/app.ts";
import {TimeScheduleView} from "@/components/tool/infoQuery/courseSchedule/TimeScheduleView.tsx";
import {TimeScheduleItemData} from "@/components/tool/infoQuery/courseSchedule/TimeSchedule.tsx";
import {CourseClass, CourseScheduleClass} from "@/class/jw/course.ts";
import {CourseItem} from "@/components/tool/infoQuery/courseSchedule/CourseItem.tsx";
import {Color} from "@/shared/color.ts";
import {CourseDetail} from "@/components/tool/infoQuery/courseSchedule/CourseDetail.tsx";

export function ClassCourseSchedule() {
    const {openInJw} = useWebView();
    const {theme} = useTheme();
    const [userInfo, setUserInfo] = useState<UserInfo>();
    const [subjectList, setSubjectList] = useState<string[][]>([["", "全部"]]);
    const [classList, setClassList] = useState<string[][]>([["", "全部"]]);
    const pageView = usePagerView({pagesAmount: 20});
    // params
    const {year, term, setBoth} = useSchoolTerm();
    const [school, setSchool] = useState<SchoolValue>(
        Schools[Schools.findIndex(v => v[1] === (userInfo?.school ?? Schools[0][1]))][0],
    );
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState(moment().year());
    const [classId, setClassId] = useState("");
    // scheduleList
    const [classScheduleList, setClassScheduleList] = useState<Array<CourseSchedule & Class & PageModel>>([]);
    const [classScheduleIndex, setClassScheduleIndex] = useState<number>(0);
    const [classScheduleApiRes, setClassScheduleApiRes] = useState<ClassScheduleQueryRes | null>(null);

    const style = StyleSheet.create({
        container: {
            padding: "5%",
        },
    });

    const queryClassCourseScheduleList = async (tip = false) => {
        if (tip) ToastAndroid.show("正在获取班级课表列表", ToastAndroid.SHORT);
        const res = await courseApi.getClassCourseScheduleList(year, term, school, subject, grade, classId);
        setClassScheduleList(res.items);
        setClassScheduleIndex(0);
        queryClassCourseSchedule(res.items[0]);
    };

    useEffect(() => {
        queryClassCourseScheduleList();
    }, [classId, school, subject, grade, term, year]);

    const queryClassCourseSchedule = async (item = {}, tip = false) => {
        if (tip) ToastAndroid.show("正在获取班级课表", ToastAndroid.SHORT);

        // 添加边界检查
        if (!classScheduleList || classScheduleList.length === 0) {
            console.warn("班级课表列表为空");
            return;
        }

        const currentIndex = classScheduleIndex ?? 0;
        if (currentIndex >= classScheduleList.length) {
            console.warn("班级课表索引超出范围");
            return;
        }

        const {xnm, xqm, njdm_id, jgdm, zyh_id, bh_id} = {...classScheduleList[currentIndex], ...item};
        const res = await courseApi.getClassCourseSchedule(+xnm, xqm, jgdm, zyh_id, +njdm_id, bh_id);
        if (res) setClassScheduleApiRes(res);
    };

    useEffect(() => {
        queryClassCourseSchedule();
    }, [classScheduleIndex]);

    const init = async () => {
        const storeUserInfo = await infoQuery.getUserInfo();
        if (!storeUserInfo) return;
        setUserInfo(storeUserInfo);

        const schoolIndex = Schools.findIndex(v => v[1] === (storeUserInfo.school ?? Schools[0][1]));
        const newSchool = Schools[schoolIndex][0];
        setSchool(newSchool);

        const newSubjectList = await getSubjectList(newSchool, false);
        newSubjectList.unshift(["", "全部"]);
        const subjectIndex = newSubjectList.findIndex(v => v[1].indexOf(storeUserInfo.subject_id) > -1);
        const newSubject = newSubjectList[subjectIndex][0];
        setSubject(newSubject);

        const newGrade = storeUserInfo.grade ?? moment().year();
        setGrade(newGrade);

        const newClassList = await getClassList(newSchool, newSubject, newGrade, false);
        newClassList.unshift(["", "全部"]);
        setClassList(newClassList);

        const newClassIndex = newClassList.findIndex(v => v[1].indexOf(storeUserInfo.class) > -1);
        setClassId(newClassList[newClassIndex][0]);
    };

    const getSubjectList = async (schoolId = school, reload = true) => {
        const subjectRes = await infoQuery.getSubjectList(schoolId);
        if (!subjectRes) return [];
        const newSubjectList = subjectRes.map(item => [item.zyh_id, item.zymc]);
        if (reload) {
            newSubjectList.unshift(["", "全部"]);
            setSubjectList(newSubjectList);
        }
        return newSubjectList;
    };

    const getClassList = async (
        schoolId: SchoolValue = school,
        subjectId: string = subject,
        gradeId: number = grade,
        reload = true,
    ) => {
        const classListRes = await infoQuery.getClassList(schoolId, subjectId, gradeId);
        if (!classListRes) return [];
        const newClassList = classListRes.map(item => [item.bh_id, item.bj]);
        if (reload) {
            newClassList.unshift(["", "全部"]);
            setClassList(newClassList);
        }
        return newClassList;
    };

    useEffect(() => {
        getSubjectList();
    }, [school]);

    useEffect(() => {
        getClassList();
    }, [subject, grade]);

    useEffect(() => {
        init();
    }, []);

    const [itemDetailShow, setItemDetailShow] = useState(false);
    const [itemDetail, setItemDetail] = useState<CourseClass>();

    return (
        <ScrollView>
            <View style={style.container}>
                <Text h4>查询参数</Text>
                <Text style={{color: theme.colors.grey2}}>请从上往下依次修改参数</Text>
                <Flex gap={10} direction="column" align="flex-start">
                    <Flex gap={10}>
                        <Text>学期</Text>
                        <View style={{flex: 1}}>
                            <UnTermSelector year={year} term={term} onChange={setBoth} disableSelectAll />
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text>学院</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={school} onValueChange={setSchool}>
                                {[["", "全部"], ...Schools].map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text>专业</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={subject} onValueChange={setSubject}>
                                {[["", "全部"]].concat(subjectList ?? []).map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text>年级</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={grade} onValueChange={setGrade}>
                                {[["", "全部"], ...Array(25).fill(0)].map((v, index, ori) => {
                                    if (v === 0) {
                                        const optionV = 2003 + (ori.length - index);
                                        return <Picker.Item value={optionV} label={optionV + ""} key={optionV} />;
                                    } else {
                                        return <Picker.Item value={v[0]} label={v[1]} key={v[0]} />;
                                    }
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Text>班级</Text>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={classId} onValueChange={setClassId}>
                                {[["", "全部"]].concat(classList ?? []).map(value => {
                                    return <Picker.Item value={value[0]} label={value[1]} key={value[0]} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <Flex gap={10}>
                        <Button containerStyle={{flex: 1}} onPress={() => queryClassCourseScheduleList(true)}>
                            查询课表
                        </Button>
                        <Button
                            onPress={() => openInJw("/kbdy/bjkbdy_cxBjkbdyIndex.html?gnmkdm=N214505&layout=default")}>
                            前往教务查询
                        </Button>
                    </Flex>
                </Flex>
                <Divider />
                <Text h4>课表查询结果</Text>
                <Flex gap={10} direction="column" align="flex-start">
                    <Flex>
                        <View style={{flex: 1}}>
                            <UnPicker selectedValue={classScheduleIndex} onValueChange={setClassScheduleIndex}>
                                {[...classScheduleList].map((value, index) => {
                                    return <Picker.Item value={index} label={value.tjkbmc} key={value.id} />;
                                })}
                            </UnPicker>
                        </View>
                    </Flex>
                    <View style={{width: "100%"}}>
                        <Button onPress={() => queryClassCourseSchedule({}, true)}>查看课表</Button>
                    </View>
                </Flex>
                <Divider />
                {classScheduleApiRes && classScheduleApiRes.weekNum && classScheduleApiRes.weekNum.length > 0 && (
                    <>
                        <Text h4>课表预览</Text>
                        <Divider />
                        <Text>课表周数</Text>
                        <Flex style={{padding: 10}}>
                            <UnSlider
                                step={1}
                                minimumValue={1}
                                maximumValue={classScheduleApiRes.weekNum.length ?? 20}
                                allowTouchTrack
                                value={pageView.activePage + 1}
                                onValueChange={v => pageView.setPage(v - 1)}
                            />
                        </Flex>
                        <TimeScheduleView
                            itemList={[
                                {
                                    data: new CourseScheduleClass(classScheduleApiRes).kbList,
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
                            startDay={classScheduleApiRes.weekNum[0]?.rq?.split("/")[0]}
                            pageView={pageView}
                        />
                        {classScheduleApiRes?.sjkList && (
                            <>
                                <Card.Divider />
                                <PracticalCourseList courseList={classScheduleApiRes.sjkList} />
                            </>
                        )}
                    </>
                )}
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
