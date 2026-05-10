import {ScrollView, StyleSheet, ToastAndroid} from "react-native";
import {Button, Tab, TabView, Text, useTheme} from "@rneui/themed";
import React, {useEffect, useState} from "react";
import {Color} from "@/shared/color.ts";
import {TimeSchedule} from "@/components/tool/infoQuery/courseSchedule/TimeSchedule.tsx";
import {Icon, UnJsonEditor, UnPressable} from "@/components/un-ui";
import {useUserConfig} from "@/hooks/useUserConfig.ts";
import {
    Flex,
    NumberInput,
    UnRefreshControl,
    UnTable,
    UnTableCols,
    UnTermSelector,
    UnText,
    vw,
} from "@/components/un-ui";
import {AttendanceQuickLogin} from "@/components/tool/auth/AttendanceQuickLogin.tsx";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";
import {AttendanceCourseClass, AttendanceDataClass} from "@/class/auth/attendanceSystem.ts";
import moment from "moment/moment";
import {AttendanceCourseItem} from "@/components/tool/auth/AttendanceCourseItem.tsx";
import {useSchoolTerm} from "@/hooks/jw.ts";
import {useWebView} from "@/hooks/app.ts";
import {TimeScheduleItemData} from "@/features/courseSchedule/type/schedule.ts";
import {AttendanceStateIcon} from "@/features/courseSchedule/components/AttendanceStateIcon.tsx";

const style = StyleSheet.create({
    container: {
        padding: vw(5),
    },
    tab: {
        width: "100%",
    },
});

export default function AttendanceInfoQueryScreen() {
    const {year, term, setBoth} = useSchoolTerm();
    const {openInWeb} = useWebView();
    const [calender, setCalender] = useState<AST.Calendar>();
    const [tabIndex, setTabIndex] = useState(0);
    const {theme} = useTheme();

    const [quickLoginShow, setQuickLoginShow] = useState(false);

    async function init() {
        setCalender(await attendanceSystemApi.calenderData.getBySchoolTerm(year, term));
    }

    async function testToken() {
        const testRes = await attendanceSystemApi.testTokenExpired();
        if (!testRes) {
            setQuickLoginShow(true);
            ToastAndroid.show("考勤系统Token已过期，请输入验证码快速登录", ToastAndroid.SHORT);
        }
        return testRes;
    }

    useEffect(() => {
        testToken();
    }, []);

    useEffect(() => {
        init();
    }, [quickLoginShow]);

    useEffect(() => {
        init();
    }, [year, term]);

    return (
        <>
            <AttendanceQuickLogin visible={quickLoginShow} onClose={() => setQuickLoginShow(false)} onSucceed={init} />
            <UnTermSelector year={year} term={term} onChange={setBoth} disableSelectAll />
            <Button
                onPress={() =>
                    openInWeb("考勤系统", {
                        uri: "https://yktuipweb.gxu.edu.cn/#/StudentHome",
                    })
                }>
                在浏览器打开考勤系统
            </Button>
            <Tab
                value={tabIndex}
                dense={true}
                titleStyle={{color: "#fff"}}
                indicatorStyle={{backgroundColor: theme.colors.primary}}
                onChange={setTabIndex}>
                <Tab.Item title="考勤课表" />
                <Tab.Item title="考勤记录" />
            </Tab>
            <TabView
                value={tabIndex}
                tabItemContainerStyle={{overflow: "hidden"}}
                animationType="timing"
                onChange={setTabIndex}>
                <TabView.Item style={style.tab}>
                    <TableScreen calender={calender} onTestToken={testToken} />
                </TabView.Item>
                <TabView.Item style={style.tab}>
                    <RecordScreen calender={calender} onTestToken={testToken} />
                </TabView.Item>
            </TabView>
        </>
    );
}

interface ScreenType {
    onTestToken: () => Promise<boolean>;
    calender?: AST.Calendar;
}

function TableScreen(props: ScreenType) {
    const {store} = useUserConfig();
    const devMode = store(s => s.devMode);
    const [week, setWeek] = useState(
        +moment.duration(moment().diff(props.calender?.firstWeekBegin)).asWeeks().toFixed() + 1,
    );
    const [attendanceData, setAttendanceData] = useState<AttendanceDataClass>();
    const [courseList, setCourseList] = useState<AttendanceCourseClass[]>([]);

    async function getData() {
        const res = await attendanceSystemApi.getAttendanceTable(week, props.calender?.calendarId);
        if (res) {
            setCourseList(res.getCourseList.flat());
        }
    }

    async function getAttendanceData() {
        if (!props.calender) return;
        const res = await attendanceSystemApi.getPersonalData(props.calender?.calendarId, {
            page_size: 1000,
        });
        if (res) setAttendanceData(new AttendanceDataClass(res.data.records, props.calender));
    }

    const [refreshing, setRefreshing] = useState(false);
    async function onRefresh() {
        setRefreshing(true);
        const testToken = await props.onTestToken();
        if (testToken) {
            await getData();
            await getAttendanceData();
        }
        setRefreshing(false);
    }

    useEffect(() => {
        const currentWeek = +moment.duration(moment().diff(props.calender?.firstWeekBegin)).asWeeks().toFixed() + 1;
        if (currentWeek <= (props.calender?.weekTotal ?? 20) && currentWeek > 0) setWeek(currentWeek);
        else setWeek(1);
    }, [props.calender]);

    useEffect(() => {
        getData();
        getAttendanceData();
    }, [week, props.calender]);

    return (
        <ScrollView
            contentContainerStyle={style.container}
            refreshControl={<UnRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <Flex>
                <Flex>
                    <Text>周数</Text>
                </Flex>
                <NumberInput value={week} onChange={setWeek} max={20} min={1} />
            </Flex>
            <TimeSchedule
                currentWeek={week}
                itemList={[
                    {
                        data: courseList,
                        isItemShow: (item, day) => moment(item._ori.weekDay).isSame(day, "d"),
                        itemRender: item => <AttendanceCourseItem attendanceData={attendanceData} course={item} />,
                    } as TimeScheduleItemData<AttendanceCourseClass>,
                ]}
                startDay={props.calender?.firstWeekBegin}
                showDate
                showDayHighlight
                showTimeSpanHighlight
            />
            {devMode && (
                <Flex gap={8} direction="column">
                    <ScheduleDataDebugCard label="查看考勤课表数据" data={courseList} />
                    <ScheduleDataDebugCard label="查看考勤记录数据" data={attendanceData} />
                </Flex>
            )}
        </ScrollView>
    );
}

function RecordScreen(props: ScreenType) {
    const {theme} = useTheme();
    const {store} = useUserConfig();
    const devMode = store(s => s.devMode);
    const [page, setPage] = useState(1);
    const [apiRes, setApiRes] = useState<AST.PageRes<AST.AttendanceData>>();

    const ColorMap = {
        [AST.AttendanceState.Normal]: theme.colors.success,
        [AST.AttendanceState.Late]: theme.colors.warning,
        [AST.AttendanceState.Absent]: theme.colors.error,
        [AST.AttendanceState.NotStarted]: theme.colors.primary,
        [AST.AttendanceState.NoNeed]: theme.colors.primary,
    };

    const [tableData, setTableData] = useState<AST.AttendanceData[]>([]);
    const cols: UnTableCols<AST.AttendanceData> = [
        {
            title: "日期",
            width: 100,
            dataIndex: "day",
        },
        {
            title: "课程名称",
            width: 200,
            dataIndex: "courseName",
        },
        {
            title: "状态",
            width: 50,
            render: (_, record) => (
                <UnText color={ColorMap[record.atdStateId] ?? theme.colors.black}>
                    <AttendanceStateIcon state={record.atdStateId} defaultColor={theme.colors.black} />
                    {record.atdStateName}
                </UnText>
            ),
        },
        {
            title: "打卡时间",
            width: 150,
            dataIndex: "atdTime",
            default: "-",
        },
        {
            title: "周时间",
            width: 100,
            dataIndex: "day",
            render: day =>
                `第${
                    +moment.duration(moment(day).diff(props.calender?.firstWeekBegin)).asWeeks().toFixed() + 1
                }周${moment(day).format("dddd")}`,
        },
        {
            title: "教室",
            width: 80,
            dataIndex: "roomName",
        },
        {
            title: "节次",
            width: 80,
            dataIndex: "periodConnect",
        },
    ];

    const [refreshing, setRefreshing] = useState(false);
    async function onRefresh() {
        setRefreshing(true);
        const testToken = await props.onTestToken();
        if (testToken) {
            await getData();
        }
        setRefreshing(false);
    }

    async function getData() {
        const res = await attendanceSystemApi.getPersonalData(props.calender?.calendarId ?? 18, {
            page_index: page,
            page_size: 20,
        });
        if (res?.code === 600) {
            setApiRes(res);
            setTableData(res.data.records);
        }
    }

    useEffect(() => {
        getData();
    }, [page, props.calender]);

    return (
        <ScrollView
            contentContainerStyle={style.container}
            refreshControl={<UnRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <Flex direction="column" align="flex-start" gap={15} justify="flex-start">
                <Text>
                    {`第${apiRes?.data.page_index ?? 1}/${apiRes?.data.total_page ?? 1}页，共有${
                        apiRes?.data.total_record ?? 0
                    }条结果`}
                </Text>
                <Flex gap={10}>
                    <Text>页数</Text>
                    <Flex inline>
                        <NumberInput value={page} onChange={setPage} min={1} max={apiRes?.data.total_page ?? 1} />
                    </Flex>
                    <Text>每页20条记录</Text>
                </Flex>
                <ScrollView horizontal>
                    <UnTable<AST.AttendanceData> data={tableData} cols={cols} />
                </ScrollView>
                <Flex gap={10}>
                    <Text>页数</Text>
                    <Flex inline>
                        <NumberInput value={page} onChange={setPage} min={1} max={apiRes?.data.total_page ?? 1} />
                    </Flex>
                    <Text>每页20条记录</Text>
                </Flex>
                {devMode && (
                    <Flex gap={8} direction="column">
                        <ScheduleDataDebugCard label="查看考勤记录API数据" data={apiRes} />
                        <ScheduleDataDebugCard label="查看考勤记录表格数据" data={tableData} />
                    </Flex>
                )}
            </Flex>
        </ScrollView>
    );
}

function ScheduleDataDebugCard({label, data}: {label: string; data: any}) {
    const {theme} = useTheme();
    const [modalOpen, setModalOpen] = useState(false);

    const styles = StyleSheet.create({
        card: {
            padding: 6,
            borderRadius: 4,
            backgroundColor: Color(theme.colors.error).setAlpha(theme.mode === "light" ? 0.5 : 0.3).rgbaString,
        },
    });
    return (
        <Flex>
            <UnPressable onPress={() => setModalOpen(true)}>
                <Flex style={styles.card} justify="flex-start" gap={4}>
                    <Icon name="console" size={16} inline />
                    <UnText weight="bold" size={16}>
                        {label}
                    </UnText>
                </Flex>
            </UnPressable>
            <UnJsonEditor.Modal readOnly visible={modalOpen} onClose={() => setModalOpen(false)} value={data} />
        </Flex>
    );
}