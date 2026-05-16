import { z } from "zod";

const rawExam = z.array(z.object({
    cdmc: z.string(),
    kcmc: z.string(),
    kssj: z.string(),
    sjbh: z.string(),
    zwh: z.string().optional()
})).default([]);

export const IExam = rawExam.transform(arr =>
    arr.map(i => ({
        course: i.kcmc,
        classroom: i.cdmc,
        time: i.kssj,
        courseId: i.sjbh,
        seat: i.zwh
    }))
);

export type IExam = z.infer<typeof IExam>
