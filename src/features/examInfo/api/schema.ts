import {z} from "zod";
import {parseExamTime} from "@/features/examInfo/utils/timeParser.ts";

const rawItem = z.object({
    cdmc: z.string(),
    kcmc: z.string(),
    kssj: z.string(),
    sjbh: z.string(),
    zwh: z.string().optional(),
    ksmc: z.string(),
});

export const ExamSchema = rawItem.transform(i => {
    const {date, status} = parseExamTime(i.kssj);
    return {
        course: i.kcmc,
        classroom: i.cdmc,
        time: i.kssj,
        courseId: i.sjbh,
        seat: i.zwh,
        type: i.ksmc,
        examDate: date,
        status: status,
    };
});

export const ExamApiResScheme = z.object({
    currentPage: z.number(),
    totalPage: z.number(),
    totalCount: z.number(),
    items: z.array(ExamSchema),
});
