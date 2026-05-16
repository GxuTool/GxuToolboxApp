/**
 * 为获得原始HTML需要的数据
 */
export interface EvaPOST  {
    /** 提交状态 */
    tjztmc: string;
    /** 教工号ID */
    jgh_id: string;
    /** 教学班ID */
    jxb_id: string;
    /** 课程号ID */
    kch_id: string;
    /** 学号代码 */
    xsdm: string;
    /** 评价模板ID */
    pjmbmcb_id: string;
    /** 教师名称 */
    jzgmc: string;
    /** 课程名称 */
    kcmc: string;
}

/**
 * 单个评价指标
 */
export interface Indicator {
    /** 指标ID */
    id: string;
    /** 指标名称 */
    name: string;
    /** 分数选项 */
    options: {
        /** 选项ID */
        id: string;
        /** 选项名称 (e.g., "优秀") */
        name: string;
    }[];
}

/**
 * 评价详情页的完整数据结构
 */
export interface EvaluationDetail {
    /** 评价指标列表 */
    indicators: Indicator[];
    /** 教师姓名 */
    teacherName: string;
    /** 课程名称 */
    courseName: string;
    /** 提交评价所需的隐藏参数 */
    hiddenInputs: Record<string, string>;
}
