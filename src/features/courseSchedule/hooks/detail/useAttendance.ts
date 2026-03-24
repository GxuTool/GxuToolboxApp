import {attendanceMachine} from "@/core/auth/attendance/attendanceMachine.ts";
import {useCallback, useEffect, useState} from "react";
import {AuthState} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {attendanceApi} from "@/features/attendance/api";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import moment from "moment";
import {store} from "@/core/store.ts";

export const useAttendance = (year: number, term: SchoolTermValue) => {
    const [status, setStatus] = useState<AuthState<Account>>(attendanceMachine.getState());
    const [attendanceList, setAttendanceList] = useState<ScheduleTableItem[]>([]);
    const startDay = useStartDay(year, term);
    const fetchAttendance = useCallback(async () => {
        const processAndSet = (raw: AST.AttendanceData[], shouldCache: boolean): void => {
            const newModel: ScheduleTableItem[] = raw.map(item => {
                return {
                    id: `${item.day}-${item.periodSplit}`,
                    week: moment(item.day).diff(startDay, "week") + 1,
                    day: moment(item.day).day() as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                    begin: Number(item.periodSplit.split(",")[0]) as | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
                    end: Number(item.periodSplit.split(",")[1]) as | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
                    title: item.courseName,
                    kind: "attendance",
                    status: item.atdStateId,
                };
            });

            if (shouldCache) {
                store.save({key: "originalAttendanceList", data: raw});
            }

            setAttendanceList(currentModel => {
                if (JSON.stringify(currentModel) === JSON.stringify(newModel)) {
                    return currentModel;
                }
                return newModel;
            });
        };

        // 从内存中加载缓存
        try {
            const cachedRaw = await store.load({key: "originalAttendanceList"}).catch(() => null);
            if (cachedRaw) {
                processAndSet(cachedRaw, false);
            }
        } catch (e) {}

        // 从考勤系统拉取数据
        try {
            const authState = await attendanceMachine.refreshToken();
            setStatus(authState);
            if (authState.status !== "authenticated") return;

            const cal = await attendanceSystemApi.calenderData.getBySchoolTerm(year, term);
            if (!cal) return;

            const res = await attendanceApi.getPersonalData(cal.calendarId, 1000);
            const fetchedRaw = res.data.records;

            if (fetchedRaw) {
                processAndSet(fetchedRaw, true);
            }
        } catch (e) {}
    }, [year, term]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    return {status, attendanceList};
};
