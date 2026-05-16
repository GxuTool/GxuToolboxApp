import {http, urlWithParams} from "@/core/http.ts";
import {userMgr} from "@/js/mgr/user.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {store} from "@/core/store.ts";
import moment from "moment";
import {AttendanceCourseScheduleClass} from "@/class/auth/attendanceSystem.ts";
import {SchoolTermValue, SchoolYearValue} from "@/type/global.ts";
/**
 * 考勤系统相关的API接口封装
 */
export const attendanceSystemApi = {
    testTokenExpired: async (): Promise<boolean> => {
        try {
            const res = await attendanceSystemApi.getMenuData();
            return res?.code === 600;
        } catch (e) {
            return false;
        }
    },

    /**
     * 获取菜单数据，带有学期数据
     * @returns 返回首页数据
     */
    getMenuData: async (): Promise<AST.ResRoot<AST.MenuData> | undefined> => {
        const queryParams = {
            rm: "SYS004", // 写死的
        };
        // 获取登录凭证，若无有效token则直接返回
        const loginRes = await userMgr.attendanceSystem.getLoginRes();
        if (!loginRes || !loginRes.data.token) return;
        // 发起GET请求获取个人考勤数据
        const res = await http.get<AST.ResRoot<AST.MenuData>>(
            urlWithParams("https://yktuipweb.gxu.edu.cn/api/account/getIndexData", queryParams),
            {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    Authorization: "Token " + loginRes.data.token,
                },
            },
        );
        if (res.data.code === 600) {
            // 缓存返回
            await store.save({
                key: "AttendanceSystemMenuData",
                data: res.data,
            });
        }
        return res.data;
    },

    /**
     * 日历数据相关
     */
    calenderData: {
        /**
         * 获取日历数据列表
         * @returns Promise<AST.CalendarData[]> 日历数据列表
         */
        getList: async () => {
            // 尝试从本地存储加载菜单数据
            const storeData = await store
                .load<AST.ResRoot<AST.MenuData>>({key: "AttendanceSystemMenuData"})
                .catch(e => null);

            // 如果本地存储没有数据，则从API获取
            if (!storeData) {
                const res = await attendanceSystemApi.getMenuData();
                if (res?.code === 600) {
                    return res.data.calendarList;
                }
                return [];
            }
            return storeData.data.calendarList;
        },

        /**
         * 根据日期获取对应的日历数据
         * @param date 日期
         * @returns Promise<AST.CalendarData | undefined> 匹配的日历数据或undefined
         */
        get: async (date: moment.MomentInput) => {
            const dateM = moment(date);
            const calenderList = await attendanceSystemApi.calenderData.getList();
            // 查找包含指定日期的日历数据
            return calenderList.find(calender =>
                dateM.isBetween(calender.firstWeekBegin, calender.lastWeekEnd, "d", "[]"),
            );
        },

        /**
         * 根据学期id获取对应的日历数据
         * @param termId 学期id
         * @returns Promise<AST.CalendarData | undefined> 匹配的日历数据或undefined
         */
        getByTermId: async (termId: number) => {
            const calenderList = await attendanceSystemApi.calenderData.getList();
            // 查找包含指定日期的日历数据
            return calenderList.find(calender => calender.calendarId === termId);
        },

        /**
         * 根据学年和学期获取对应的日历数据
         * @param termId 学期id
         * @returns Promise<AST.CalendarData | undefined> 匹配的日历数据或undefined
         */
        getBySchoolTerm: async (year: SchoolYearValue | number, term: SchoolTermValue | number) => {
            const calenderList = await attendanceSystemApi.calenderData.getList();
            // 查找包含指定日期的日历数据
            return calenderList.find(calender => calender.calendarName === `${year}-${term}`);
        },

        /**
         * 获取当前日期对应的日历数据
         * @returns Promise<AST.CalendarData | undefined> 当前日期的日历数据或undefined
         */
        getCurrent: async () => (await attendanceSystemApi.calenderData.getList()).find(calender => calender.isCurrent),
    },

    /**
     * 获取个人考勤数据列表（分页）
     * @param termId 学期ID，为空时获取全部
     * @param data 查询参数对象，可选
     * @returns 返回分页查询结果，包含数据列表和分页信息；如果未登录则返回undefined
     */
    getPersonalData: async (
        termId?: AST.Calendar["calendarId"],
        data?: Partial<AST.PageQueryParam>,
    ): Promise<AST.PageRes<AST.AttendanceData> | undefined> => {
        // 合并默认参数与传入参数
        const defaultData = {
            page_index: 1,
            page_size: 30,
            order_by: "",
            search: {
                ksrq: "",
                jsrq: "",
                courseId: "",
            },
            ...data,
        };

        // 获取登录凭证，若无有效token则直接返回
        const loginRes = await userMgr.attendanceSystem.getLoginRes();
        if (!loginRes || !loginRes.data.token) return;

        // 发起POST请求获取个人考勤数据
        const res = await http.post<AST.PageRes<AST.AttendanceData>>(
            urlWithParams("https://yktuipweb.gxu.edu.cn/api/personalData/getPersonalData", {
                cal: termId ?? "",
                rm: "SYS004",
            }),
            defaultData,
            {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    Authorization: "Token " + loginRes.data.token,
                },
            },
        );
        return res.data;
    },

    /**
     * 获取个人考勤统计数据
     * @param termId 学期ID，为空时获取全部
     * @param data 查询参数对象，可选
     * @returns 返回考勤统计结果数组，正常情况应该只有一个元素；如果未登录则返回undefined
     */
    getPersonalDataCount: async (
        termId?: AST.Calendar["calendarId"],
        data?: AST.SearchParam,
    ): Promise<AST.ResRoot<AST.AttendanceDataStatistic[]> | undefined> => {
        // 合并默认参数与传入参数
        const defaultData = {
            ksrq: "",
            jsrq: "",
            courseId: "",
            ...data,
        };

        // 获取登录凭证，若无有效token则直接返回
        const loginRes = await userMgr.attendanceSystem.getLoginRes();
        if (!loginRes || !loginRes.data.token) return;

        // 发起POST请求获取个人考勤统计数据
        const res = await http.post<AST.ResRoot<any>>(
            urlWithParams("https://yktuipweb.gxu.edu.cn/api/personalData/getPersonalDataCount", {
                cal: termId ?? "",
                rm: "SYS004",
            }),
            defaultData,
            {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    Authorization: "Token " + loginRes.data.token,
                },
            },
        );
        return res.data;
    },

    /**
     * 获取考勤系统学生课表数据
     * @param termId 学期ID，为空时获取全部
     * @return 返回考勤系统学生课表数据
     */
    getAttendanceTable: async (week: number, termId = 18): Promise<AttendanceCourseScheduleClass | undefined> => {
        const loginRes = await userMgr.attendanceSystem.getLoginRes();
        if (!loginRes || !loginRes.data.token) return;
        const defaultData = {
            currentWeek: week,
            userId: loginRes.data.userInfo.userId,
        };
        const res = await http.post<AST.ResRoot<AST.AttendanceCourseSchedule>>(
            urlWithParams("https://yktuipweb.gxu.edu.cn/api/rank/selectByStudent", {
                cal: termId,
                rm: "SYS004",
            }),
            defaultData,
            {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    Authorization: "Token " + loginRes.data.token,
                },
            },
        );
        return new AttendanceCourseScheduleClass(res.data.data);
    },
};
