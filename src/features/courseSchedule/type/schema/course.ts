import {z} from "zod";
import {parseWeeks} from "@/js/nextCourses.ts";

const PracticeCourseSchema = z
    .object({
        qtkcgs: z.string(),
        qsjsz: z.string(),
        jsxm: z.string(),
    })
    .loose();

const TheoryCourseSchema = z.object({
    cdbh: z.string(),
    jcs: z.string(),
    kcmc: z.string(),
    zcd: z.string(),
    xqj: z.string(),
    xm: z.string(),
});

const rawCourse = z.object({
    sjkList: z.array(PracticeCourseSchema).default([]),
    kbList: z.array(TheoryCourseSchema).default([]),
});

export const ICourse = rawCourse.transform(i => ({
    practiceList: i.sjkList.map(c => ({
        title: c.qtkcgs,
        time: c.qsjsz,
        teacher: c.jsxm,
        source:"jw"
    })),
    theoryList: i.kbList.map(c => ({
        location: c.cdbh,
        index: c.jcs,
        title: c.kcmc,
        week: parseWeeks(c.zcd),
        teacher: c.xm,
        day: c.xqj,
        source: "jw",
    })),
}));

export type ICourse = z.infer<typeof ICourse>;
