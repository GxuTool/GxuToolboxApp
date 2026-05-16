import {BaseClass} from "@/class/class.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import moment from "moment/moment";
import {CourseClass} from "@/class/jw/course.ts";

export interface TermAttendanceData {
    recordList: AST.AttendanceData[];
    calenderData: AST.Calendar;
}
export class AttendanceDataClass extends BaseClass<TermAttendanceData> implements TermAttendanceData {
    recordList!: AST.AttendanceData[];
    calenderData!: AST.Calendar;

    constructor(list: AST.AttendanceData[], calenderData: AST.Calendar) {
        super({
            recordList: list,
            calenderData,
        });
    }

    /**
     * 从记录中获取对应课程对应周的打卡记录，判断时间范围为上课前20分钟到下课，不存在时无返回
     * @param course 目标课程
     * @param week 目标周
     */
    getAttendanceRecord(course: CourseClass, week: number): AST.AttendanceData | undefined {
        const weekSpans = course._ori.zcd.split(",");
        let inTargetWeek = false;
        // 判断目标周是否有这节课
        weekSpans.forEach(weekSpan => {
            const weeks = weekSpan
                .replace(/[^0-9-]/g, "")
                .split("-")
                .map(weekItem => parseInt(weekItem, 10));
            if (
                ((weeks.length === 1 && weeks[0] === week) || (weeks[0] <= week && week <= weeks[1])) &&
                !((/单/.test(weekSpan) && week % 2 === 0) || (/双/.test(weekSpan) && week % 2 === 1))
            ) {
                inTargetWeek = true;
                return;
            }
        });
        if (!inTargetWeek) return; // 不在当周
        const day = moment(this._ori.calenderData.firstWeekBegin).add({
            w: week - 1,
            day: +course._ori.xqj - 1,
        });
        const [startTime, endTime] = course.getAttendanceTimeSpan(day);
        return this._ori.recordList.find(
            record =>
                moment(record.day).isSame(startTime, "D") && course._ori.jcs.split("-").join(",") === record.periodSplit,
        );
    }

    /**
     * 从记录中获取指定日期的全天考勤记录
     * @param date 目标日期，字符串格式“YYYY-MM-DD”
     */
    getAttendanceRecordByDate(date: moment.MomentInput): AST.AttendanceData[] {
        return this._ori.recordList.filter(item => moment(item.day).isSame(date, "day"));
    }

    /**
     * @return 返回当前周
     */
    get getCurrentWeek(): number {
        return (
            moment().startOf("isoWeek").diff(moment(this._ori.calenderData.firstWeekBegin).startOf("isoWeek"), "weeks") + 1
        );
    }

    /**
     * 获取指定课程在指定周次的考勤状态
     * 实际上，你也可以直接看记录的状态名词属性。你问我为啥会有这个函数，问就是写完才想起来有对应属性。
     * 当然也不是一无是处，这个可以计算未开始的情况。
     * @param course 课程对象，包含课程的相关信息
     * @param week 周数，表示要查询的课程所在周次
     * @returns 返回指定课程在指定周次的课程安排信息
     */
    getAttendanceState(course: CourseClass, week: number): AST.AttendanceState {
        // 获取指定课程在指定周次的考勤记录
        const record = this.getAttendanceRecord(course, week);
        // 计算课程具体日期：从学期第一周开始日期加上周数和星期几的偏移量
        const day = moment(this._ori.calenderData.firstWeekBegin).add({
            w: week - 1,
            day: +course._ori.xqj - 1,
        });

        if (!record) return day.isBefore(moment()) ? AST.AttendanceState.NoNeed : AST.AttendanceState.NotStarted;

        // 获取课程的考勤时间范围
        const [startTime, endTime] = course.getAttendanceTimeSpan(day);

        // 根据当前时间判断考勤状态
        const recordTime = moment(record.atdTime);
        const courseBeginTime = startTime.clone().add(20, "m");
        if (record.atdStateId === AST.AttendanceState.Absent) return AST.AttendanceState.Absent;
        else if (recordTime.isBefore(startTime)) return AST.AttendanceState.NotStarted;
        else if (recordTime.isBetween(startTime, courseBeginTime, null, "[]")) return AST.AttendanceState.Normal;
        else if (recordTime.isBetween(courseBeginTime, endTime, null, "(]")) return AST.AttendanceState.Late;
        else return AST.AttendanceState.Absent;
    }

    /**
     * 获取指定日期的指定节次的考勤状态
     * @param date 日期，字符串格式“YYYY-MM-DD”
     * @param targetPeriod 目标节数
     */
    getAttendanceStateByDate(date: moment.MomentInput, targetPeriod: number): AST.AttendanceState | undefined {
        const records = this.getAttendanceRecordByDate(date);
        return records.find(record => {
            const period = record.periodSplit!.split(",").map(item=>+item);
            return period[0] <= targetPeriod && period[1] >= targetPeriod;
        })?.atdStateId || undefined;
    }
}

export class AttendanceCourseScheduleClass extends BaseClass<AST.AttendanceCourseSchedule> implements AST.AttendanceCourseSchedule {
    periodMax!: number;
    periodTime!: null;
    periodTimeAll!: AST.PeriodTimeItem[];
    resTableRankList!: AST.DayInfo[];
    roomRankList!: null;
    studentRankList!: null;
    teacherRankList!: null;
    weekList!: AST.WeekItem[];
    weekTotal!: number;

    courseList!: AttendanceCourseClass[][];

    constructor(ori: AST.AttendanceCourseSchedule) {
        super(ori);
        this.courseList = this.getCourseList;
    }

    /**
     * 获取某一天的所有课程
     * @param day 星期几
     */
    getCourseListByDay(day: number): AttendanceCourseClass[] {
        const res = [];
        for (let timeSpan = 0; timeSpan < this._ori.resTableRankList.length; timeSpan++) {
            const item = this._ori.resTableRankList[timeSpan].courses[day];
            if (item.subjectName) {
                if (item.connectCount > 0) {
                    item.periodArry = new Array(2).fill(0).map((_, i) => timeSpan + i + 1);
                    res.push(new AttendanceCourseClass(item));
                }
            }
        }
        return res;
    }

    /**
     * @return 解析返回本周的所有课（如果当天无课，返回空数组）
     */
    get getCourseList() {
        const res: AttendanceCourseClass[][] = [];
        for (let day = 1; day <= 7; day++) {
            if (this.getCourseListByDay(day)) {
                res.push(this.getCourseListByDay(day));
            }
        }
        this.courseList = res;
        return res;
    }
}

export class AttendanceCourseClass extends BaseClass<AST.CourseItem> implements AST.CourseItem {
    connectCount!: number;
    courseName!: string | null;
    courseState!: number | null;
    courseType!: number | null;
    dayOfWeek!: number | null;
    dayOfWeekStr!: string | null;
    isConnect!: number;
    period!: number | null;
    periodArry!: number[] | null;
    periodArryStr!: string | null;
    reviseAtdResult!: number | null;
    roomId!: number | null;
    roomName!: string | null;
    subjectId!: number | null;
    subjectName!: string | null;
    teacherName!: string | null;
    weekDay!: string | null;

    constructor(ori: AST.CourseItem) {
        super(ori);
    }
}
