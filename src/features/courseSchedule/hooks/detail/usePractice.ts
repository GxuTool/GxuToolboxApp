import {useCallback, useEffect, useState} from "react";
import {store} from "@/core/store.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {courseApi} from "@/js/jw/course.ts";

export function usePractice(year: number, term: SchoolTermValue): ICourse["practiceList"] {
    const [practiceList, setPracticeList] = useState<ICourse["practiceList"]>();

    const fetchPractice = useCallback(async () => {
        const processAndSet = (raw: any, shouldCache: boolean) => {
            if (!raw) return;

            // 总是解析
            const parsed = ICourse.safeParse(raw);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }

            const newModel = parsed.data.practiceList;
            setPracticeList(currentModel => {
                if (JSON.stringify(currentModel) === JSON.stringify(newModel)) {
                    return currentModel;
                }
                if (shouldCache) {
                    store.save({key: "originalCourseList", data: raw});
                }
                return newModel;
            });
        };

        // 从内存中加载课程缓存
        try {
            const cachedRaw = await store.load({key: "originalCourseList"}).catch(() => null);
            if (cachedRaw) {
                processAndSet(cachedRaw, false);
            }
        } catch (e) {}

        try {
            const fetchedRaw = await courseApi.getCourseSchedule(year, term);
            if (fetchedRaw) {
                processAndSet(fetchedRaw, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        }
    }, [year, term]);

    useEffect(() => {
        fetchPractice();
    }, [fetchPractice]);

    return practiceList;
}
