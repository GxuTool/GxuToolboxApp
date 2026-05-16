import {z} from "zod";

const rawClassList = z
    .array(
        z.object({
            bjmc: z.string(),
            jgmc: z.string(),
            xkrs: z.string().transform(Number),
            zymc: z.string(),

            xnm: z.string().transform(Number),
            xqm: z.string(),
            jgdm: z.string(),
            zyh_id: z.string(),
            bh_id: z.string(),
            njdm_id: z.string().transform(Number),
        }),
    )
    .default([]);

export const IClassList = rawClassList.transform(arr =>
    arr.map(i => ({
        className: i.bjmc,
        majorName: i.zymc,
        gradeName: i.jgmc,
        studentCount: i.xkrs,

        year: i.xnm,
        term: i.xqm,
        schoolId: i.jgdm,
        majorId: i.zyh_id,
        classId: i.bh_id,
        gradeId: i.njdm_id,
    })),
);

export type IClassList = z.infer<typeof IClassList>;
