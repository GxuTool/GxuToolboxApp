import {QueryModel, SchoolTermValue, SchoolValue, strNum, UserModel} from "@/type/global.ts";

export interface Course {
    /** 在课程表中显示的背景颜色 */
    backgroundColor: string;
    /** ？ */
    bklxdjmc: string;
    /** 场地ID */
    cd_id: string;
    /** 场地-班号 */
    cdbh: string;
    /** 场地类别名称 */
    cdlbmc: string;
    /** 场地名称 */
    cdmc: string;
    /** 重修班级？ */
    cxbj: string;
    /** 重修班级名称 */
    cxbjmc: string;
    /** 中文查询日期 */
    date: string;
    /** 数字查询日期 */
    dateDigit: string;
    /** 分隔符数字查询日期 */
    dateDigitSeparator: string;
    /** （年月）日 */
    day: string;
    /** 节次 */
    jc: string;
    /** 节次（其它） */
    jcor: string;
    /** 节次数 */
    jcs: string;
    /** 机构号ID */
    jgh_id: string;
    /** 机构排选制度 */
    jgpxzd: string;
    /** 教学班ID */
    jxb_id: string;
    /** 教学班名称 */
    jxbmc: string;
    /** 是否调课 */
    jxbsftkbj: string;
    /** 教学班组成 */
    jxbzc: string;
    /** 课程标记 */
    kcbj: string;
    /** 课程号 */
    kch: string;
    /** 课程号ID */
    kch_id: string;
    /** 课程类别 */
    kclb: string;
    /** 课程名称 */
    kcmc: string;
    /** 课程学时组成 */
    kcxszc: string;
    /** 课程选择 */
    kcxz: string;
    /** 课程总学时 */
    kczxs: string;
    /** 考核方式名称 */
    khfsmc: string;
    /** 开课状态 */
    kkzt: string;
    /** 楼号 */
    lh: string;
    /** 列表导航 */
    listnav: string;
    /** 本地化键 */
    localeKey: string;
    /** 月份 */
    month: string;
    /** 旧节次 */
    oldjc: string;
    /** 旧周次 */
    oldzc: string;
    /** 总页数 */
    pageTotal: number;
    /** 是否可翻页 */
    pageable: boolean;
    /** 排课班级 */
    pkbj: string;
    /** 排序？ */
    px: string;
    /** QQ群号 */
    qqqh: string;
    /** 查询模型 */
    queryModel: QueryModel;
    /** 可否范围内选择 */
    rangeable: boolean;
    /**  */
    rk: string;
    /**  */
    rsdzjs: number;
    /**  */
    sfjf: string;
    /** 授课方式名称 */
    skfsmc: string;
    /** ？？标记 */
    sxbj: string;
    /** 总结果 */
    totalResult: string;
    userModel: UserModel;
    /** 学分 */
    xf: string;
    /** 选课备注 */
    xkbz: string;
    /** 姓名 */
    xm: string;
    /** 学年名 */
    xnm: string;
    /** 学期？？ */
    xqdm: string;
    /** 学期号 */
    xqh1: string;
    /** 学期号ID */
    xqh_id: string;
    /** 星期几 */
    xqj: string;
    /** 星期几名称 */
    xqjmc: string;
    /** 学期名 */
    xqm: string;
    /** 学期名称 */
    xqmc: string;
    /** 学生代码 */
    xsdm: string;
    /** 学生类型标记 */
    xslxbj: string;
    year: string;
    /** 周？？ */
    zcd: string;
    /** 职称名称 */
    zcmc: string;
    /**  */
    zfjmc: string;
    /** 周h学时 */
    zhxs: string;
    /** 总学时 */
    zxs: string;
    /**  */
    zxxx: string;
    /** 专业方向名称 */
    zyfxmc: string;
    /** 专业核心课程标记 */
    zyhxkcbj: string;
    /** 政治面貌 */
    zzmm: string;
    /**  */
    zzrl: string;
}

export interface PracticalCourse {
    /** 在课程表中显示的背景颜色 */
    backgroundColor: string;
    dateDigit: string;
    dateDigitSeparator: string;
    day: string;
    jgpxzd: string;
    jsxm: string;
    jxbzh: string;
    kclb: string;
    kcmc: string;
    listnav: string;
    localeKey: string;
    month: string;
    pageTotal: number;
    pageable: boolean;
    qsjsz: string;
    qtkcgs: string;
    rangeable: boolean;
    rsdzjs: number;
    sfsjk: string;
    sjkcgs: string;
    totalResult: string;
    xf: string;
    xksj: string;
    xnmc: string;
    xqmc: string;
    xqmmc: string;
    year: string;
}

export interface CourseTag {
    /** 英文文本 */
    ywxsmc?: string;
    /** 对应的符号 */
    xslxbj: string;
    /** 对应的中文文本 */
    xsmc: string;
    /** 某种序号 */
    xsdm: string;
}

/** 课程表类型 */
export interface CourseSchedule {
    /**  */
    bjmc: string;
    /**  */
    date: string;
    /**  */
    dateDigit: string;
    /**  */
    dateDigitSeparator: string;
    /**  */
    day: string;
    /**  */
    id: string;
    /**  */
    jgdm: SchoolValue;
    /**  */
    month: string;
    /**  */
    njdm: string;
    /**  */
    pageTotal: number;
    /**  */
    row_id: string;
    /**  */
    rsdzjs: number;
    /**  */
    sfkckkb: boolean;
    /** 课表名称 */
    tjkbmc: string;
    /**  */
    tjkbzdm: string;
    /**  */
    tjkbzxsdm: string;
    /**  */
    xkrs: string;
    /**  */
    xnm: string;
    /**  */
    xnmc: string;
    /** 学期 */
    xqm: SchoolTermValue;
    /**  */
    xqmc: string;
    /**  */
    xqmmc: string;
    /**  */
    xsxyxh: number;
    /**  */
    year: string;
}

/** 物理实验课 */
export interface PhyExp {
    /** 实验课唯一ID，主键 */
    id: strNum;
    /** 周次 */
    zc: strNum;
    /** 班级名称 */
    bjmc: string;
    /** 上课日期 */
    skrq: string;
    /** 上课时间 */
    sksj: string;
    /** 人数 */
    rs: strNum;
    /** 课程名称 */
    kcmc: string;
    /** 实验名称 */
    xmmc: string;
    /** 教师名称，带有入职ID，例王潇漾(20230073) */
    zjjs: string;
    /** 教师姓名 */
    zjjsxm: string;
    /** 星期 */
    xq: strNum;
    /** 上课地点 */
    fjbh: string;
    /** 实验室名称 */
    sysmc: string;
}

/** 选课分页类型 */
export enum CourseListTypeId {
    Major = "01",
    Optional = "10",
    PE = "05",
    Special = "09",
    Other = "11",
}
export interface CourseSelectionListItem {
    /** 保留原因人数 */
    blyxrs: string;
    /** 比例占用率 */
    blzyl: string;
    /** 重修班级标识 */
    cxbj: string;
    /** 中文格式日期 */
    date: string;
    /** 数字格式日期 */
    dateDigit: string;
    /** 分隔符格式日期 */
    dateDigitSeparator: string;
    /** 日 */
    day: string;
    /** 方向班级标识 */
    fxbj: string;
    /** 机构排选制度 */
    jgpxzd: string;
    /** 教学班ID */
    jxb_id: string;
    /** 教学班名称 */
    jxbmc: string;
    /** 教学班学分 */
    jxbxf: string;
    /** 教学班总人数 */
    jxbzls: string;
    /** 课程号 */
    kch: string;
    /** 课程号ID */
    kch_id: string;
    /** 课程类型名称 */
    kclxmc: string;
    /** 课程名称 */
    kcmc: string;
    /** 课程行 */
    kcrow: string;
    /** 课程类型代码 */
    kklxdm: CourseListTypeId;
    /** 课程种类名称 */
    kzmc: string;
    /** 列表导航 */
    listnav: string;
    /** 本地化键 */
    localeKey: string;
    /** 月份 */
    month: string;
    /** 总页数 */
    pageTotal: number;
    /** 是否可分页 */
    pageable: boolean;
    /** 查询模型 */
    queryModel: QueryModel;
    /** 是否可范围选择 */
    rangeable: boolean;
    /** 任务总学时 */
    rwzxs: string;
    /** 总结果数 */
    totalResult: string;
    /** 用户模型 */
    userModel: UserModel;
    /** 学分 */
    xf: string;
    /** 选修课班级 */
    xxkbj: string;
    /** 年份 */
    year: string;
    /** 已选人数 */
    yxzrs: string;
    /** 主从跟班标识 */
    zcongbj: string;
};


