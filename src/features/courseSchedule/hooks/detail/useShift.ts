import {create} from "zustand/react";
import {http} from "@/core/http.ts";
import moment from "moment";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";

type ShiftRule = [string, string];

interface ShiftStoreState {
    shiftRules: ShiftRule[];
}

interface ShiftStoreAction {}

const useShiftStore = create<ShiftStoreState & ShiftStoreAction>()(set => ({
    shiftRules: [],
}));

/** 对课表项应用调课规则，返回处理后的新数组 */
export function applyShift(
    items: ScheduleTableItem[],
    shiftRules: ShiftRule[],
    startDay: moment.Moment,
): ScheduleTableItem[] {
    if (shiftRules.length === 0) return items;

    const restDays = new Set(
        shiftRules.map(([_, restDate]) => {
            const d = moment(restDate);
            const week = d.diff(startDay, "weeks") + 1;
            const day = d.isoWeekday();
            return `${week}-${day}`;
        }),
    );

    const filtered = items.filter(item => !restDays.has(`${item.week}-${item.day}`));

    const additions: ScheduleTableItem[] = [];
    for (const [workDate, restDate] of shiftRules) {
        const workMoment = moment(workDate);
        const restMoment = moment(restDate);

        const targetWeek = workMoment.diff(startDay, "weeks") + 1;
        const targetDay = workMoment.isoWeekday();

        const sourceWeek = restMoment.diff(startDay, "weeks") + 1;
        const sourceDay = restMoment.isoWeekday();

        const sourceCourses = items.filter(item => item.week === sourceWeek && item.day === sourceDay);

        for (const course of sourceCourses) {
            additions.push({
                ...course,
                id: `shift-${course.id}`,
                week: targetWeek,
                day: targetDay as ScheduleTableItem['day'],
                isShift: true,
            });
        }
    }

    return [...filtered, ...additions];
}

export const useShift = () => {
    async function init() {
        try {
            const {data} = await http.get(`https://file.unde.site/GxuToolApp/data.json?_=${Date.now()}`);
            if (data?.timeShift) {
                useShiftStore.setState({shiftRules: [...data.timeShift]});
            }
        } catch {
            // 加载失败，保持默认空数组
        }
    }
    return {
        store: useShiftStore,
        init,
    };
};
