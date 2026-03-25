import {ReactNode} from "react";
import moment from "moment";
export interface TimeScheduleItemData<T = any> {
    /** 元素数据 */
    data: T[];
    /** 元素渲染 */
    itemRender?: (item: T, onPressHook?: (item: T) => void) => ReactNode;
    /** 判断元素是否在当天渲染 */
    isItemShow?: (item: T, day: moment.Moment, week: number) => boolean;
}

export interface ScheduleTableItem {
    id: string;
    week: number;
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    begin: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    end: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
    title: string;
    subtitle?: string;
    location?: string;
    teacher?: string;
    color?: string;
    kind?: string;
    seat?: string;
    status?: number;
    isShift?: boolean;
    raw?: any;  // 原始 API 数据，暂时用于详情展示
}
