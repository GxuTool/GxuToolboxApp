import {z} from "zod";
import {ExamScore} from "@/type/infoQuery/exam/examScore.ts";

const examScoreSchema = z.object({
    xm: z.string(),
    kcmc: z.string(),
    cj: z.coerce.number(),
    xf: z.coerce.number(),
    jd: z.number(),
    jxb_id: z.string(),
});
type examScoreDTO = z.infer<typeof examScoreSchema>;

export function washExamScore(res: any){
    const result = z.array(examScoreSchema).safeParse(res);
    if (!result.success) return [];
    const cleanData:ExamScore[] = result.data.map((r: examScoreDTO)=> {
        return {
            studentName: r.xm,
            courseName: r.kcmc,
            score: r.cj,
            credit: r.xf,
            gradePoint: r.jd,
            classroomId: r.jxb_id,
        };
    });
    return cleanData;
}
