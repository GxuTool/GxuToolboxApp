import {SchoolTermValue} from "@/type/global.ts";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useCallback, useEffect, useMemo} from "react";
import {useAttendance} from "@/features/courseSchedule/hooks/detail/useAttendance.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useCourse(
    year: number,
    term: SchoolTermValue,
): {
    items: ScheduleTableItem[];
    refresh: () => Promise<void>;
    loading: boolean;
} {
    const {item: baseCourse, refresh: refreshBaseCourse, loading: baseCourseLoading} = useBaseCourse(year, term);
    const {store: phyExpStore, init: initPhyExp} = usePhyExp();
    const {store: attStore, init: initAttendance} = useAttendance();
    const startDay = useStartDay(year, term);
    const phyExpList = phyExpStore(s => s.phyExpList) || [];
    const attendanceList = attStore(s => s.normalizedList);
    const attStatus = attStore(s => s.status);

    useEffect(() => {
        initPhyExp(year, term);
        initAttendance(year, term, startDay);
    }, [year, term]);

    const safeBase = baseCourse || [];

    const items = useMemo(() => {
        if (safeBase.length === 0) return [];

        const safePhyList = Array.isArray(phyExpList) ? phyExpList : [];
        const attendanceDict = new Map(
            attendanceList.map(item => [`${item.week}-${item.day}-${item.begin}-${item.end}`, item]),
        );

        let phyIdx = 0;
        const enriched = safeBase.map(course => {
            let enrichedCourse = {...course};
            const searchKey = `${course.week}-${course.day}-${course.begin}-${course.end}`;
            if (enrichedCourse.title && enrichedCourse.title.includes("物理实验")) {
                const ext = safePhyList[phyIdx];
                phyIdx++;
                if (ext) {
                    enrichedCourse.teacher = ext.teacher;
                    enrichedCourse.location = ext.classroom;
                    enrichedCourse.raw = {
                        ...enrichedCourse.raw,
                        xm: ext.teacher,
                        cdmc: ext.classroom,
                    };
                }
            }
            if (attStatus.status === "authenticated") {
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
        await Promise.all([refreshBaseCourse(), initAttendance(year, term, startDay)]);
    }, [refreshBaseCourse, initAttendance, year, term, startDay]);

    return {items, refresh, loading: baseCourseLoading};
}
