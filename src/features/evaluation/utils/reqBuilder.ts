import {Evaluation, EvaluationRequest} from "@/features/evaluation/types/evaluation.type.ts";

export function createDefaultReq(
    evaluationItem: Evaluation,
    idObj: any,
): EvaluationRequest {
    return {
        jgh_id: evaluationItem.jgh_id,
        jxb_id: evaluationItem.jxb_id,
        kch_id: evaluationItem.kch_id,
        modelList: [
            {
                pjmbmcb_id: idObj.panelId,
                pjdxdm: "01", // 写死才能向“未评”的提交评价
                xspfb_id: idObj.formId,
                fxzgf: null,
                pjzt: "0",
                py: "",
                // 使用 map 基于解析出的数据动态生成列表
                xspjList: idObj.sections.map(section => ({
                    pjzbxm_id: section.sectionId,
                    childXspjList: section.questions.map(question => ({
                        zsmbmcb_id: question.zsId,
                        pjzbxm_id: question.pjId,
                        pfdjdmb_id: question.pfId,
                        pfdjdmxmb_id: null, // 初始为空，待用户选择后填充
                    })),
                })),
            },
        ],
        xsdm: "01",
        ztpjbl: 100,
    };
}

/**
 * 用用户的答案和评语填充请求对象
 */
export function fillReq(
    req: EvaluationRequest,
    selected: Record<string, Record<string, Record<string, number>>>,
    comment: string,
    ids: any
): EvaluationRequest {
    // 使用深拷贝防止意外修改原始 state
    const newReq: EvaluationRequest = JSON.parse(JSON.stringify(req));

    if (newReq.modelList[0]) {
        newReq.modelList[0].py = comment;
    }

    let count = 0;
    for (const teacherIdx in selected) {
        for (const categoryIdx in selected[teacherIdx]) {
            count += Object.keys(selected[teacherIdx][categoryIdx]).length;
        }
    }
    // 总共有16个问题
    const totalQuestions = ids.sections.reduce((sum, section) => sum + section.questions.length, 0);
    if (newReq.modelList[0]) {
        newReq.modelList[0].pjzt = count === totalQuestions ? "1" : "0";
    }

    for (const teacherIdx in selected) {
        for (const categoryIdx in selected[teacherIdx]) {
            for (const itemIdx in selected[teacherIdx][categoryIdx]) {
                const optionIdx = selected[teacherIdx][categoryIdx][itemIdx];
                const categoryIndex = Number(categoryIdx);
                const itemIndex = Number(itemIdx);

                const targetQuestion = newReq.modelList?.[0]?.xspjList?.[categoryIndex]?.childXspjList?.[itemIndex];
                const optionId = ids.sections?.[categoryIndex]?.questions?.[itemIndex]?.optionIds?.[optionIdx];

                if (targetQuestion && optionId) {
                    targetQuestion.pfdjdmxmb_id = optionId;
                }
            }
        }
    }

    return newReq;
}
