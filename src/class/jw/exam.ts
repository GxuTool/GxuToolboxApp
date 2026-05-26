import {BaseZodClass} from "@/class/class.ts";
import {ExamInfo, ExamInfoSchema} from "@/type/infoQuery/exam/examInfo.ts";

/** 考试信息类，解析后的数据存储在 `transformed` 中，原始数据存储在 `_ori` 中 */
export class ExamInfoClass extends BaseZodClass<typeof ExamInfoSchema, ExamInfo> {
    constructor(ori: ExamInfo) {
        const rawOri = ori instanceof ExamInfoClass ? ori._ori : ori;
        super(ExamInfoSchema, rawOri);
    }
}
