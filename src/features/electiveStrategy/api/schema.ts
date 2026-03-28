import {z} from "zod";


const rawItem = z.object({
    kcmc: z.string(),
    xsmc: z.string(),
    kklxmc: z.string(),
    kcfl: z.string(),
    kcgsmc: z.string().optional(),
    kcxzmc: z.string(),
    jsmc: z.string(),
    xf: z.string().transform(Number),
});

export const CourseListSchema = rawItem.transform(i => {
    return {
        /** 课程名称 kcmc */
        courseName: i.kcmc,
        /** 类型 xsmc */
        type: i.xsmc,
        /** 开课类型 kklxmc */
        selectionType: i.kklxmc,
        /** 课程分类 kcfl */
        classification: i.kcfl,
        /** 课程归属 kcgsmc */
        belongTo: i.kcgsmc,
        /** 学制 kcxzmc*/
        system: i.kcxzmc,
        /** 教师名称 jsmc*/
        teacher: i.jsmc,

        credit: i.xf,
    };
});

export const CourseListResScheme = z.object({
    currentPage: z.number(),
    totalPage: z.number(),
    totalCount: z.number(),
    items: z.array(CourseListSchema),
});

export type CourseList = z.infer<typeof CourseListSchema>;
