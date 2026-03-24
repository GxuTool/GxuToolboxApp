// useShift.ts
import {useCallback, useEffect, useState} from "react";
import {http} from "@/core/http.ts";
import moment from "moment";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {SchoolTermValue} from "@/type/global.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";

type ShiftRule = [string, string]; // [调课日, 调休日] ["2026-04-27", "2026-05-01"]

export function useShift(year: number, term: SchoolTermValue) {
    const [shiftRules, setShiftRules] = useState<ShiftRule[]>([]);
    const startDay = useStartDay(year, term);

    useEffect(() => {
        http.get("https://file.unde.site/GxuToolApp/data.json").then(({data}) => {
            if (data?.timeShift) setShiftRules([...data.timeShift, ["2026-04-04", "2026-04-03"]]);
        });
    }, []);

    // 应用调课规则
    const applyShift = useCallback(
        (items: ScheduleTableItem[]): ScheduleTableItem[] => {
            if (shiftRules.length === 0) return items;

            // 预计算：调休日 → 对应的 week+day
            const restDays = new Set(
                shiftRules.map(([_, restDate]) => {
                    const d = moment(restDate);
                    const week = d.diff(startDay, "weeks") + 1;
                    const day = d.isoWeekday();
                    return `${week}-${day}`;
                }),
            );

            // 过滤掉调休日的课（那天放假）
            const filtered = items.filter(item => !restDays.has(`${item.week}-${item.day}`));

            // 把调课日应该上的课"复制"过去
            const additions: ScheduleTableItem[] = [];
            for (const [workDate, restDate] of shiftRules) {
                const workMoment = moment(workDate);
                const restMoment = moment(restDate);

                const targetWeek = workMoment.diff(startDay, "weeks") + 1;
                const targetDay = workMoment.isoWeekday();

                // 找到调休日原本的课
                const sourceWeek = restMoment.diff(startDay, "weeks") + 1;
                const sourceDay = restMoment.isoWeekday();

                const sourceCourses = items.filter(item => item.week === sourceWeek && item.day === sourceDay);

                // 复制到调课日，修改 week + day
                for (const course of sourceCourses) {
                    additions.push({
                        ...course,
                        id: `shift-${course.id}`,
                        week: targetWeek,
                        day: targetDay as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                        isShift: true,
                    });
                }
            }

            return [...filtered, ...additions];
        },
        [shiftRules, startDay],
    );

    return {applyShift};
}
