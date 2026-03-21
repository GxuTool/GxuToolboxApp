import {SchoolTermValue} from "@/type/global.ts";
import {useBaseCourse} from "@/features/courseSchedule/hooks/detail/useBaseCourse.ts";
import {store} from "@/core/store.ts";
import {useCallback, useEffect, useState} from "react";
import {courseApi} from "@/js/jw/course.ts";
import {IPhyExp} from "@/features/courseSchedule/type/schema/phyExp.ts";
import {useStartDay} from "@/features/courseSchedule/hooks/detail/useStartDay.ts";
import moment from "moment";

export function usePhyExp(year: number, term: SchoolTermValue): any[] {
    const courseSchedule = useBaseCourse(year, term);
    const [phyExpList, setPhyExpList] = useState<any[]>([]);
    const startDay = useStartDay(year, term);

    const fetchExpCourse = useCallback(async () => {
        if (!courseSchedule || !Array.isArray(courseSchedule) || courseSchedule.length === 0) {
            return;
        }

        // 先找有没有物理实验课
        const hasExp = courseSchedule.find(item => item.title && item.title.includes("物理实验"));
        if (!hasExp) {
            return;
        }

        const processAndSet = (raw: any, shouldCache: boolean) => {
            if (!raw) return;
            const parsed = IPhyExp.safeParse(raw.data);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }
            const newModel = parsed.data.map(item => ({
                ...item,
                week: moment(item.date).diff(startDay, "week") + 1,
                day: moment(item.date).day(),
            }));

            if (shouldCache) {
                store.save({key: "originalPhyExpList", data: raw});
            }

            setPhyExpList(currentModel => {
                if (JSON.stringify(currentModel) === JSON.stringify(newModel)) {
                    return currentModel;
                }
                return newModel;
            });
        };

        // 从内存中加载缓存
        try {
            const cachedRaw = await store.load({key: "originalPhyExpList"}).catch(() => null);
            if (cachedRaw) {
                processAndSet(cachedRaw, false);
            }
        } catch (e) {}

        // 从统一认证拿详细课表
        try {
            const fetchedRaw = await courseApi.getPhyExpList();
            if (fetchedRaw) {
                processAndSet(fetchedRaw, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        }
    }, [year, term, courseSchedule, startDay]);

    useEffect(() => {
        fetchExpCourse();
    }, [fetchExpCourse]);

    return phyExpList;
}
