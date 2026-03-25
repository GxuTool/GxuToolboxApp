import {useCallback, useEffect, useState} from "react";
import {store} from "@/core/store.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {courseApi} from "@/js/jw/course.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {normalizeCourse} from "@/features/courseSchedule/utils/normalizeCourse.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";

export function useBaseCourse(year: number, term: SchoolTermValue):ScheduleTableItem[] {
    const [courseSchedule, setCourseSchedule] = useState<ScheduleTableItem[]>();

    const fetchCourse = useCallback(async () => {
        const processAndSet = (raw: any, shouldCache: boolean) => {
            if (!raw) return;

            // 总是解析
            const parsed = ICourse.safeParse(raw);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }

            const newModel = normalizeCourse(parsed.data);
            setCourseSchedule(currentModel => {
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
        } catch (e) {

        }

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
        fetchCourse();
    }, [fetchCourse]);

    return courseSchedule;
}
