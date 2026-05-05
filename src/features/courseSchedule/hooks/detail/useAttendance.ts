import {attendanceMachine} from "@/core/auth/attendance/attendanceMachine.ts";
import {AuthState} from "@/core/auth/createAuthCore.ts";
import {Account} from "@/core/auth/auth.type.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {attendanceApi} from "@/features/attendance/api";
import {attendanceSystemApi} from "@/js/auth/attendanceSystem.ts";
import {AttendanceSystemType as AST} from "@/type/api/auth/attendanceSystem.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import moment from "moment";
import {store} from "@/core/store.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {create} from "zustand/react";

interface AttendanceStoreState {
    status: AuthState<Account>;
    attendanceList: AST.AttendanceData[];
    normalizedList: ScheduleTableItem[];
}

const useAttendanceStore = create<AttendanceStoreState>()(() => ({
    status: attendanceMachine.getState(),
    attendanceList: [],
    normalizedList: [],
}));

function normalizeAttendance(
    raw: AST.AttendanceData[],
    startDay: moment.Moment,
): ScheduleTableItem[] {
    return raw.map(item => ({
        id: `${item.day}-${item.periodSplit}`,
        week: moment(item.day).diff(startDay, "week") + 1,
        day: moment(item.day).day() as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        begin: Number(item.periodSplit.split(",")[0]) as
            | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
        end: Number(item.periodSplit.split(",")[1]) as
            | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
        title: item.courseName,
        kind: "attendance",
        status: item.atdStateId,
    }));
}

export const useAttendance = () => {
    async function init(year: number, term: SchoolTermValue) {
        const startDay = useStartDay(year, term);

        const setData = (raw: AST.AttendanceData[], shouldCache: boolean): void => {
            if (shouldCache) {
                store.save({key: "originalAttendanceList", data: raw});
            }
            const current = useAttendanceStore.getState().attendanceList;
            if (JSON.stringify(current) === JSON.stringify(raw)) return;
            useAttendanceStore.setState({
                attendanceList: raw,
                normalizedList: normalizeAttendance(raw, startDay),
            });
        };

        // 从内存中加载缓存
        try {
            const cachedRaw = await store.load({key: "originalAttendanceList"}).catch(() => null);
            if (cachedRaw) {
                setData(cachedRaw, false);
            }
        } catch {}

        // 从考勤系统拉取数据
        try {
            const authState = await attendanceMachine.refreshToken();
            useAttendanceStore.setState({status: authState});
            if (authState.status !== "authenticated") return;

            const cal = await attendanceSystemApi.calenderData.getBySchoolTerm(year, term);
            if (!cal) return;

            const res = await attendanceApi.getPersonalData(cal.calendarId, 1000);
            const fetchedRaw = res.data.records;

            if (fetchedRaw) {
                setData(fetchedRaw, true);
            }
        } catch {}
    }

    return {
        store: useAttendanceStore,
        init,
    };
};
