import {SchoolTermValue} from "@/type/global.ts";
import {ScheduleTableItem} from "@/components/tool/infoQuery/courseSchedule/CourseScheduleTable.tsx";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {usePhyExp} from "@/features/courseSchedule/hooks/detail/usePhyExp.ts";
import {useMemo} from "react";

export function useCourse(year: number, term: SchoolTermValue): ScheduleTableItem[] {
    const baseCourse = useBaseCourse(year, term) || [];
    const phyExpList = usePhyExp(year, term) || [];

    // 🚨 抓鬼第一步：把 log 挪到 useMemo 外面！
    // 只有放在这里，你才能看到这两个钩子在异步请求期间，到底触发了多少次重渲染
    console.log(`【渲染追踪】主课表: ${baseCourse.length} 节 | 物理实验: ${phyExpList.length} 节`);

    const final = useMemo(() => {
        // 如果主课表还没加载完，直接原样返回，不要阻断后续逻辑
        if (baseCourse.length === 0) return [];

        // 确保是数组类型再执行 map，防止外部接口返回包裹对象（如 { data: [...] }）
        const safePhyList = Array.isArray(phyExpList) ? phyExpList : [];
        const phyDict = new Map(safePhyList.map(item => [`${item.week}-${item.day}`, item]));

        return baseCourse.map(course => {
            let enrichedCourse = {...course};

            // 🚨 抓鬼第二步：绝对不要用 === "大学物理实验"！
            // 后端极有可能返回 "大学物理实验 "（带空格）或者 "物理实验（上）"，用 includes 最稳妥
            if (enrichedCourse.title && enrichedCourse.title.includes("物理实验")) {
                const searchKey = `${course.week}-${course.day}`;

                if (phyDict.has(searchKey)) {
                    const ext = phyDict.get(searchKey);
                    // 赋值替换
                    enrichedCourse.subtitle = ext.course;
                    enrichedCourse.teacher = ext.teacher;
                    enrichedCourse.location = ext.classroom;

                    console.log(`✅ 成功替换: ${searchKey} -> ${ext.course}`);
                } else {
                    // 如果进入了 IF 但没命中字典，说明 week-day 的格式对不上
                    console.log(`❌ 字典未命中, 正在查找 Key: ${searchKey}`);
                }
            }
            return enrichedCourse;
        });
    }, [baseCourse, phyExpList]);

    return final;
}
