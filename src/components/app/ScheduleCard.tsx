import {BottomSheet, Divider, Text, useTheme} from "@rneui/themed";
import {Pressable, StyleSheet, View} from "react-native";
import {store} from "@/core/store.ts";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import React, {useCallback, useEffect, useState} from "react";
import {PracticalCourseList} from "../tool/infoQuery/courseSchedule/PracticalCourseList.tsx";
import Flex from "@/components/un-ui/Flex.tsx";
import {Icon} from "@/components/un-ui/Icon.tsx";
import moment from "moment";
import {Schools, SchoolTermValue} from "@/type/global.ts";
import {Color} from "@/shared/color.ts";
import {usePagerView} from "react-native-pager-view";
import {CourseCardSetting} from "@/components/tool/infoQuery/courseSchedule/CourseCardSetting.tsx";
import {
    CourseScheduleView,
    CourseScheduleViewProps,
} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleView.tsx";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import {ExamInfoQueryRes} from "@/type/api/infoQuery/examInfoAPI.ts";
import {courseApi} from "@/js/jw/course.ts";
import {CourseScheduleClass} from "@/class/jw/course.ts";
import {examApi} from "@/js/jw/exam.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {useNavigation} from "@react-navigation/native";
import {CourseScheduleExamItem} from "@/components/tool/infoQuery/examInfo/CourseScheduleExamItem.tsx";
import {ExamDetail} from "@/components/tool/infoQuery/examInfo/ExamDetail.tsx";
import {IActivity} from "@/type/app/activity.ts";
import {ActivityItem} from "@/components/app/activity/ActivityItem.tsx";
import {ActivityDetail} from "@/components/app/activity/ActivityDetail.tsx";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {http} from "@/core/http.ts";
import {EngTrainingItem} from "@/components/tool/infoQuery/EngTraining/EngTrainingItem.tsx";
import {AttendanceDataClass} from "@/class/auth/attendanceSystem.ts";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";
import {ScheduleShareSheet} from "@/components/tool/infoQuery/courseSchedule/ScheduleShareSheet.tsx";
import {useUserConfig} from "@/hooks/app.ts";
import {useUnToast} from "@/components/un-ui/UnToast.tsx";
import {jwxt} from "@/js/jw/jwxt.ts";
import {UnText, UnTooltip} from "@/components/un-ui/index.ts";
import {userProfile} from "@/core/user/profile.ts";

export function ScheduleCard() {
    const {createToast} = useUnToast();
    const {userConfig, updateUserConfig} = useUserConfig();
    const navigation = useNavigation();
    const {theme} = useTheme();
    const pagerView = usePagerView({pagesAmount: 20});
    const {...rest} = pagerView;

    const [courseSchedule, setCourseSchedule] = useState<CourseScheduleClass>();
    const startDay = moment(userConfig.jw.startDay);

    const realCurrentWeek = Math.ceil(moment.duration(moment().diff(startDay)).asWeeks());
    const [year, setYear] = useState(+userConfig.jw.year);
    const [term, setTerm] = useState<SchoolTermValue>(userConfig.jw.term);
    const [courseScheduleSettingVisible, setCourseScheduleSettingVisible] = useState(false);
    const [scheduleShareVisible, setScheduleShareVisible] = useState(false);

    const style = StyleSheet.create({
        card: {
            backgroundColor: Color(theme.mode === "light" ? theme.colors.background : theme.colors.grey5).setAlpha(
                0.1 + ((theme.mode === "light" ? 0.7 : 0.1) * userConfig.theme.bgOpacity) / 100,
            ).rgbaString,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.7).rgbaString,
            borderRadius: 16,
            paddingHorizontal: 0,
            marginHorizontal: 5,
            elevation: 0, // Android 去除阴影
            shadowOpacity: 0, // iOS 去除阴影
            overflow: "hidden",
        },
        cardTitle: {
            paddingHorizontal: 12,
        },
        pagerView: {
            width: "100%",
            height: userConfig.theme.course.timeSpanHeight * 13 + userConfig.theme.course.weekdayHeight + 50,
        },
        bottomSheetContainer: {
            backgroundColor: theme.colors.background,
            padding: "5%",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderColor: Color.mix(theme.colors.primary, theme.colors.background, 0.8).rgbaString,
            borderWidth: 1,
        },
        menuItem: {
            flexDirection: "row",
            gap: 8,
            width: 140,
            padding: 4,
            alignItems: "center",
        },
    });

    // 获取考试
    const [examList, setExamList] = useState<ExamInfo[]>([]);

    async function getExamList() {
        const data = await examApi.getExamInfo(year, term);
        if (data?.items) {
            setExamList(data.items);
            await store.save({key: "examInfo", data});
        } else {
        }
    }

    // 获取自定义事件
    const [activityList, setActivityList] = useState<IActivity[]>([]);

    function getActivityList() {
        console.log(userConfig);
        const activityDataIndex = userConfig.activity.data.findIndex(item => +item.year === year && item.term === term);
        if (activityDataIndex > -1) {
            setActivityList(userConfig.activity.data[activityDataIndex].list);
        } else {
            setActivityList([]);
        }
    }

    const [attendanceData, setAttendanceData] = useState<AttendanceDataClass>();
    useEffect(() => {
        if (attendanceData instanceof AttendanceDataClass && courseSchedule) {
            courseSchedule.setTermAttendanceData = attendanceData;
            setCourseSchedule(new CourseScheduleClass(courseSchedule));
        }
    }, [attendanceData]);

    async function getAttendanceData() {
        const calender = await attendanceSystemApi.calenderData.get(userConfig.jw.startDay);
        const attendanceDataRes = await attendanceSystemApi.getPersonalData(calender?.calendarId, {page_size: 1000});
        if (attendanceDataRes?.data && calender) {
            setAttendanceData(new AttendanceDataClass(attendanceDataRes.data.records, calender));
        }
    }

    // 获取课表
    async function getCourseSchedule() {
        const data = await courseApi.getCourseSchedule(year, term);
        if (data?.kbList) {
            if (attendanceData instanceof AttendanceDataClass) {
                data.setTermAttendanceData = attendanceData;
            }
            setCourseSchedule(data);
            await store.save({key: "courseRes", data});
            if (data.kbList.findIndex(item => item.kcmc === "大学物理实验") > -1) {
                getPhyExp();
            }
        } else {
        }
    }

    // 获取学期第一天
    const getStartDay = useCallback(async () => {
        const userInfo = await store
            .load<UserInfo>({
                key: "userInfo",
            })
            .catch(console.warn);
        const account = await userMgr.jw.getAccount();
        if (!userInfo || !account) return;

        const schoolId = Schools.filter(school => school[1] === userInfo.school)?.[0]?.[0];
        if (!schoolId) return;
        const data = await courseApi.getClassCourseSchedule(
            year,
            term,
            schoolId,
            userInfo.subject_id,
            userInfo.grade,
            account.username.slice(2, 8),
        );

        if (!Array.isArray(data?.weekNum) || (data?.weekNum.length ?? 0) < 1) return;
        const firstDay = data?.weekNum[0].rq.split("/")[0];
        if (userConfig.jw.startDay !== firstDay && typeof firstDay === "string") {
            userConfig.jw.startDay = firstDay;
            updateUserConfig(userConfig);
        }
    }, [year, term]);

    // 物理实验
    const [phyExpList, setPhyExpList] = useState<PhyExp[]>([]);

    async function getPhyExp() {
        const {data} = await courseApi.getPhyExpList();
        setPhyExpList(data);
        await store.save({
            key: "phyExpList",
            data,
        });
    }

    // 金工实训
    type EngTrainingExp = {
        date: string;
        name: string;
        y: number;
        span: number;
        backgroundColor: string;
        type: "engTrainingExp";
    };
    const [engTrainingExpList, setEngTrainingExpList] = useState<EngTrainingExp[]>([]);

    async function getEngTrainingSchedule() {
        const res = await courseApi.engTraining.getPersonalExpList();
        if (!res) return;
        const datas = res.datas;
        const dateList = datas[0].filter(item => item.startRow === 2);
        // 根据日期获取实训
        // TODO: 判断节数
        const expList = dateList.map<EngTrainingExp>(date => {
            const exp = datas[0].find(
                item =>
                    item.startRow === 9 &&
                    item.startCol <= date.startCol &&
                    item.startCol + item.colNumber >= date.startCol + date.colNumber,
            );
            return {
                date: date.content,
                type: "engTrainingExp",
                name: exp?.content ?? "",
                y: 0,
                span: 8,
                backgroundColor: theme.colors.primary,
            };
        });
        await store.save({
            key: "engTrainingExpList",
            data: expList,
        });
        setEngTrainingExpList(expList);
    }

    // 调休信息
    const [timeShift, setTimeShift] = useState<[string, string][]>([]);

    async function getTimeShift() {
        const {data} = await http.get("https://file.unde.site/GxuToolApp/data.json");
        if (data) setTimeShift(data.timeShift);
    }

    async function init() {
        // 从内存中加载课程缓存
        const courseData: CourseScheduleQueryRes = await store.load({key: "courseRes"}).catch(e => {
            console.warn(e);
            return {};
        });
        if (courseData.kbList) setCourseSchedule(new CourseScheduleClass(courseData));
        // 从内存中加载考试缓存
        const examData: ExamInfoQueryRes = await store.load({key: "examInfo"}).catch(e => {
            console.warn(e);
            return {};
        });
        if (examData.items) setExamList(examData.items);
        // 从内存中加载物理实验缓存
        const phyExpList = await store.load({key: "phyExpList"}).catch(e => {
            console.warn(e);
            return [];
        });
        if (phyExpList) setPhyExpList(phyExpList);
        // 从内存中加载金工实训缓存
        const engTrainingExpData = await store
            .load({
                key: "engTrainingExpList",
            })
            .catch(e => {
                console.warn(e);
                return [];
            });
        if (engTrainingExpData) setEngTrainingExpList(engTrainingExpData);

        loadData();
    }

    async function loadData() {
        let count = 0;
        const totalTaskCount = 7;
        const account = await userMgr.jw.getAccount();
        const toast = createToast(`测试教务Token是否过期 [0/${totalTaskCount}]`, "刷新日程表");
        toast.setProgress(0);
        if (!account?.username || !account?.password) {
            toast.setData({
                color: "error",
                content: "请进入设置页面正确设置教务账号",
                progress: 1,
            });
            return;
        }
        if (!(await jwxt.testToken(true, toast))) {
            // 失败时才检测时间段
            if (moment().hour() < 7 || moment().hour() > 22) {
                toast.setData({
                    color: "error",
                    content: "该时段暂时无法连接校园网，请早上七点后再试",
                    progress: 1,
                });
            } else {
                toast.setData({
                    color: "error",
                    content: "获取Token错误，请尝试手动登录或者联系作者",
                    progress: 1,
                });
            }
            toast.close();
            return;
        }
        count++;
        toast.setContent(`尝试刷新数据中 [${count}/${totalTaskCount}]`);
        toast.setProgress(+(count / totalTaskCount).toFixed(1));

        const taskList: Promise<any>[] = [
            getAttendanceData(),
            getStartDay(),
            getTimeShift(),
            getCourseSchedule(),
            getExamList(),
            getEngTrainingSchedule(),
        ];

        taskList.forEach(task =>
            task.finally(() => {
                count++;
                toast.setProgress(+(count / totalTaskCount).toFixed(1));
                toast.setContent(`尝试刷新数据中 [${count}/${totalTaskCount}]`);
                if (count === totalTaskCount) {
                    toast.setData({
                        color: "success",
                        content: "刷新完毕",
                        progress: 1,
                    });
                    toast.close();
                }
            }),
        );
        getActivityList();
    }

    useEffect(() => {
        init();
    }, [year, term, userConfig.activity]);

    type ExtendItemType = ExamInfo | IActivity | EngTrainingExp;
    type ScheduleViewType = CourseScheduleViewProps<ExtendItemType>;
    const itemList = [...examList, ...activityList, ...engTrainingExpList];
    // 自定义元素渲染
    const itemRender: ScheduleViewType["itemRender"] = (item, onPressHook) => {
        switch (true) {
            case (item as EngTrainingExp).type === "engTrainingExp":
                return <EngTrainingItem item={item as EngTrainingExp} />;
            case item.hasOwnProperty("xh_id"):
                return <CourseScheduleExamItem examInfo={item as ExamInfo} onPress={onPressHook} />;
            case item.hasOwnProperty("weekSpan"):
                return <ActivityItem item={item as IActivity} onPress={onPressHook} />;
            default:
                return <></>;
        }
    };
    // 自定义元素详情渲染
    const itemDetailRender: ScheduleViewType["itemDetailRender"] = item => {
        switch (true) {
            case item.hasOwnProperty("xh_id"):
                return <ExamDetail examInfo={item as ExamInfo} />;
            case item.hasOwnProperty("weekSpan"):
                return <ActivityDetail activity={item as IActivity} />;
            default:
                return <></>;
        }
    };
    // 判断元素是否显示
    const isItemShow: ScheduleViewType["isItemShow"] = (item, day, week) => {
        switch (true) {
            case (item as EngTrainingExp).type === "engTrainingExp":
                return moment((item as EngTrainingExp).date, "MM月D日").isSame(day, "d");
            case item.hasOwnProperty("xh_id"):
                return moment((item as ExamInfo).kssj.replace(/\(.*?\)/, "")).isSame(day, "d");
            case item.hasOwnProperty("weekSpan"):
                return (
                    (item as IActivity).weekday === day.weekday() &&
                    week >= (item as IActivity).weekSpan[0] &&
                    week <= (item as IActivity).weekSpan[1]
                );
            default:
                return false;
        }
    };

    return (
        <View>
            <Flex justify="space-between" style={style.cardTitle}>
                <Text h4>日程表</Text>
                <Flex gap={15} justify="flex-end">
                    {rest.activePage + 1 !== realCurrentWeek && (
                        <Pressable
                            android_ripple={userConfig.theme.ripple}
                            onPress={() => {
                                rest.setPage(realCurrentWeek - 1);
                            }}>
                            <Icon name="history" size={24} />
                        </Pressable>
                    )}
                    <UnTooltip
                        width={150}
                        height={120}
                        popover={
                            <View style={{gap: 4}}>
                                <Pressable
                                    android_ripple={userConfig.theme.ripple}
                                    onPress={() => navigation.navigate("ScheduleEdit")}>
                                    <View style={style.menuItem}>
                                        <Icon name="table-edit" size={24} />
                                        <UnText>事件编辑</UnText>
                                    </View>
                                </Pressable>
                                <Pressable
                                    android_ripple={userConfig.theme.ripple}
                                    onPress={() => setScheduleShareVisible(true)}>
                                    <View style={style.menuItem}>
                                        <Icon type="antdesign" name="share-alt" size={24} />
                                        <UnText>分享课表</UnText>
                                    </View>
                                </Pressable>
                                <Pressable
                                    android_ripple={userConfig.theme.ripple}
                                    onPress={() => setCourseScheduleSettingVisible(true)}>
                                    <View style={style.menuItem}>
                                        <Icon name="cog" size={24} />
                                        <UnText>课表设置</UnText>
                                    </View>
                                </Pressable>
                            </View>
                        }>
                        <Icon name="menu" size={24} />
                    </UnTooltip>
                    <Pressable
                        android_ripple={userConfig.theme.ripple}
                        onPress={() => {
                            loadData();
                        }}>
                        <Icon name="sync" size={24} />
                    </Pressable>
                </Flex>
            </Flex>
            <Divider />
            <CourseScheduleView<ExtendItemType>
                showDate
                showNextCourse
                showTimeSpanHighlight
                showDayHighlight
                startDay={startDay}
                timeShift={timeShift}
                courseSchedule={courseSchedule}
                pageView={pagerView}
                phyExpList={phyExpList}
                itemList={itemList}
                itemRender={itemRender}
                itemDetailRender={itemDetailRender}
                isItemShow={isItemShow}
            />
            {courseSchedule?.sjkList && (
                <>
                    <Divider />
                    <PracticalCourseList courseList={courseSchedule.sjkList} />
                </>
            )}
            {/* 课表卡片设置 */}
            <BottomSheet
                isVisible={courseScheduleSettingVisible}
                onBackdropPress={() => setCourseScheduleSettingVisible(false)}>
                <CourseCardSetting
                    containerStyle={style.bottomSheetContainer}
                    year={year}
                    term={term}
                    pageViewRest={rest}
                    onYearChange={setYear}
                    onTermChange={setTerm}
                />
            </BottomSheet>
            <BottomSheet isVisible={scheduleShareVisible} onBackdropPress={() => setScheduleShareVisible(false)}>
                <ScheduleShareSheet week={rest.activePage + 1} onClose={() => setScheduleShareVisible(false)} />
            </BottomSheet>
        </View>
    );
}
