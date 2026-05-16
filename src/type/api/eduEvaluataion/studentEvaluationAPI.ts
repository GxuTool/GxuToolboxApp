import {QueryResRoot} from "@/type/global.ts";
import {Evaluation} from "@/features/evaluation/types/evaluation.type.ts";

/** 评价列表信息查询返回结果数据类型 */
export interface EvaListQueryRes extends QueryResRoot<Evaluation> {}

/** 评价HTML查询返回结果数据类型 */
export interface EvaHTMLQueryRes extends QueryResRoot<string> {}
