import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function normalizeCourse(data: ICourse): ScheduleTableItem[] {
    const items: ScheduleTableItem[] = [];

    if (!data?.theoryList) return items;

    data.theoryList.forEach(course => {
        // week is already number[] from Zod
        const weeks = course.week;

        weeks.forEach(week => {
            items.push({
                id: `${course.title}-${week}-${course.day}-${course.index}`,
                week: week,
                day: course.day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                begin: course.begin as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
                end: course.end as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
                title: course.title,
                location: course.location,
                teacher: course.teacher,
                raw: course.raw,
                qq: course.qq,
                // color: undefined,
            });
        });
    });

    return items;
}
