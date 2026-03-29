import {useMemo} from "react";
import moment from "moment";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {useJwAuth} from "@/core/auth/Jw/hooks/useJwAuth.ts";

const TIME_SPAN_START = [
    "08:00",
    "08:55",
    "10:00",
    "10:55",
    "14:30",
    "15:20",
    "16:25",
    "17:15",
    "18:10",
    "18:45",
    "19:40",
    "20:30",
    "21:20",
];

export function useNextCourse(scheduleItems: ScheduleTableItem[], startDay: moment.Moment) {
    const {authState} = useJwAuth();
    if (authState.status !== "authenticated") {
        return null;
    }

    return useMemo(() => {
        const now = moment();
        let best: {item: ScheduleTableItem; date: moment.Moment} | null = null;

        for (const item of scheduleItems) {
            const startTime = TIME_SPAN_START[item.begin - 1];
            if (!startTime) continue;

            const [h, m] = startTime.split(":").map(Number);
            const courseDate = startDay
                .clone()
                .add(item.week - 1, "weeks")
                .add(item.day - 1, "days")
                .hour(h)
                .minute(m)
                .second(0);

            if (courseDate.isAfter(now) && (!best || courseDate.isBefore(best.date))) {
                best = {item, date: courseDate};
            }
        }
        return best;
    }, [scheduleItems, startDay]);
}
