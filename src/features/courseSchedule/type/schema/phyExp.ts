import { z } from "zod";

const rawPhyExp = z.array(z.object({
    // 教室
    fjbh: z.string(),
    // 实验名
    xmmc: z.string(),
    // 上课日期
    skrq: z.string(),
    // 上课时间
    sksj: z.string(),
    // 上课老师
    zjjsxm: z.string().optional()
})).default([]);

export const IPhyExp = rawPhyExp.transform(arr =>
    arr.map(i => ({
        course: i.xmmc,
        classroom: i.fjbh,
        date: i.skrq,
        time: i.sksj,
        teacher: i.zjjsxm
    }))
);

export type IPhyExp = z.infer<typeof IPhyExp>
