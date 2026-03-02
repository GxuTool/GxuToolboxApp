import {useCallback, useEffect, useState} from "react";
import {ExamInfo} from "@/type/infoQuery/exam/examInfo.ts";
import {examApi} from "@/js/jw/exam.ts";
import {store} from "@/core/store.ts";
import {useUserConfig} from "@/hooks/app.ts";
import {UserInfo} from "@/type/infoQuery/base.ts";
import {JwCore} from "@/core/auth/JwCore.ts";
import {courseApi} from "@/js/jw/course.ts";
import moment from "moment/moment";
import {AttendanceDataClass} from "@/class/auth/attendanceSystem.ts";
import {PhyExp} from "@/type/infoQuery/course/course.ts";
import {CourseClass} from "@/class/jw/course.ts";
import {http} from "@/core/http.ts";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";
import {useTheme} from "@rneui/themed";
import {SchoolTermValue} from "@/type/global.ts";
import {IActivity} from "@/type/app/activity.ts";
// 金工实训
type EngTrainingExp = {
    date: string;
    name: string;
    y: number;
    span: number;
    backgroundColor: string;
    type: "engTrainingExp";
};

export function useCourseSchedule(year: number, term: SchoolTermValue) {
    const {userConfig, updateUserConfig} = useUserConfig();
    const {theme} = useTheme();
    const [examList, setExamList] = useState<ExamInfo[]>([]);
    const [courseSchedule, setCourseSchedule] = useState<CourseClass[]>();
    const startDay = moment(userConfig.jw.startDay);
    const [phyExpList, setPhyExpList] = useState<PhyExp[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceDataClass>();

    const getStartDay = useCallback(async () => {
        const userInfo = await store
            .load<UserInfo>({
                key: "userInfo",
            })
            .catch(console.warn);
        const account = await JwCore.loadAccount();
        if (!userInfo || !account) return;

        const data = await courseApi.getClassCourseScheduleNew(year, term, account.username.slice(2, 8));

        if (!Array.isArray(data?.weekNum) || (data?.weekNum.length ?? 0) < 1) return;
        const firstDay = data?.weekNum[0].rq.split("/")[0];
        if (userConfig.jw.startDay !== firstDay && typeof firstDay === "string") {
            userConfig.jw.startDay = firstDay;
            updateUserConfig(userConfig);
        }
    }, [year, term]);

    const getExamList = useCallback(async () => {
        const data = await examApi.getExamInfo(year, term);
        if (data?.items) {
            setExamList(data.items);
            await store.save({key: "examInfo", data});
        }
    }, [year, term]);

    const getCourseSchedule = useCallback(async () => {
        const data = await courseApi.getCourseSchedule(year, term);
        if (data?.kbList) {
            await store.save({key: "courseRes", data});
            getPhyExp(data.kbList);
            setCourseSchedule(data.kbList);
        }
    }, [year, term]);

    const getPhyExp = useCallback(
        async (currentSchedule?: CourseClass[]) => {
            const list = currentSchedule || courseSchedule;
            if (!list || !Array.isArray(list)) return;

            if (!(list.findIndex(item => item.kcmc === "大学物理实验") > -1)) {
                return;
            }
            const {data} = await courseApi.getPhyExpList();
            setPhyExpList(data);
            await store.save({
                key: "phyExpList",
                data,
            });
        },
        [courseSchedule],
    );

    async function getAttendanceData() {
        const calender = await attendanceSystemApi.calenderData.get(userConfig.jw.startDay);
        const attendanceDataRes = await attendanceSystemApi.getPersonalData(calender?.calendarId, {page_size: 1000});
        if (attendanceDataRes?.data && calender) {
            setAttendanceData(new AttendanceDataClass(attendanceDataRes.data.records, calender));
        }
    }

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

    useEffect(() => {
        getExamList();
        getStartDay();
        getCourseSchedule();
        getTimeShift();
        getAttendanceData();
        getActivityList();
    }, [year, term]);

    return {examList, startDay, courseSchedule, timeShift, phyExpList, attendanceData, activityList};
}
