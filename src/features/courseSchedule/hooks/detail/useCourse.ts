import {SchoolTermValue} from "@/type/global.ts";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useCallback, useMemo} from "react";
import {useAttendance} from "@/features/courseSchedule/hooks/detail/useAttendance.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useCourse(
    year: number,
    term: SchoolTermValue,
): {
    items: ScheduleTableItem[];
    refresh: () => Promise<void>;
} {
    const {item: baseCourse, refresh: refreshBaseCourse} = useBaseCourse(year, term);
    const phyExpList = usePhyExp(year, term) || [];
    const {status, attendanceList, refresh: refreshAttendance} = useAttendance(year, term);

    const safeBase = baseCourse || [];

    const items = useMemo(() => {
        if (safeBase.length === 0) return [];

        const safePhyList = Array.isArray(phyExpList) ? phyExpList : [];
        const phyDict = new Map(safePhyList.map(item => [`${item.week}-${item.day}-${item.begin}-${item.end}`, item]));
        const attendanceDict = new Map(
            attendanceList.map(item => [`${item.week}-${item.day}-${item.begin}-${item.end}`, item]),
        );

        const enriched = safeBase.map(course => {
            let enrichedCourse = {...course};
            const searchKey = `${course.week}-${course.day}-${course.begin}-${course.end}`;
            if (enrichedCourse.title && enrichedCourse.title.includes("物理实验")) {
                if (phyDict.has(searchKey)) {
                    const ext = phyDict.get(searchKey);
                    enrichedCourse.subtitle = ext.course;
                    enrichedCourse.teacher = ext.teacher;
                    enrichedCourse.location = ext.classroom;
                }
            }
            if (status.status === "authenticated") {
                if (attendanceDict.has(searchKey)) {
                    const ext = attendanceDict.get(searchKey);
                    enrichedCourse.status = ext.status;
                }
            }
            return enrichedCourse;
        });

        return enriched;
    }, [safeBase, phyExpList, attendanceList]);

    const refresh = useCallback(async () => {
        await Promise.all([refreshBaseCourse(), refreshAttendance()]);
    }, [refreshBaseCourse, refreshAttendance]);

    return {items, refresh};
}
