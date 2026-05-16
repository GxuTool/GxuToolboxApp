import {store} from "@/core/store.ts";
import {ICourse} from "@/features/courseSchedule/type/schema/course.ts";
import {courseApi} from "@/js/jw/course.ts";
import {SchoolTermValue} from "@/type/global.ts";
import {normalizeCourse} from "@/features/courseSchedule/utils/normalizeCourse.ts";
import {ScheduleTableItem} from "@/features/courseSchedule/type/schedule.ts";
import {Course} from "@/type/infoQuery/course/course.ts";
import {CourseScheduleQueryRes} from "@/type/api/infoQuery/classScheduleAPI.ts";
import {create} from "zustand/react";

interface BaseCourseStoreState {
    rawCourseList: Course[];
    courseList: ScheduleTableItem<Course>[];
    loading: boolean;
}

const useBaseCourseStore = create<BaseCourseStoreState>()(() => ({
    rawCourseList: [],
    courseList: [],
    loading: false,
}));

export const useBaseCourse = () => {
    async function init(year: number, term: SchoolTermValue) {
        useBaseCourseStore.setState({loading: true});

        const setData = (raw: CourseScheduleQueryRes, shouldCache: boolean) => {
            if (!raw) return;

            const parsed = ICourse.safeParse(raw);
            if (!parsed.success) {
                console.warn("解析原始数据失败", parsed.error);
                return;
            }

            const newModel = normalizeCourse(parsed.data);

            if (shouldCache) {
                store.save({key: "originalCourseList", data: raw});
            }

            const current = useBaseCourseStore.getState().courseList;
            if (JSON.stringify(current) === JSON.stringify(newModel)) return;
            useBaseCourseStore.setState({
                rawCourseList: raw.kbList,
                courseList: newModel,
            });
        };

        try {
            const cachedRaw = await store.load<CourseScheduleQueryRes>({key: "originalCourseList"}).catch(() => null);
            if (cachedRaw) {
                setData(cachedRaw, false);
            }
        } catch {}

        try {
            const classInstance = await courseApi.getCourseSchedule(year, term);
            if (classInstance) {
                setData(classInstance._ori, true);
            }
        } catch (e) {
            console.warn("网络请求失败", e);
        } finally {
            useBaseCourseStore.setState({loading: false});
        }
    }

    return {
        store: useBaseCourseStore,
        init,
    };
};
