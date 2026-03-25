import {SchoolTermValue} from "@/type/global.ts";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useMemo} from "react";
import {useAttendance} from "@/features/courseSchedule/hooks/detail/useAttendance.ts";
import {AuthState} from "@/core/auth/auth.type.ts";
import {useShift} from "@/features/courseSchedule/hooks/detail/useShift.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useCourse(year: number, term: SchoolTermValue): ScheduleTableItem[] {
    const baseCourse = useBaseCourse(year, term) || [];
    const phyExpList = usePhyExp(year, term) || [];
    const {applyShift} = useShift(year, term);
    const {
        status,
        attendanceList,
    }: {
        status: AuthState;
        attendanceList: ScheduleTableItem[];
    } = useAttendance(year, term);

    return useMemo(() => {
        // 如果主课表还没加载完，直接原样返回
        if (baseCourse.length === 0) return [];

        // 确保是数组类型再执行 map，防止外部接口返回包裹对象（如 { data: [...] }）
        const safePhyList = Array.isArray(phyExpList) ? phyExpList : [];
        const phyDict = new Map(safePhyList.map(item => [`${item.week}-${item.day}-${item.begin}-${item.end}`, item]));
        const attendanceDict = new Map(
            attendanceList.map(item => [`${item.week}-${item.day}-${item.begin}-${item.end}`, item]),
        );

        const enriched = baseCourse.map(course => {
            let enrichedCourse = {...course};
            const searchKey = `${course.week}-${course.day}-${course.begin}-${course.end}`;
            // PART 1: 替换物理实验
            if (enrichedCourse.title && enrichedCourse.title.includes("物理实验")) {
                if (phyDict.has(searchKey)) {
                    const ext = phyDict.get(searchKey);
                    // 赋值替换
                    enrichedCourse.subtitle = ext.course;
                    enrichedCourse.teacher = ext.teacher;
                    enrichedCourse.location = ext.classroom;
                }
            }

            // PART 2: 加入考勤数据
            if (status.status === "authenticated") {
                if (attendanceDict.has(searchKey)) {
                    const ext = attendanceDict.get(searchKey);
                    // 赋值替换
                    enrichedCourse.status = ext.status;
                }
            }

            return enrichedCourse;
        });

        // PART 3: 加入调课数据
        return applyShift(enriched);
    }, [baseCourse, phyExpList, attendanceList, applyShift]);
}
