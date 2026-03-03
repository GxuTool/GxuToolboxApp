type ScheduleType = "course" | "exam" | "experiment" | "personal" | "holiday";

export interface Schedule {
    id: string;
    type: ScheduleType;
    week: number; // 1-20
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    time: number[]; // [1,2,3,4]
    title: string;
    location?: string;
    teacher?: string;
    color?: string;
    source: "jw" | "user" | "system";
    raw?: unknown; // 兼容旧数据，迁移期用
}
