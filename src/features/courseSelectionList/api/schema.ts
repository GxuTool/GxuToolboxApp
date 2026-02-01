import {z} from "zod";


const rawItem = z.object({
    kcmc: z.string(),
    xsmc: z.string(),
});

export const CourseListSchema = rawItem.transform(i => {
    return {
        /** 课程名称 */
        courseName: i.kcmc,
        type: i.xsmc,
    };
});

export const CourseListResScheme = z.object({
    currentPage: z.number(),
    totalPage: z.number(),
    totalCount: z.number(),
    items: z.array(CourseListSchema),
});
