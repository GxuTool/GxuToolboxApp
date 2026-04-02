import {useCallback, useEffect, useState} from "react";
import {store} from "@/core/store.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {IExam} from "@/features/courseSchedule/type/schema/exam.ts";
import {normalizeExam} from "@/features/courseSchedule/utils/normalizeExam.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import {examApi} from "@/js/jw/exam.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useExam(year: number, term: SchoolTermValue): {
    items: ScheduleTableItem[];
    refresh: () => Promise<void>
} {
    const [examSchedule, setExamSchedule] = useState<ScheduleTableItem[]>();
    const startDay = useStartDay(year, term);

    const fetchExam = useCallback(async () => {
        const processAndSet = (raw: any, shouldCache: boolean) => {
            if (!raw) return;

            // 总是解析
            const parsed = IExam.safeParse(raw.items);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }
            const newModel = normalizeExam(parsed.data, startDay);
            setExamSchedule(currentModel => {
                if (JSON.stringify(currentModel) === JSON.stringify(newModel)) {
                    return currentModel;
                }
                if (shouldCache) {
                    store.save({key: "originalExamList", data: raw});
                }
                return newModel;
            });
        };

        // 从内存中加载考试缓存
        try {
            const cachedRaw = await store.load({key: "originalExamList"}).catch(() => null);
            if (cachedRaw) {
                processAndSet(cachedRaw, false);
            }
        } catch (e) {}

        try {
            const fetchedRaw = await examApi.getExamInfo(year, term);
            if (fetchedRaw) {
                processAndSet(fetchedRaw, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        }
    }, [year, term]);

    useEffect(() => {
        fetchExam();
    }, [fetchExam]);

    return {items: examSchedule, refresh: fetchExam};
}
