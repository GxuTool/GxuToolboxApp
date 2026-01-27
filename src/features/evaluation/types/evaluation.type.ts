// 发请求获取评价总况的必备参数
export interface Evaluation {
    /** 教工号ID（疑似经SHA256加密）*/
    jgh_id: string;
    /** 教学班ID */
    jxb_id: string;
    /** 课程号ID */
    kch_id: string;
    /** 学生代码 */
    xsdm: string;
    /** ? */
    pjmbmcb_id: string;

    // 前端显示
    /** 评价状态 */
    tjztmc: string;
    /** 教师姓名 */
    jzgmc: string;
    /** 课程名称 */
    kcmc: string;

    xsmc: string;
}

// 评价ID（传上教务系统的）
export interface EvaluationRequest {
    ztpjbl: number;
    jxb_id: string;
    jgh_id: string;
    kch_id: string;
    xsdm: string;

    modelList: EvaluationRequestModel[];
}

export interface EvaluationIds {
    formId: string;
    panelId: string;
    sections: EvaluationIdSection[];
}

/**
 * 教务系统完全不在后端做校验，仅靠前端传过去的这个数字标注状态——
 * 0:“未评完" 1:“已评完”
 **/
type EvaluationStatus = "0" | "1";

interface EvaluationIdSection {
    sectionId: string;
    questions: EvaluationIdQuestion[];
}

interface EvaluationIdQuestion {
    pfId: string;
    pjId: string;
    zsId: string;
    optionIds: string[];
}

interface EvaluationRequestModel {
    // 评价模版名称ID
    pjmbmcb_id: string;
    // 教务系统的前端仅判断这里是否全等“01”，如果全等才做下一步的各种操作
    pjdxdm: string;
    // 反向最高分
    fxzgf: null;
    // 评语
    py: string;
    // 学生评分表ID
    xspfb_id: string;
    // 评价状态
    pjzt: EvaluationStatus;
    xspjList: EvaluationRequestSection[];
}

interface EvaluationRequestSection {
    pjzbxm_id: string;
    childXspjList: EvaluationRequestItem[];
}

interface EvaluationRequestItem {
    // 以下三个参数，无论选项是否为空，都必须传入

    // 真实模板名称表id
    zsmbmcb_id: string;
    // 二级评价指标项目ID
    pjzbxm_id: string;
    // 评分等级代码ID
    pfdjdmb_id: string;
    // 二级评分等级代码项目ID——这个参数决定选哪个选项，不选则不传
    pfdjdmxmb_id?: string[5];
}
